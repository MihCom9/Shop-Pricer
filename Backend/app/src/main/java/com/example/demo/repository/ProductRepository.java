package com.example.demo.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.entity.Product;
import com.example.demo.model.projection.Browse.PromotionProjection;
import com.example.demo.model.projection.Browse.PromotionProjectionMaterialized;
import com.example.demo.model.projection.Category.CategoryInfo;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Slice<Product> findAllBy(Pageable page);
    
    @Query(value = "SELECT COALESCE(name, cid::text) FROM categories ORDER BY cid", nativeQuery = true)
    List<String> findAllCategoryIds();

    @Query(value = "SELECT COALESCE(name, cid::text) as name, unit_type as unitType FROM categories ORDER BY cid", nativeQuery = true)
    List<CategoryInfo> findAllCategoriesWithUnitType();

}
