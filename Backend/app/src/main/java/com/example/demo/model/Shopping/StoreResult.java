package com.example.demo.model.Shopping;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.example.demo.data.Product;
import com.example.demo.model.SearchProduct;

public class StoreResult {
    private String storeName;
    private List<String> locations;
    private List<ShoppingProduct> products;
    private BigDecimal totalPrice;
    private boolean isBest;
    private BigDecimal savingsVsAvg;

    public StoreResult(String location, String storeName, List<Product> products, BigDecimal totalPrice, Map<Product, Double> requestedGrams, Map<Product, SearchProduct> cartItemNames) {
        this.locations = new ArrayList<>();
        this.locations.add(location);
        this.products = products.stream()
            .map(p -> new ShoppingProduct(p, requestedGrams != null ? requestedGrams.get(p) : null, cartItemNames != null ? cartItemNames.get(p) : null))
            .toList();
        this.totalPrice = totalPrice;
        this.storeName = storeName;
        this.isBest = false;
        savingsVsAvg = BigDecimal.ZERO; 
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

    public void addLocation(String location, BigDecimal price, List<Product> locationProducts,
                        Map<Product, Double> requestedGrams,
                        Map<Product, SearchProduct> cartItemNames) {
        if (!this.locations.contains(location)) {
            this.locations.add(location);
        }
        if (totalPrice.compareTo(price) > 0) {
            totalPrice = price;
            this.products = locationProducts.stream()
                .map(p -> new ShoppingProduct(
                    p,
                    requestedGrams != null ? requestedGrams.get(p) : null,
                    cartItemNames != null ? cartItemNames.get(p) : null))
                .toList();
        }
    }

    public boolean hasSizeMismatch() {
        return products.stream().anyMatch(ShoppingProduct::isSizeMismatch);
    }

    public boolean isBest() {
        return isBest;
    }

    public BigDecimal getSavingsVsAvg() {
        return savingsVsAvg;
    }

    public void setIsBest(boolean isBest){
        this.isBest = isBest;
    }
    
    public void setSavingsVsAvg(BigDecimal savingsVsAvg){
        this.savingsVsAvg = savingsVsAvg;
    }
}

