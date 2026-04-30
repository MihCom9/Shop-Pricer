package com.example.demo.data.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.data.Product;
import com.example.demo.model.City.CityInfo;

public interface StoresRepository extends JpaRepository<Product, Long> {
    
    @Query(value = "SELECT COUNT(*) FROM stores", nativeQuery = true)
    long countStores();

    @Query(value = """
        SELECT DISTINCT s.name
        FROM stores s
        JOIN store_locations sl ON sl.store_id = s.id
        JOIN product_test pt ON pt.store_id = sl.id
        JOIN cities c ON c.id = pt.city_id
        WHERE c.ekatte = :city
        ORDER BY s.name
    """, nativeQuery = true)
    List<String> findStoreNames(@Param("city") String city);

    @Query(value = """
        SELECT DISTINCT sl.location
        FROM store_locations sl
        JOIN stores s ON s.id = sl.store_id
        JOIN product_test pt ON pt.store_id = sl.id
        JOIN cities c ON c.id = pt.city_id
        WHERE s.name = :store
        AND c.ekatte = :city
        ORDER BY sl.location
    """, nativeQuery = true)
    List<String> findStoreLocations(
        @Param("city") String city,
        @Param("store") String store);

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
