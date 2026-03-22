package com.example.demo.controllers;

import com.example.demo.data.repository.ProductRepository;
import com.example.demo.model.SearchProduct;
import com.example.demo.model.Shopping.PromotionItem;
import com.example.demo.model.Shopping.StoreResult;
import com.example.demo.service.shopping.ShoppingService;

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
    private final ProductRepository productRepository;

    @Autowired
    public ShopController(ShoppingService shoppingService, ProductRepository productRepository) {
        this.shoppingService = shoppingService;
        this.productRepository = productRepository;
    }

    @PostMapping("/cheapest")
    public List<StoreResult> findCheapestStore(
            @RequestParam String city,
            @RequestBody List<SearchProduct> shoppingList
    ) {
        // Call the service directly
        try {
            List<StoreResult> finalStoreResult= shoppingService.findCheapestStore(city, shoppingList);
        
            return finalStoreResult;
            
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());       
        }
        
    }
    @GetMapping("/product-types")
    public List<String> getProductType(){
        return productRepository.findAllCategoryIds();
    }

    @GetMapping("/promotions")
    public List<PromotionItem> getPromotions(
            @RequestParam(defaultValue = "68134") String city,
            @RequestParam(required = false) String store,
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int minDiscount,
            @RequestParam(defaultValue = "48") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        try {
            return shoppingService.getPromotions(city, store, category, search, minDiscount, limit, offset);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @GetMapping("/stores")
    public List<String> getStores(@RequestParam(defaultValue = "68134") String city) {
        return productRepository.findStoreNames(city);
    }
}

