package com.example.demo.controllers.Promotion;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.model.Shopping.ProductResult;
import com.example.demo.model.Shopping.PromotionItem;
import com.example.demo.service.shopping.PromotionService;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class PromotionController {
    private final PromotionService promotionService;

    @Autowired
    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }
    
    @GetMapping("/promotions")
    public List<PromotionItem> getPromotions(
            @RequestParam(defaultValue = "68134") String city,
            @RequestParam(required = false) String store,
            @RequestParam(required = false) String storeLocation,
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int minDiscount,
            @RequestParam(defaultValue = "48") int limit,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "discount", name = "sort") String sorting,
            @RequestParam(defaultValue = "all") String show
    ) {
        try {
            return promotionService.getPromotions(city, store,storeLocation , category, search, minDiscount, limit, offset, sorting, show);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @GetMapping("/promotions/count")
    public long getPromotionsCount(
        @RequestParam(required = false) String city,
        @RequestParam(required = false) String store,
        @RequestParam(required = false) String storeLocation,
        @RequestParam(required = false) String category,
        @RequestParam(required = false, defaultValue = "") String search,
        @RequestParam(defaultValue = "0") int minDiscount
    ){
        try {
            return promotionService.getPromotionsCount(city, store,storeLocation , category, search, minDiscount);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }
}