package com.example.demo.service.shopping;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.example.demo.data.repository.ProductRepository;
import com.example.demo.data.repository.ProductTypeRepository;
import com.example.demo.data.repository.PromotionProjection;
import com.example.demo.data.repository.PromotionProjectionMaterialized;
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
    // const SORT_OPTIONS = [
    //   { label: "Biggest discount", value: "discount" },
    //   { label: "Lowest price", value: "price_asc" },
    //   { label: "Highest price", value: "price_desc" },
    //   { label: "Newest", value: "newest" },
    // ];
    @Cacheable(value = "promotions",
               key = "#city + '|' + #store + '|' + #category + '|' + #search + '|' + #minDiscount + '|' + #limit + '|' + #offset + '|' + #sorting + '|' + #show")
    public List<PromotionItem> getPromotions(String city, String store,String storeLocation ,String category, String search, int minDiscount, int limit, int offset, String sorting, String show) {
        Sort sort;
        switch (sorting) {
            case "discount":
                sort = Sort.by(Sort.Direction.DESC, "discount_perc");
                break;
            case "price_asc":
                sort = Sort.by(Sort.Direction.ASC, "effective_price");
                break;
            case "price_desc":
                sort = Sort.by(Sort.Direction.DESC, "effective_price");
                break;
            default:
                sort = Sort.by(Sort.Direction.DESC, "discount_perc");
                break;
        }
        if(limit <1){
            limit=48;
        }
        Pageable pageable = PageRequest.of((offset/limit), limit, sort);
        boolean promotionsOnly;
        switch (show) {
            case "all":
                promotionsOnly = false;
                break;
            case "promotions":
                promotionsOnly = true;
                break;
            default:
                promotionsOnly = false;
                break;
        }
        List<PromotionProjectionMaterialized> rows = productRepository.browseProductsMaterialized(
                city,
                (store != null && !store.isBlank()) ? store : null,
                (category != null && !category.isBlank()) ? category : null,
                (search != null && !search.isBlank()) ? search : null,
                minDiscount,
                promotionsOnly,
                pageable
        );
        System.out.println("=== ROWS FROM DB (" + rows.size() + ") ===");
        for (PromotionProjectionMaterialized r : rows) {
            System.out.println("  " + r.getProductname() + " | " + r.getLocations() + " | " + r.getStorename() + " | " + r.getPriceNum() + " -> " + r.getPromoNum()+ " , " + r.getEffectivePrice());
        }
        List<PromotionItem> promotionResults = new ArrayList<>();
        for (PromotionProjectionMaterialized item : rows) {
            try {
                promotionResults.add(new PromotionItem(
                    item.getProductname(),
                    Arrays.asList(item.getLocations()),
                    item.getStorename(),
                    item.getCategoryname(),
                    item.getMeasurements(),
                    item.getPriceNum(),
                    item.getPromoNum()
                ));
            } catch (Exception e) {
                System.out.println("=== FAILED TO CREATE PromotionItem for: " + item.getProductname()
                    + " | price='" + item.getPriceNum() + "'"
                    + " | promo='" + item.getPromoNum() + "'"
                    + " | error: " + e.getMessage());
            }

        }
        System.out.println("=== PROMOTION RESULTS (" + promotionResults.size() + ") ===");
        promotionResults.forEach(System.out::println);
        System.out.println(sorting);
        return promotionResults;
    }

    public long getPromotionsCount(String city, String store,String storeLocation ,String category, String search, int minDiscount){
        return productRepository.countPromotions(city, store, category, search, minDiscount);
    }
}
