package com.example.demo.data.repository;

import com.example.demo.data.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductTypeRepository extends JpaRepository<ProductType, Long> {

    Optional<ProductType> findByDisplayNameIgnoreCase(String displayName);

    Optional<ProductType> findByCodeIgnoreCase(String code);

    boolean existsByDisplayNameIgnoreCase(String displayName);

    @Query("""
    SELECT DISTINCT pt
    FROM ProductType pt
    LEFT JOIN FETCH pt.brands
    """)
    List<ProductType> findAllWithBrands();
}
