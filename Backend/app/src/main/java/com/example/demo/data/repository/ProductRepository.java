package com.example.demo.data.repository;

import java.util.List;

import org.antlr.v4.runtime.atn.SemanticContext.AND;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.data.Product;

import jakarta.transaction.Transactional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCity(String city);

    Product findById(long id);

    Slice<Product> findAllBy(Pageable page);

    List<Product> findByStore(String store);

    // Find products by product name containing a keyword (case insensitive)
    List<Product> findByProductNameContainingIgnoreCase(String keyword);
    
    List<Product> findByCategory(String category);

   @Query("""
    SELECT p FROM Product p
    WHERE p.city = :city
    AND LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
    List<Product> searchProductsByCityAndKeyword(
            @Param("city") String city,
            @Param("keyword") String keyword
    );

    // @Query("""
    // SELECT p FROM Product p
    // WHERE p.city = :city
    // AND p.productName ILIKE CONCAT('%', :name, '%')
    // """)
    // List<Product> findMatchingProducts(
    //     @Param("city") String city,
    //     @Param("name") String name
    // );
    @Query("""
    SELECT p FROM Product p
    WHERE p.city = :city
      AND p.name ILIKE :name
      AND (:brand IS NULL OR p.name ILIKE :brand)
    """)
    List<Product> findMatchingProductsBrand(
        @Param("city") String city,
        @Param("name") String name,
        @Param("brand") String brand
    );
    @Query("""
            SELECT DISTINCT p.name FROM Product p
            WHERE p.category = :category
            AND (:brand IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :brand, '%')))
            """)
    List<String> findMatchingProducts(
        @Param("category") String category,
        @Param("brand") String brand
    );
    @Query(value = """ 
        WITH distinct_products AS (
            SELECT DISTINCT product_name
            FROM product
            WHERE category = :category
            AND LOWER(product_name) LIKE LOWER(CONCAT('%', :brand, '%'))
        ),
        measurements_extracted AS (
            SELECT 
                p.product_name,
                array_agg(m[1] || m[2] ORDER BY ordinality) AS measurements_array
            FROM distinct_products p
            LEFT JOIN LATERAL regexp_matches(
                upper(p.product_name),
                '(\\d+\\.?\\d*)\\s*(Г|ГР|КГ|МЛ|Л|%)',
                'gi'
            ) WITH ORDINALITY AS m ON true
            GROUP BY p.product_name
        ),
        parsed_products AS (
            SELECT 
                me.product_name,
                trim(regexp_replace(
                    regexp_replace(
                        upper(me.product_name),
                        '(\\d+\\.?\\d*)\\s*(Г|ГР|КГ|МЛ|Л|%)',
                        '',
                        'gi'
                    ),
                    '[^А-ЯA-Z\\s]', ' ', 'g'
                )) AS text_only,
                COALESCE(array_to_string(measurements_array, ' '), '') AS measurements
            FROM measurements_extracted me
        ),
        normalized_products AS (
            SELECT 
                product_name,
                regexp_replace(text_only, '\\s+', ' ', 'g') AS normalized_text,
                regexp_replace(measurements, '\\s+', ' ', 'g') AS normalized_measurements
            FROM parsed_products
        )
        SELECT p1.product_name AS name
        FROM normalized_products p1
        WHERE NOT EXISTS (
            SELECT 1
            FROM normalized_products p2
            WHERE p2.product_name < p1.product_name
            AND p1.normalized_text % p2.normalized_text
            AND similarity(p1.normalized_measurements, p2.normalized_measurements) > 0.65
        )
        ORDER BY name
    """, nativeQuery = true)
    List<String> findMatchingProductsBetter(
            @Param("category") String category,
            @Param("brand") String brand
    );
    @Query(value = """
    WITH base AS MATERIALIZED (
        SELECT *
        FROM product
        WHERE city = :city
        AND category = :category
    ),
    cleaned AS (
        SELECT
            bf.*,
            trim(regexp_replace(upper(bf.product_name), '(\\d+[.,]?\\d*\\s*(?:%|Г|ГР|КГ|МЛ|Л))', '', 'gi')) AS clean_product,
            trim(regexp_replace(upper(:name), '(\\d+[.,]?\\d*\\s*(?:%|Г|ГР|КГ|МЛ|Л))', '', 'gi')) AS clean_query
        FROM base bf
    ),
    scored AS (
        SELECT
            bf.*,
            word_similarity(
                array_to_string(array(SELECT unnest(string_to_array(bf.clean_product, ' ')) ORDER BY 1), ' '),
                array_to_string(array(SELECT unnest(string_to_array(bf.clean_query, ' ')) ORDER BY 1), ' ')
            ) AS word_score,
            array_length(string_to_array(trim(bf.clean_query), ' '), 1) AS word_count,
            NOT EXISTS (
                SELECT 1
                FROM unnest(ARRAY(
                    SELECT match[1]
                    FROM regexp_matches(upper(:name), '(\\d+[.,]?\\d*\\s*(?:%|Г|ГР|КГ|МЛ|Л))', 'g') AS match
                )) AS q_unit
                WHERE upper(bf.product_name) !~ ('(^|[^0-9,\\.])' || q_unit || '([^0-9,\\.]|$)')
            ) AS units_match
        FROM cleaned bf
    )
    SELECT
        scored.*
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
            @Param("city") String city,
            @Param("category") String category,
            @Param("name") String name
    );

    @Query(value = """
        SELECT *
        FROM product
        WHERE city = :city
        AND category = :category
    """, nativeQuery = true)
    List<Product> findMatchingProductsEmptyName(
            @Param("city") String city,
            @Param("category") String category
    );

}