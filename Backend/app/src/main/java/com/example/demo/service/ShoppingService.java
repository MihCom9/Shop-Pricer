package com.example.demo.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.data.Product;
import com.example.demo.data.repository.ProductRepository;
import com.example.demo.model.StoreResult;
import com.example.demo.model.SearchProduct;

@Service
public class ShoppingService {

    private final ProductRepository productRepository;

    public ShoppingService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public StoreResult findCheapestStore(String city, List<SearchProduct> shoppingList) {

        Map<String, BigDecimal> storeTotals = new HashMap<>();

        for (SearchProduct sp : shoppingList) {

            List<Product> products =
                    productRepository.findMatchingProducts(city, sp.getName());

            // cheapest product PER STORE
            Map<String, Product> cheapestPerStore =
                    products.stream()
                            .collect(Collectors.toMap(
                                    Product::getStore,
                                    p -> p,
                                    (p1, p2) ->
                                            p1.getEffectivePrice()
                                              .compareTo(p2.getEffectivePrice()) <= 0
                                                    ? p1 : p2
                            ));

            for (Map.Entry<String, Product> entry : cheapestPerStore.entrySet()) {
                BigDecimal cost =
                        entry.getValue()
                             .getEffectivePrice()
                             .multiply(BigDecimal.valueOf(sp.getQuantity()));

                storeTotals.merge(entry.getKey(), cost, BigDecimal::add);
            }
        }

        return storeTotals.entrySet()
                .stream()
                .min(Map.Entry.comparingByValue())
                .map(e -> new StoreResult(e.getKey(), e.getValue()))
                .orElseThrow();
    }
    // public List<Product> searchProductsByCityAndKeyword(String city, String keyword) {
    // List<Product> products = productRepository.searchProductsByCityAndKeyword(city, keyword);

    // // Convert string prices to BigDecimal safely
    // return products.stream().map(p -> {
    //     try {
    //         if (p.getPrice() != null) {
    //             p.setPrice(new BigDecimal(p.getPrice().toString()));
    //         } else {
    //             p.setPrice(null);
    //         }
    //     } catch (Exception e) {
    //         p.setPrice(null);
    //     }

    //     try {
    //         if (p.getPrice_promotion() != null) {
    //             p.setPrice_promotion(new BigDecimal(p.getPrice_promotion().toString()));
    //         } else {
    //             p.setPrice_promotion(null);
    //         }
    //     } catch (Exception e) {
    //         p.setPrice_promotion(null);
    //     }
    //     return p;
    // }).collect(Collectors.toList());
    // }
}

