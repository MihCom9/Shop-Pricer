package com.example.demo.controllers;

import com.example.demo.data.ProductType;
import com.example.demo.data.repository.ProductTypeRepository;
import com.example.demo.model.CreateProductTypeAliasRequest;
import com.example.demo.model.CreateProductTypeRequest;
import com.example.demo.service.shopping.BrandExtractor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BrandController {

    private final BrandExtractor brandExtractor;

    public BrandController(BrandExtractor brandExtractor) {
        this.brandExtractor = brandExtractor;
    }

    @PostMapping("/admin/product-types")
    public ResponseEntity<?> addProductType(@RequestBody CreateProductTypeRequest req) {
        try{
            ProductType pt= brandExtractor.addProductType(req.getCode(), req.getProductName());
            return ResponseEntity.ok(pt);
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @DeleteMapping("/admin/product-types/{code}")
    public ResponseEntity<Void> delete(@PathVariable String code) {
            brandExtractor.deleteProductType(code);
        return ResponseEntity.noContent().build();
    }
}
