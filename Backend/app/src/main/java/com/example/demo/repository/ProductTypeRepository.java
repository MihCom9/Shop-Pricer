package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.entity.ProductType;

import java.util.List;
import java.util.Optional;

public interface ProductTypeRepository extends JpaRepository<ProductType, Long> {

    Optional<ProductType> findByCode(Integer code);

    boolean existsByCode(Integer code);

    Optional<ProductType> findByProductNameIgnoreCase(String productName);

    boolean existsByProductNameIgnoreCase(String productName);

    @Query("select pt.productName from ProductType pt")
    List<String> findAllProductNames();

    void deleteByCode(Integer code);

    void deleteByProductNameIgnoreCase(String productName);

}
