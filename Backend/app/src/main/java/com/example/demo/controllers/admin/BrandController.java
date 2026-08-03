package com.example.demo.controllers.admin;

import com.example.demo.entity.Category;
import com.example.demo.model.request.CreateProductTypeRequest;
import com.example.demo.service.admin.BrandExtractor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
            Category pt= brandExtractor.addCategory(req.getCode(), req.getProductName());
            return ResponseEntity.ok(pt);
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @DeleteMapping("/admin/product-types/{code}")
    public ResponseEntity<Void> delete(@PathVariable String code) {
            brandExtractor.deleteCategory(code);
        return ResponseEntity.noContent().build();
    }
}
