package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.entity.Product;
import com.example.demo.model.projection.City.CityInfo;

public interface CityRepository extends JpaRepository<Product, Long> {
     @Query(value = """
        SELECT DISTINCT c.name_bg 
        FROM cities c
        WHERE EXISTS (
            SELECT 1 FROM product_test pt WHERE pt.city_id = c.id
        )
        ORDER BY c.name_bg
        """, nativeQuery = true)
    List<String> findAllCityNames();

    @Query(value = """
        SELECT c.name_bg AS name, c.ekatte
        FROM cities c
        WHERE EXISTS (
            SELECT 1 FROM product_test pt WHERE pt.city_id = c.id
        )
        ORDER BY c.name_bg
        """, nativeQuery = true)
    List<CityInfo> findAllCities();

    @Query(value = """
        SELECT COUNT(*) 
        FROM cities c
        WHERE EXISTS (
            SELECT 1 FROM product_test pt WHERE pt.city_id = c.id
        )
        """, nativeQuery = true)
    int getCitiesCount();
}
