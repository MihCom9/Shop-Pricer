package com.example.demo.controllers;

import com.example.demo.data.Brand;
import com.example.demo.data.ProductType;
import com.example.demo.data.ProductTypeAlias;
import com.example.demo.data.repository.ProductTypeRepository;
import com.example.demo.model.CreateProductTypeAliasRequest;
import com.example.demo.model.CreateProductTypeRequest;
import com.example.demo.service.BrandExtractor;

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

    @GetMapping("/admin/extract-brands")
    public String extractBrands(
            @RequestParam(defaultValue = "2000") int maxPrint
    ) {
        brandExtractor.extractAllBrands(maxPrint);
        return "Brand extraction finished. Check logs.";
    }

    @PostMapping("/admin/brand")
    public ResponseEntity<?> addBrand(
        @RequestParam String productTypeName,
        @RequestParam String brandName
    ) {
        try {
            Brand savedBrand = brandExtractor.addBrand(productTypeName, brandName);
            return ResponseEntity.ok(savedBrand);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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
    @PostMapping("/admin/alias")
    public ResponseEntity<?> addAlias(
            @RequestBody CreateProductTypeAliasRequest req
    ) {
        try {
            ProductTypeAlias alias =
                brandExtractor.addAlias(req.getProductTypeCode(), req.getName());
            return ResponseEntity.ok(alias);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
