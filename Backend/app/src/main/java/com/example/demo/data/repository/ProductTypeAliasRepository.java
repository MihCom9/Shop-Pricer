package com.example.demo.data.repository;

import com.example.demo.data.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductTypeAliasRepository extends JpaRepository<ProductType, Long> {

}
