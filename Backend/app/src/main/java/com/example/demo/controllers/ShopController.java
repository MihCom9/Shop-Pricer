package com.example.demo.controllers;

import com.example.demo.data.Product;
import com.example.demo.data.ProductType;
import com.example.demo.data.repository.ProductRepository;
import com.example.demo.data.repository.ProductTypeRepository;
import com.example.demo.model.SearchProduct;
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
    private final ProductTypeRepository productTypeRepository;

    @Autowired
    public ShopController(ShoppingService shoppingService,ProductTypeRepository productTypeRepository) {
        this.shoppingService = shoppingService;
        this.productTypeRepository=productTypeRepository;
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
        List<String> product_types= productTypeRepository.findAllProductNames();
        return product_types;
    }
}

