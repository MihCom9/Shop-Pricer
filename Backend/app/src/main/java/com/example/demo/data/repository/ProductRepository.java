package com.example.demo.data.repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.example.demo.data.Product;

public interface ProductRepository extends CrudRepository<Product, Long> {

    List<Product> findByCity(String city);

    Product findById(long id);

    List<Product> findByStore(String store);

    // Find products by product name containing a keyword (case insensitive)
    List<Product> findByProductNameContainingIgnoreCase(String keyword);
    
    List<Product> findByCategory(String category);

   @Query("""
    SELECT p FROM Product p
    WHERE p.city = :city
    AND LOWER(p.productName) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
    List<Product> searchProductsByCityAndKeyword(
            @Param("city") String city,
            @Param("keyword") String keyword
    );

    @Query("""
    SELECT p FROM Product p
    WHERE p.city = :city
    AND p.productName ILIKE CONCAT('%', :name, '%')
    """)
    List<Product> findMatchingProducts(
        @Param("city") String city,
        @Param("name") String name
    );
}