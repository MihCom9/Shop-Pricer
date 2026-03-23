package com.example.demo.data.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.data.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Slice<Product> findAllBy(Pageable page);

    // ── Main fuzzy search (used by ShoppingService) ──────────────────────────

    @Query(value = """
    WITH base AS MATERIALIZED (
        SELECT
            pt.id,
            c.ekatte                     AS city,
            s.location                       AS store,
            s.location                       AS full_store_name,
            prod.name                    AS product_name,
            prod.code                    AS code,
            cat.cid::text                AS category,
            pt.price,
            pt.price_promotion
        FROM product_test pt
        JOIN products  prod ON prod.id = pt.product_id
        JOIN stores    s    ON s.id    = pt.store_id
        JOIN cities    c    ON c.id    = pt.city_id
        JOIN categories cat ON cat.id  = pt.category_id
        WHERE c.ekatte        = :city
          AND cat.cid::text   = :category
    ),
    cleaned AS (
        SELECT
            bf.*,
            trim(regexp_replace(upper(bf.product_name),
                '(\\d+[.,]?\\d*\\s*(?:%|Г|ГР|КГ|МЛ|Л))', '', 'gi')) AS clean_product,
            trim(regexp_replace(upper(:name),
                '(\\d+[.,]?\\d*\\s*(?:%|Г|ГР|КГ|МЛ|Л))', '', 'gi')) AS clean_query
        FROM base bf
    ),
    scored AS (
        SELECT
            bf.*,
            word_similarity(
                array_to_string(array(SELECT unnest(string_to_array(bf.clean_product, ' ')) ORDER BY 1), ' '),
                array_to_string(array(SELECT unnest(string_to_array(bf.clean_query,   ' ')) ORDER BY 1), ' ')
            ) AS word_score,
            array_length(string_to_array(trim(bf.clean_query), ' '), 1) AS word_count,
            NOT EXISTS (
                SELECT 1
                FROM unnest(ARRAY(
                    SELECT match[1]
                    FROM regexp_matches(upper(:name),
                        '(\\d+[.,]?\\d*\\s*(?:%|Г|ГР|КГ|МЛ|Л))', 'g') AS match
                )) AS q_unit
                WHERE upper(bf.product_name) !~ ('(^|[^0-9,\\.])' || q_unit || '([^0-9,\\.]|$)')
            ) AS units_match
        FROM cleaned bf
    )
    SELECT id, city, store, full_store_name, product_name, code, category, price, price_promotion
    FROM scored
    WHERE word_score > CASE
        WHEN word_count = 1 THEN 0.18
        WHEN word_count = 2 THEN 0.41
        WHEN word_count = 3 THEN 0.60
        ELSE 0.80
    END
    AND units_match = true
    ORDER BY word_score DESC
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
            s.location                       AS store,
            s.location                       AS full_store_name,
            prod.name                    AS product_name,
            prod.code                    AS code,
            cat.cid::text                AS category,
            pt.price,
            pt.price_promotion
        FROM product_test pt
        JOIN products  prod ON prod.id = pt.product_id
        JOIN stores    s    ON s.id    = pt.store_id
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
                s.location                   AS store,
                s.location                   AS storeName,
                cat.cid::text                       AS category,
                COALESCE(cat.name, cat.cid::text)   AS categoryName,
                trim(pt.price)           AS price,
                trim(pt.price_promotion) AS pricePromotion
            FROM product_test pt
            JOIN products   prod  ON prod.id  = pt.product_id
            JOIN stores     s     ON s.id     = pt.store_id
            JOIN cities     c     ON c.id     = pt.city_id
            JOIN categories cat   ON cat.id   = pt.category_id
            WHERE c.ekatte = :city
              AND trim(pt.price)           ~ '^[0-9]+([,.][0-9]+)?$'
              AND trim(pt.price_promotion) ~ '^[0-9]+([,.][0-9]+)?$'
              AND (CAST(:store AS TEXT) IS NULL
                OR s.location ILIKE CONCAT('%', :store, '%'))
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
        )
        SELECT productName, store, storeName, category, categoryName, price, pricePromotion
        FROM scored
        WHERE promo_num > 0
          AND price_num > 0
          AND promo_num < price_num
          AND (1 - promo_num / price_num) * 100 >= :minDiscount
        ORDER BY (1 - promo_num / price_num) DESC
        LIMIT :limit OFFSET :offset
    """, nativeQuery = true)
    List<PromotionProjection> findPromotions(
            @Param("city")        String city,
            @Param("store")       String store,
            @Param("category")    String category,
            @Param("search")      String search,
            @Param("minDiscount") int minDiscount,
            @Param("limit")       int limit,
            @Param("offset")      int offset
    );

    @Query(value = "SELECT COALESCE(name, cid::text) FROM categories ORDER BY cid", nativeQuery = true)
    List<String> findAllCategoryIds();

    @Query(value = """
        SELECT DISTINCT s.location
        FROM stores s
        JOIN product_test pt ON pt.store_id = s.id
        JOIN cities c ON c.id = pt.city_id
        WHERE c.ekatte = :city
        ORDER BY s.location
    """, nativeQuery = true)
    List<String> findStoreNames(@Param("city") String city);
}
