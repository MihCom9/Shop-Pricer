package com.example.demo.data.repository;

import com.example.demo.data.Brand;
import com.example.demo.data.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Long> {

    Optional<Brand> findByProductTypeAndNameIgnoreCase(ProductType productType, String name);

    boolean existsByProductTypeAndNameIgnoreCase(ProductType productType, String name);
    
}