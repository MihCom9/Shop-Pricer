package com.example.demo.controllers.Shopping;

import com.example.demo.data.repository.ProductRepository;
import com.example.demo.model.SearchProduct;
import com.example.demo.model.Category.CategoryInfo;
import com.example.demo.model.Shopping.ProductResult;
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

    @GetMapping("/alts")
    public List<ProductResult> findAlts(
        @RequestParam String name,
        @RequestParam String category,
        @RequestParam String store,
        @RequestParam String location,
        @RequestParam String city,
        @RequestParam(required = false) Integer quantity,
        @RequestParam(required = false) Double weightGrams
    ){
        return shoppingService.findAlts(name, category, store, location, city, quantity, weightGrams);
    }

    @GetMapping("/categories/names")
    public List<String> getCategoryNames(){
        return productRepository.findAllCategoryIds();
    }
    @GetMapping("/categories")
    public List<CategoryInfo> getCategoryFull(){
        return productRepository.findAllCategoriesWithUnitType();
    }
}

