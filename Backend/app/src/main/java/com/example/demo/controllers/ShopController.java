package com.example.demo.controllers;

import com.example.demo.model.SearchProduct;
import com.example.demo.model.StoreResult;
import com.example.demo.service.ShoppingService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shop")
public class ShopController {

    private final ShoppingService shoppingService;

    @Autowired
    public ShopController(ShoppingService shoppingService) {
        this.shoppingService = shoppingService;
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

