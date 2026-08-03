package com.example.demo.service.admin;

import java.math.BigInteger;
import java.util.List;
import org.slf4j.Logger;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.entity.Product;
import com.example.demo.entity.Category;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.CategoryRepository;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import jakarta.transaction.Transactional;

@Service
public class BrandExtractor {
    private final ProductRepository productRepository;
    private final CategoryRepository productTypeRepository;
    Logger logger = LoggerFactory.getLogger(BrandExtractor.class);
    @Autowired
    public BrandExtractor(ProductRepository productRepository,
                        CategoryRepository productTypeRepository) {
        this.productRepository = productRepository;
        this.productTypeRepository = productTypeRepository;
        
    }
    @Transactional
    public void deleteCategory(String productName) {
        productTypeRepository.deleteByNameIgnoreCase(productName);
    }
    @Transactional
    public Category addCategory(Integer code, String productName){
        if(productTypeRepository.existsByCode(code)){
            new IllegalArgumentException(
                    "Category with code '" + code + "' not found"
            );
        }
        Category pt = new Category(code, productName);
            return productTypeRepository.save(pt);
    }
}
