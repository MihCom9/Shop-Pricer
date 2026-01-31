package com.example.demo.controllers;

import com.example.demo.data.Brand;
import com.example.demo.data.ProductType;
import com.example.demo.data.ProductTypeAlias;
import com.example.demo.data.repository.ProductTypeRepository;
import com.example.demo.model.CreateProductTypeAliasRequest;
import com.example.demo.model.CreateProductTypeRequest;
import com.example.demo.service.BrandExtract;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BrandController {

    private final BrandExtract brandExtract;
    private final ProductTypeRepository productTypeRepository;

    public BrandController(BrandExtract brandExtract, ProductTypeRepository productTypeRepository) {
        this.brandExtract = brandExtract;
        this.productTypeRepository=productTypeRepository;
    }

    @GetMapping("/admin/extract-brands")
    public String extractBrands(
            @RequestParam(defaultValue = "100") int maxPrint
    ) {
        brandExtract.extractAllBrands(maxPrint);
        return "Brand extraction finished. Check logs.";
    }

    @PostMapping("/admin/brand-add")
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

    @PostMapping("/admin/product-types")
    public ResponseEntity<?> create(@RequestBody CreateProductTypeRequest req) {

        if (productTypeRepository.existsByCodeIgnoreCase(req.getCode())) {
            return ResponseEntity.badRequest().body("Product type already exists");
        }

        ProductType pt = new ProductType(req.getCode());
        productTypeRepository.save(pt);

        return ResponseEntity.ok(pt);
    }
    @PostMapping("/admin/product-type-alias-add")
    public ResponseEntity<?> addAlias(
            @RequestBody CreateProductTypeAliasRequest req
    ) {
        try {
            ProductTypeAlias alias =
                brandExtract.addAlias(req.getProductTypeCode(), req.getName());
            return ResponseEntity.ok(alias);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
