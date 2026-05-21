package com.example.demo.service.shopping;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.example.demo.model.projection.Browse.PromotionProjectionMaterialized;
import com.example.demo.model.response.Browse.PromotionItem;
import com.example.demo.repository.BrowseRepository;
import com.example.demo.repository.ProductTypeRepository;

@Service
public class PromotionService {
    private final BrowseRepository browseRepository;
    private final ProductTypeRepository productTypeRepository;

    public PromotionService(BrowseRepository browseRepository, ProductTypeRepository productTypeRepository) {
        this.browseRepository = browseRepository;
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
                sorting = "discount";
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
        String categoryCode = null;
        if (category != null && !category.isBlank()) {
            categoryCode = productTypeRepository.findByProductNameIgnoreCase(category)
                    .map(pt -> pt.getCode().toString())
                    .orElse(null); // if not found by name, pass it as-is (maybe it's already a code)
        }
        List<PromotionProjectionMaterialized> rows = browseRepository.browseProductsMaterialized(
            city,
            (store != null && !store.isBlank()) ? store : null,
            categoryCode,
            (search != null && !search.isBlank()) ? search : null,
            minDiscount,
            promotionsOnly,
            sorting,   // pass directly
            limit,
            offset
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
        return browseRepository.countPromotions(city, store, category, search, minDiscount);
    }
}
