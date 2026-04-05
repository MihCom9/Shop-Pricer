package com.example.demo.service.shopping;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.example.demo.data.repository.ProductRepository;
import com.example.demo.data.repository.ProductTypeRepository;
import com.example.demo.data.repository.PromotionProjection;
import com.example.demo.model.Shopping.PromotionItem;
import com.example.demo.model.Shopping.StoreResult;

@Service
public class PromotionService {
    private final ProductRepository productRepository;
    private final ProductTypeRepository productTypeRepository;

    public PromotionService(ProductRepository productRepository, ProductTypeRepository productTypeRepository) {
        this.productRepository = productRepository;
        this.productTypeRepository = productTypeRepository;
    }
    @Cacheable(value = "promotions",
               key = "#city + '|' + #store + '|' + #category + '|' + #search + '|' + #minDiscount + '|' + #limit + '|' + #offset")
    public List<PromotionItem> getPromotions(String city, String store, String category, String search, int minDiscount, int limit, int offset) {
        List<PromotionProjection> rows = productRepository.findPromotions(
                city,
                (store != null && !store.isBlank()) ? store : null,
                (category != null && !category.isBlank()) ? category : null,
                (search != null && !search.isBlank()) ? search : null,
                minDiscount,
                limit,
                offset
        );
        System.out.println("=== ROWS FROM DB (" + rows.size() + ") ===");
        for (PromotionProjection r : rows) {
            System.out.println("  " + r.getProductName() + " | " + r.getLocations() + " | " + r.getStoreName() + " | " + r.getPrice() + " -> " + r.getPricePromotion());
        }
        List<PromotionItem> promotionResults = new ArrayList<>();
        for (PromotionProjection item : rows) {
            promotionResults.add(new PromotionItem(
                item.getProductName(),
                Arrays.asList(item.getLocations()),  // already grouped
                item.getStoreName(),
                item.getCategoryName(),
                item.getPrice(),
                item.getPricePromotion()
            ));
        }
        System.out.println("=== PROMOTION RESULTS (" + promotionResults.size() + ") ===");
        promotionResults.forEach(System.out::println);
        return promotionResults;
    }
}
