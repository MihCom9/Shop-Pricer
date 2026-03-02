package com.example.demo.controllers;

import com.example.demo.data.Brand;
import com.example.demo.data.ProductType;
import com.example.demo.data.ProductTypeAlias;
import com.example.demo.data.repository.BrandRepository;
import com.example.demo.data.repository.ProductTypeRepository;
import com.example.demo.model.SearchProduct;
import com.example.demo.model.StoreResult;
import com.example.demo.service.ShoppingService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class ShopController {

    private final ShoppingService shoppingService;
    private final ProductTypeRepository productTypeRepository;

    @Autowired
    public ShopController(ShoppingService shoppingService,ProductTypeRepository productTypeRepository) {
        this.shoppingService = shoppingService;
        this.productTypeRepository=productTypeRepository;
    }

    @PostMapping("/cheapest")
    public StoreResult findCheapestStore(
            @RequestParam String city,
            @RequestBody List<SearchProduct> shoppingList
    ) {
        // Call the service directly
        StoreResult finalStoreResult= shoppingService.findCheapestStore(city, shoppingList);
        
        return finalStoreResult;
    }
    @GetMapping("/product-types")
    public List<String> getProductType(){
        List<String> product_types= productTypeRepository.findAllProductNames();
        return product_types;
    }
    @GetMapping("/product-type/brands")
    public List<String> getBrandsByProductType(@RequestParam String productName) {
        ProductType pt = productTypeRepository.findByProductNameIgnoreCase(productName)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Product type not found"
            ));
        return pt.getBrands().stream().map(Brand::getName).toList();
    }
    
    @GetMapping("/{code}/product-alias")
    public List<String> getProductAliasByProductType(@PathVariable String productName) {
        ProductType pt = productTypeRepository.findByProductNameIgnoreCase(productName)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Product type not found"
            ));
        return pt.getAliases().stream().map(ProductTypeAlias::getName).toList();
    }
    // @GetMapping("/search")
    // public List<Product> searchProducts(
    //         @RequestParam String city,
    //         @RequestParam String keyword
    // ) {
    //     List<Product> products = shoppingService.searchProductsByCityAndKeyword(city, keyword);

    //     // Convert string prices to BigDecimal if necessary
    //     return products.stream().map(p -> {
    //         try {
    //             if (p.getPrice() == null) p.setPrice("0");
    //         } catch (Exception e) {
    //             p.setPrice("0");
    //         }
    //         try {
    //             if (p.getPrice_promotion() == null) p.setPrice_promotion(null);
    //         } catch (Exception e) {
    //             p.setPrice_promotion(null);
    //         }
    //         return p;
    //     }).collect(Collectors.toList());
    // }
}

