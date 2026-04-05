package com.example.demo.model.Shopping;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.example.demo.data.Product;

public class StoreResult {
    private String storeName;
    private List<String> locations;
    List<ShoppingProduct> products;
    private BigDecimal totalPrice;

    public StoreResult(String location, String storeName, List<Product> products, BigDecimal totalPrice, Map<Product, Double> requestedGrams) {
        this.locations = new ArrayList<>();
        this.locations.add(location);
        this.products = products.stream()
            .map(p -> new ShoppingProduct(p, requestedGrams != null ? requestedGrams.get(p) : null))
            .toList();
        this.totalPrice = totalPrice;
        this.storeName = storeName;
    }

    public List<String> getLocations() {
        return locations;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public List<ShoppingProduct> getProducts() {
        return products;
    }

    public String getStoreName() {
        return storeName;
    }

    public void addLocation(String location) {
        this.locations.add(location);
    }

    public boolean hasSizeMismatch() {
        return products.stream().anyMatch(ShoppingProduct::isSizeMismatch);
    }
    
}

