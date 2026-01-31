package com.example.demo.data.repository;

import com.example.demo.data.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductTypeRepository extends JpaRepository<ProductType, Long> {

    Optional<ProductType> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    @Query("""
    select distinct pt
    from ProductType pt
    left join fetch pt.aliases
    left join fetch pt.brands
    """)
    List<ProductType> findAllWithAliasesAndBrands();
}
