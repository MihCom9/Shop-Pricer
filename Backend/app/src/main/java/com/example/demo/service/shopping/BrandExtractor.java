package com.example.demo.service.shopping;

import java.math.BigInteger;
import java.util.List;
import org.slf4j.Logger;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import com.example.demo.data.Product;
import com.example.demo.data.ProductType;
import com.example.demo.data.repository.ProductRepository;
import com.example.demo.data.repository.ProductTypeRepository;

import jakarta.transaction.Transactional;

@Service
public class BrandExtractor {
    private final ProductRepository productRepository;
    private final ProductTypeRepository productTypeRepository;
    Logger logger = LoggerFactory.getLogger(BrandExtractor.class);
    @Autowired
    public BrandExtractor(ProductRepository productRepository,
                        ProductTypeRepository productTypeRepository) {
        this.productRepository = productRepository;
        this.productTypeRepository = productTypeRepository;
        
    }
    @Transactional
    public void deleteProductType(String productName) {
        productTypeRepository.deleteByProductNameIgnoreCase(productName);
    }
    @Transactional
    public ProductType addProductType(Integer code, String productName){
        if(productTypeRepository.existsByCode(code)){
            new IllegalArgumentException(
                    "ProductType with code '" + code + "' not found"
            );
        }
        ProductType pt = new ProductType(code, productName);
            return productTypeRepository.save(pt);
    }
}
