package com.example.demo.controllers;

import com.example.demo.data.Brand;
import com.example.demo.service.BrandExtract;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BrandController {

    private final BrandExtract brandExtract;

    public BrandController(BrandExtract brandExtract) {
        this.brandExtract = brandExtract;
    }

    @GetMapping("/admin/extract-brands")
    public String extractBrands(
            @RequestParam(defaultValue = "100") int maxPrint
    ) {
        brandExtract.extractAllBrands(maxPrint);
        return "Brand extraction finished. Check logs.";
    }
     @PostMapping("/add")
    public ResponseEntity<?> addBrand(
        @RequestParam String productTypeCode,
        @RequestParam String brandName
    ) {
        try {
            Brand savedBrand = brandExtract.addBrand(productTypeCode, brandName);
            return ResponseEntity.ok(savedBrand);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
