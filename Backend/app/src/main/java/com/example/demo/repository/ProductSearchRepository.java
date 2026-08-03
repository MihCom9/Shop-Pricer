package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.entity.Product;

public interface ProductSearchRepository extends JpaRepository<Product, Long> {
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
                trim(pt.price)               AS price,
                trim(pt.price_promotion)     AS price_promotion,
                pt.measurements
            FROM product_test pt
            JOIN products       prod ON prod.id  = pt.product_id
            JOIN store_locations sl  ON sl.id    = pt.store_id
            JOIN stores         s    ON s.id     = sl.store_id
            JOIN cities         c    ON c.id     = pt.city_id
            JOIN categories     cat  ON cat.id   = pt.category_id
            WHERE c.ekatte       = :city
            AND cat.cid::text    = :category
            AND s.name ILIKE CONCAT('%', :storeName, '%')
            AND sl.location      = :storeLocation
            AND trim(pt.price) ~ '^[0-9]+([,.][0-9]+)?$'
            AND prod.name NOT ILIKE '%НЗОК%'
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
        ranked AS (
            SELECT *,
                ROW_NUMBER() OVER (
                    ORDER BY
                        units_match DESC,
                        measurement_score DESC,
                        COALESCE(
                            CASE WHEN trim(price_promotion) ~ '^[0-9]+([,.][0-9]+)?$'
                                AND price_promotion::numeric > 0
                                THEN price_promotion::numeric END,
                            price::numeric
                        ) ASC
                ) AS rn
            FROM word_filtered
        )
        SELECT id, city, store, full_store_name, product_name, code, category,
            price, price_promotion, measurements, CASE
                WHEN array_length(
                    ARRAY(
                        SELECT match[1]
                        FROM regexp_matches(upper(:name), '(\\d+[.,]?\\d*\\s*(?:%|ГР|КГ|МЛ|Г|Л))', 'g') AS match
                    ), 1
                ) IS NULL THEN 1
                WHEN measurement_score < 0.95 THEN 2
                ELSE 1
            END AS match_tier
        FROM ranked
        WHERE rn > :offset
        AND rn <= (:offset + :limit)
        ORDER BY rn ASC
        """, nativeQuery = true)
        List<Product> findAltsForProduct(
            @Param("city")      String city,
            @Param("category")  String category,
            @Param("storeName") String storeName,
            @Param("storeLocation") String storeLocation,
            @Param("name")      String name,
            @Param("limit")     int limit,
            @Param("offset")    int offset
        );

        @Query(value = """
            SELECT pt.id, c.ekatte AS city, sl.location AS store, s.name AS full_store_name,
                prod.name AS product_name, prod.code AS code, cat.cid::text AS category,
                trim(pt.price) AS price, trim(pt.price_promotion) AS price_promotion,
                pt.measurements, 3 AS match_tier
            FROM product_test pt
            JOIN products       prod ON prod.id  = pt.product_id
            JOIN store_locations sl  ON sl.id    = pt.store_id
            JOIN stores         s    ON s.id     = sl.store_id
            JOIN cities         c    ON c.id     = pt.city_id
            JOIN categories     cat  ON cat.id   = pt.category_id
            WHERE c.ekatte       = :city
            AND cat.cid::text    = :category
            AND s.name ILIKE CONCAT('%', :storeName, '%')
            AND sl.location      = :storeLocation
            AND trim(pt.price) ~ '^[0-9]+([,.][0-9]+)?$'
            AND prod.name NOT ILIKE '%НЗОК%'
            ORDER BY pt.price::numeric ASC
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
        List<Product> findTopByCategoryAndStore(
            @Param("city")          String city,
            @Param("category")      String category,
            @Param("storeName")     String storeName,
            @Param("storeLocation") String storeLocation,
            @Param("limit")         int limit,
            @Param("offset")        int offset
        );
}
