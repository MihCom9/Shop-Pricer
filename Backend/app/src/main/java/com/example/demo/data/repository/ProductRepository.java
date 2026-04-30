package com.example.demo.data.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.data.Product;
import com.example.demo.model.Category.CategoryInfo;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Slice<Product> findAllBy(Pageable page);

    // ── Main fuzzy search (used by ShoppingService) ──────────────────────────

    @Query(value = """
        WITH base AS MATERIALIZED (
            SELECT
                pt.id,
                c.ekatte                     AS city,
                sl.location                  AS store,
                s.name                       AS full_store_name,
                prod.name                    AS product_name,
                prod.code                    AS code,
                cat.cid::text                AS category,
                pt.price,
                pt.price_promotion,
                pt.measurements
            FROM product_test pt
            JOIN products  prod ON prod.id = pt.product_id
            JOIN store_locations sl ON sl.id = pt.store_id
            JOIN stores s ON s.id = sl.store_id
            JOIN cities    c    ON c.id    = pt.city_id
            JOIN categories cat ON cat.id  = pt.category_id
            WHERE c.ekatte      = :city
            AND cat.cid::text = :category
        ),
        cleaned AS (
            SELECT
                bf.*,
                trim(regexp_replace(upper(bf.product_name),
                    '(\\d+[.,]?\\d*\\s*(?:%|Г|ГР|КГ|МЛ|Л))', '', 'gi')) AS clean_product,
                trim(regexp_replace(upper(:name),
                    '(\\d+[.,]?\\d*\\s*(?:%|Г|ГР|КГ|МЛ|Г|Л))', '', 'gi')) AS clean_query
            FROM base bf
        ),
        scored AS (
            SELECT
                bf.*,
                CASE
                    WHEN trim(bf.clean_query) = '' THEN 1.0
                    ELSE word_similarity(
                        array_to_string(array(SELECT unnest(string_to_array(bf.clean_product, ' ')) ORDER BY 1), ' '),
                        array_to_string(array(SELECT unnest(string_to_array(bf.clean_query,   ' ')) ORDER BY 1), ' ')
                    )
                END AS word_score,
                array_length(string_to_array(trim(bf.clean_query), ' '), 1) AS word_count,
                NOT EXISTS (
                    SELECT 1
                    FROM unnest(ARRAY(
                        SELECT replace(regexp_replace(match[1], '\\s+', '', 'g'), 'ГР', 'Г')
                        FROM regexp_matches(upper(:name),
                            '(\\d+[.,]?\\d*\\s*(?:%|ГР|КГ|МЛ|Г|Л))', 'g') AS match
                    )) AS q_unit
                    WHERE regexp_replace(upper(bf.product_name), '(\\d+[.,]?\\d*)\\s+(ГР|КГ|МЛ|Г|Л|%)', '\\1\\2', 'g') !~ ('(^|[^0-9,\\.])' || q_unit || '([^0-9,\\.]|$)')
                    AND (bf.measurements IS NULL OR regexp_replace(upper(bf.measurements), '(\\d+[.,]?\\d*)\\s+(ГР|КГ|МЛ|Г|Л|%)', '\\1\\2', 'g') !~ ('(^|[^0-9,\\.])' || q_unit || '([^0-9,\\.]|$)'))
                ) AS units_match,
                word_similarity(
                    array_to_string(
                        ARRAY(
                            SELECT replace(regexp_replace(match[1], '\\s+', '', 'g'), 'ГР', 'Г')
                            FROM regexp_matches(upper(:name),
                                '(\\d+[.,]?\\d*\\s*(?:%|ГР|КГ|МЛ|Г|Л))', 'g') AS match
                        ), ' '
                    ),
                    upper(COALESCE(bf.measurements, ''))
                ) AS measurement_score
            FROM cleaned bf
        ),
        -- Only rows that pass the word score threshold (unchanged)
        word_filtered AS (
            SELECT *
            FROM scored
            WHERE word_score > CASE
                WHEN word_count = 1 THEN 0.18
                WHEN word_count = 2 THEN 0.41
                WHEN word_count = 3 THEN 0.75
                ELSE 0.80
            END
        ),
        -- For each store, check if it has ANY unit-matched product
        stores_with_unit_match AS (
            SELECT DISTINCT store
            FROM word_filtered
            WHERE units_match = true
        ),
        -- Stores that passed word score but have NO unit match at all
        stores_without_unit_match AS (
            SELECT DISTINCT store
            FROM word_filtered
            WHERE store NOT IN (SELECT store FROM stores_with_unit_match)
        ),
        -- All unit-matched products from stores that have them (same as your old top_results but not global)
        exact_results AS (
            SELECT *, 1 AS match_tier
            FROM word_filtered
            WHERE units_match = true
        ),
        -- For stores WITHOUT any unit match: take the 3 closest by measurement_score
        fallback_ranked AS (
            SELECT *,
                ROW_NUMBER() OVER (
                    PARTITION BY store
                    ORDER BY measurement_score DESC, COALESCE(price_promotion, price) ASC
                ) AS rn
            FROM word_filtered
            WHERE store IN (SELECT store FROM stores_without_unit_match)
        ),
        fallback_results AS (
            SELECT *, 2 AS match_tier
            FROM fallback_ranked
            WHERE rn <= 3
        )
        SELECT id, city, store, full_store_name, product_name, code, category,
            price, price_promotion, measurements, match_tier
        FROM (
            SELECT id, city, store, full_store_name, product_name, code, category,
                price, price_promotion, measurements, match_tier
            FROM exact_results
            UNION ALL
            SELECT id, city, store, full_store_name, product_name, code, category,
                price, price_promotion, measurements, match_tier
            FROM fallback_results
        ) combined
        ORDER BY match_tier ASC, COALESCE(price_promotion, price) ASC
        """, nativeQuery = true)
    List<Product> findMatchingProductsNew(
            @Param("city")     String city,
            @Param("category") String category,
            @Param("name")     String name
    );

    @Query(value = """
        SELECT
            pt.id,
            c.ekatte                     AS city,
            sl.location                       AS store,
            s.name                       AS full_store_name,
            prod.name                    AS product_name,
            prod.code                    AS code,
            cat.cid::text                AS category,
            pt.price,
            pt.price_promotion,
            pt.measurements,
            1                            AS match_tier
        FROM product_test pt
        JOIN products  prod ON prod.id = pt.product_id
        JOIN store_locations sl ON sl.id = pt.store_id
        JOIN stores s ON s.id = sl.store_id
        JOIN cities    c    ON c.id    = pt.city_id
        JOIN categories cat ON cat.id  = pt.category_id
        WHERE c.ekatte      = :city
          AND cat.cid::text = :category
    """, nativeQuery = true)
    List<Product> findMatchingProductsEmptyName(
            @Param("city")     String city,
            @Param("category") String category
    );

    // ── Promotions query ──────────────────────────────────────────────────────

    @Query(value = """
        WITH base AS MATERIALIZED (
            SELECT
                prod.name                AS productName,
                sl.location                   AS store,
                s.name                   AS storeName,
                cat.cid::text                       AS category,
                COALESCE(cat.name, cat.cid::text)   AS categoryName,
                pt.measurements AS measurements,
                trim(pt.price)           AS price,
                trim(pt.price_promotion) AS pricePromotion
            FROM product_test pt
            JOIN products   prod  ON prod.id  = pt.product_id
            JOIN store_locations sl ON sl.id = pt.store_id
            JOIN stores s ON s.id = sl.store_id
            JOIN cities     c     ON c.id     = pt.city_id
            JOIN categories cat   ON cat.id   = pt.category_id
            WHERE c.ekatte = :city
              AND trim(pt.price)           ~ '^[0-9]+([,.][0-9]+)?$'
              AND trim(pt.price_promotion) ~ '^[0-9]+([,.][0-9]+)?$'
              AND (CAST(:store AS TEXT) IS NULL
                OR s.name ILIKE CONCAT('%', :store, '%'))
              AND (CAST(:category AS TEXT) IS NULL
                OR COALESCE(cat.name, cat.cid::text) = :category)
              AND (CAST(:search AS TEXT) IS NULL
                OR prod.name ILIKE CONCAT('%', :search, '%'))
        ),
        scored AS MATERIALIZED (
            SELECT *,
                CAST(REPLACE(pricePromotion, ',', '.') AS NUMERIC) AS promo_num,
                CAST(REPLACE(price,          ',', '.') AS NUMERIC) AS price_num
            FROM base
        ),
        grouped AS MATERIALIZED (
            SELECT
                productName, storeName, category, categoryName, price, pricePromotion, measurements,
                array_agg(store) AS locations,
                CAST(REPLACE(MAX(pricePromotion), ',', '.') AS NUMERIC) AS promo_num,
                CAST(REPLACE(MAX(price),          ',', '.') AS NUMERIC) AS price_num
            FROM scored
            WHERE promo_num > 0
            AND price_num > 0
            AND promo_num < price_num
            AND (1 - promo_num / price_num) * 100 >= :minDiscount
            GROUP BY productName, storeName, category, categoryName, price, pricePromotion, measurements
        )
        SELECT productName, storeName, category, categoryName, price, pricePromotion, locations, measurements,
        (1 - promo_num / price_num) AS discount_perc, promo_num
        FROM grouped
            """, nativeQuery = true)
    List<PromotionProjection> findPromotions(
            @Param("city")        String city,
            @Param("store")       String store,
            @Param("category")    String category,
            @Param("search")      String search,
            @Param("minDiscount") int minDiscount,
            Pageable pageable
    );

    @Query(value = """
        WITH base AS MATERIALIZED (
            SELECT
                prod.name                           AS productName,
                sl.location                         AS store,
                s.name                              AS storeName,
                cat.cid::text                       AS category,
                COALESCE(cat.name, cat.cid::text)   AS categoryName,
                pt.measurements                     AS measurements,
                trim(pt.price)                      AS price,
                trim(pt.price_promotion)            AS pricePromotion
            FROM product_test pt
            JOIN products       prod  ON prod.id  = pt.product_id
            JOIN store_locations sl   ON sl.id    = pt.store_id
            JOIN stores         s     ON s.id     = sl.store_id
            JOIN cities         c     ON c.id     = pt.city_id
            JOIN categories     cat   ON cat.id   = pt.category_id
            WHERE c.ekatte = :city
            AND trim(pt.price) ~ '^[0-9]+([,.][0-9]+)?$'
            AND (CAST(:store AS TEXT) IS NULL
                OR s.name ILIKE CONCAT('%', :store, '%'))
            AND (CAST(:category AS TEXT) IS NULL
                OR COALESCE(cat.name, cat.cid::text) = :category)
            AND (CAST(:search AS TEXT) IS NULL
                OR prod.name ILIKE CONCAT('%', :search, '%'))
            AND prod.name NOT ILIKE '%НЗОК%'

        ),
        scored AS MATERIALIZED (
            SELECT *,
                CASE
                    WHEN trim(pricePromotion) ~ '^[0-9]+([,.][0-9]+)?$'
                    THEN CAST(REPLACE(trim(pricePromotion), ',', '.') AS NUMERIC)
                    ELSE NULL
                END AS promo_num,
                CAST(REPLACE(price, ',', '.') AS NUMERIC) AS price_num,
                CASE
                    WHEN trim(pricePromotion) ~ '^[0-9]+([,.][0-9]+)?$'
                        AND CAST(REPLACE(trim(pricePromotion), ',', '.') AS NUMERIC) > 0
                        AND CAST(REPLACE(trim(pricePromotion), ',', '.') AS NUMERIC)
                            < CAST(REPLACE(price, ',', '.') AS NUMERIC)
                    THEN CAST(REPLACE(trim(pricePromotion), ',', '.') AS NUMERIC)
                    ELSE CAST(REPLACE(price, ',', '.') AS NUMERIC)
                END AS effective_price
            FROM base
        ),
        grouped AS MATERIALIZED (
            SELECT
                productName, storeName, category, categoryName, price, pricePromotion, measurements,
                array_agg(store)    AS locations,
                MAX(price_num)      AS price_num,
                MAX(promo_num)      AS promo_num,
                MIN(effective_price) AS effective_price
            FROM scored
            WHERE (:promotionsOnly = false OR (
                promo_num IS NOT NULL
                AND promo_num > 0
                AND promo_num < price_num
                AND (1 - promo_num / price_num) * 100 >= :minDiscount
            ))
            GROUP BY productName, storeName, category, categoryName, price, pricePromotion, measurements
        )
        SELECT
            productName, storeName, category, categoryName, price, pricePromotion, locations, measurements,
            CASE
                WHEN promo_num IS NOT NULL AND promo_num > 0 AND promo_num < price_num
                THEN (1 - promo_num / price_num)
                ELSE 0
            END AS discount_perc,
            promo_num,
            effective_price
        FROM grouped
            """, nativeQuery = true)
    List<PromotionProjection> browseProducts(
            @Param("city")           String city,
            @Param("store")          String store,
            @Param("category")       String category,
            @Param("search")         String search,
            @Param("minDiscount")    int minDiscount,
            @Param("promotionsOnly") boolean promotionsOnly,
            Pageable pageable
    );

   @Query(value = """
            WITH scored AS (
                SELECT
                    pg.productname,
                    pg.storename,
                    pg.category,
                    COALESCE(cat.name, pg.category) AS categoryname,
                    pg.measurements,
                    pg.promo_num,
                    pg.price_num,
                    pg.effective_price,
                    pg.location_ids,
                    CASE
                        WHEN pg.promo_num IS NOT NULL AND pg.promo_num > 0 AND pg.promo_num < pg.price_num
                        THEN (1 - pg.promo_num / pg.price_num)
                        ELSE 0
                    END AS discount_perc,
                    CASE
                        WHEN CAST(:search AS TEXT) IS NULL OR trim(:search) = '' THEN 1.0
                        ELSE word_similarity(
                            array_to_string(array(SELECT unnest(string_to_array(
                                trim(regexp_replace(upper(pg.productname), '(\\d+[.,]?\\d*\\s*(?:%|Г|ГР|КГ|МЛ|Л))', '', 'gi'))
                            , ' ')) ORDER BY 1), ' '),
                            array_to_string(array(SELECT unnest(string_to_array(
                                trim(regexp_replace(upper(:search), '(\\d+[.,]?\\d*\\s*(?:%|Г|ГР|КГ|МЛ|Л))', '', 'gi'))
                            , ' ')) ORDER BY 1), ' ')
                        )
                    END AS word_score,
                    array_length(string_to_array(
                        trim(regexp_replace(upper(:search), '(\\d+[.,]?\\d*\\s*(?:%|Г|ГР|КГ|МЛ|Л))', '', 'gi'))
                    , ' '), 1) AS word_count,
                    CASE
                        WHEN CAST(:search AS TEXT) IS NULL OR trim(:search) = '' THEN true
                        ELSE NOT EXISTS (
                            SELECT 1
                            FROM unnest(ARRAY(
                                SELECT replace(regexp_replace(match[1], '\\s+', '', 'g'), 'ГР', 'Г')
                                FROM regexp_matches(upper(:search),
                                    '(\\d+[.,]?\\d*\\s*(?:%|ГР|КГ|МЛ|Г|Л))', 'g') AS match
                            )) AS q_unit
                            WHERE regexp_replace(upper(pg.productname), '(\\d+[.,]?\\d*)\\s+(ГР|КГ|МЛ|Г|Л|%)', '\\1\\2', 'g')
                                    !~ ('(^|[^0-9,\\.])' || q_unit || '([^0-9,\\.]|$)')
                            AND (pg.measurements IS NULL OR
                                regexp_replace(upper(pg.measurements), '(\\d+[.,]?\\d*)\\s+(ГР|КГ|МЛ|Г|Л|%)', '\\1\\2', 'g')
                                    !~ ('(^|[^0-9,\\.])' || q_unit || '([^0-9,\\.]|$)'))
                        )
                    END AS units_match
                FROM product_grouped pg
                LEFT JOIN categories cat ON cat.cid::text = pg.category
                WHERE pg.ekatte = :city
                AND (CAST(:store AS TEXT) IS NULL
                    OR pg.storename ILIKE CONCAT('%', :store, '%'))
                AND (CAST(:category AS TEXT) IS NULL
                    OR pg.category = :category)
                AND (:promotionsOnly = false OR (
                    pg.promo_num IS NOT NULL
                    AND pg.promo_num > 0
                    AND pg.promo_num < pg.price_num
                    AND (1 - pg.promo_num / pg.price_num) * 100 >= :minDiscount
                ))
            )
            SELECT
                productname,
                storename,
                category,
                categoryname,
                measurements,
                discount_perc,
                promo_num,
                price_num,
                effective_price,
                array_agg(sl.location) AS locations
            FROM scored
            JOIN store_locations sl ON sl.id = ANY(location_ids)
            WHERE (
                CAST(:search AS TEXT) IS NULL OR trim(:search) = ''
                OR (
                    word_score > CASE
                        WHEN word_count = 1 THEN 0.18
                        WHEN word_count = 2 THEN 0.41
                        WHEN word_count = 3 THEN 0.75
                        ELSE 0.80
                    END
                    AND units_match = true
                )
            )
            GROUP BY
                productname, storename, category, categoryname, measurements,
                discount_perc, promo_num, price_num, effective_price
            ORDER BY
                CASE WHEN :sorting = 'price_asc'  THEN effective_price END ASC,
                CASE WHEN :sorting = 'price_desc' THEN effective_price END DESC,
                CASE WHEN :sorting = 'discount'   THEN discount_perc   END DESC,
                discount_perc DESC
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<PromotionProjectionMaterialized> browseProductsMaterialized(
            @Param("city")           String city,
            @Param("store")          String store,
            @Param("category")       String category,
            @Param("search")         String search,
            @Param("minDiscount")    int minDiscount,
            @Param("promotionsOnly") boolean promotionsOnly,
            @Param("sorting")        String sorting,
            @Param("limit")          int limit,
            @Param("offset")         int offset
    );
    
    @Query(value = """
        SELECT COUNT(*)
        FROM product_grouped pg
        WHERE (CAST(:city AS TEXT) IS NULL OR pg.ekatte = :city)
        AND pg.promo_num IS NOT NULL
        AND pg.promo_num > 0
        AND pg.promo_num < pg.price_num
        AND (1 - pg.promo_num / pg.price_num) * 100 >= :minDiscount
        AND (CAST(:store AS TEXT) IS NULL
            OR pg.storename ILIKE CONCAT('%', :store, '%'))
        AND (CAST(:category AS TEXT) IS NULL
            OR pg.category = :category)
        AND (CAST(:search AS TEXT) IS NULL
            OR pg.productname ILIKE CONCAT('%', :search, '%'))
        """, nativeQuery = true)
    long countPromotions(
            @Param("city")        String city,
            @Param("store")       String store,
            @Param("category")    String category,
            @Param("search")      String search,
            @Param("minDiscount") int minDiscount
    );
    
    @Query(value = "SELECT COALESCE(name, cid::text) FROM categories ORDER BY cid", nativeQuery = true)
    List<String> findAllCategoryIds();

    @Query(value = "SELECT COALESCE(name, cid::text) as name, unit_type as unitType FROM categories ORDER BY cid", nativeQuery = true)
    List<CategoryInfo> findAllCategoriesWithUnitType();

}
