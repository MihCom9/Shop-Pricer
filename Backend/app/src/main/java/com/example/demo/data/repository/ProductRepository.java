package com.example.demo.data.repository;

import java.util.List;
import org.springframework.data.repository.CrudRepository;
import com.example.demo.data.Product;

public interface ProductRepository extends CrudRepository<Product, Long> {

    List<Product> findByCity(String city);

    Product findById(long id);
}