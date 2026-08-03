package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.entity.Category;
import com.example.demo.model.projection.Category.CategoryInfo;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByCode(Integer code);

    boolean existsByCode(Integer code);

    Optional<Category> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    @Query("select c.name from Category c")
    List<String> findAllProductNames();

    void deleteByCode(Integer code);

    void deleteByNameIgnoreCase(String name);

    @Query(value = "SELECT COALESCE(name, cid::text) FROM categories ORDER BY cid", nativeQuery = true)
    List<String> findAllCategoryIds();

    @Query(value = "SELECT CAST(id AS bigint) as id, name, unit_type as unitType FROM categories ORDER BY cid", nativeQuery = true)
    List<CategoryInfo> findAllCategoriesWithUnitType();

    @Query(value = "SELECT DISTINCT p.measurements FROM product_test p " +
               "JOIN products pr ON pr.id = p.product_id " +
               "WHERE p.category_id = :categoryId " +
               "AND (CAST(:preferredIds AS integer[]) IS NULL OR pr.brand        _id = ANY(CAST(:preferredIds AS integer[]))) " +
               "AND (CAST(:excludedIds AS integer[]) IS NULL OR pr.brand_id != ALL(CAST(:excludedIds AS integer[]))) " +
               "AND p.measurements IS NOT NULL",
        nativeQuery = true)
    List<String> findDistinctMeasurements(
        @Param("categoryId") Long categoryId,
        @Param("preferredIds") Integer[] preferredIds,
        @Param("excludedIds") Integer[] excludedIds
    );
}
