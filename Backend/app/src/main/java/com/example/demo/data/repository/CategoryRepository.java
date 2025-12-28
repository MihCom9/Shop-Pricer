package com.example.demo.data.repository;

import java.util.List;
import org.springframework.data.repository.CrudRepository;
import com.example.demo.data.Category;

public interface CategoryRepository extends CrudRepository<Category, Long> {

    List<Category> findByName(String name);

    Category findById(long id);
}