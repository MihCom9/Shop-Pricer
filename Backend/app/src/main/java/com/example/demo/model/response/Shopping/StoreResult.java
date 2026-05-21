package com.example.demo.model.response.Shopping;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.demo.entity.Product;
import com.example.demo.model.common.StoreSummary;
import com.example.demo.model.request.Shopping.SearchProduct;
import com.fasterxml.jackson.annotation.JsonIgnore;

public class StoreResult {
    private String storeName;
    private List<String> locations;
    private List<ShoppingProductResult> products;
    @JsonIgnore
    private Map<String, Integer> locationProductCounts = new HashMap<>();
    private BigDecimal totalPrice;
    private StoreSummary storeSummary;

    public StoreResult(String location, String storeName, List<Product> products, BigDecimal totalPrice, Map<Product, Double> requestedGrams, Map<Product, SearchProduct> cartItemNames) {
        this.locations = new ArrayList<>();
        this.locations.add(location);
        this.products = new ArrayList<>(products.stream()
            .map(p -> new ShoppingProductResult(p, requestedGrams != null ? requestedGrams.get(p) : null, cartItemNames != null ? cartItemNames.get(p) : null))
            .toList());
        this.totalPrice = totalPrice;
        this.storeName = storeName;
        this.locationProductCounts.put(location, products.size());
        this.storeSummary = null;
    }

    public List<String> getLocations() {
        return locations;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public List<ShoppingProductResult> getProducts() {
        return products;
    }

    public void addProduct(SearchProduct cartItem){
        products.add(new ShoppingProductResult(cartItem));
    }

    public void addProduct(Product p, Double requestedGrams,SearchProduct cartItem){
        products.add(new ShoppingProductResult(p,requestedGrams, cartItem));
    }


    public String getStoreName() {
        return storeName;
    }

    public void addLocation(String location, BigDecimal price, List<Product> locationProducts,
            Map<Product, Double> requestedGrams,
            Map<Product, SearchProduct> cartItemNames) {

        if (this.locations.contains(location)) return;

        int newCount     = locationProducts.size();
        int currentCount = locationProductCounts.getOrDefault(locations.get(0), 0);

        locationProductCounts.put(location, newCount);

        boolean newIsBetter = newCount > currentCount || 
                            (newCount == currentCount && price.compareTo(totalPrice) < 0);

        if (newIsBetter) {
            this.locations.add(0, location);
            totalPrice = price;
            this.products = new ArrayList<>(locationProducts.stream()
                .map(p -> new ShoppingProductResult(
                    p,
                    requestedGrams != null ? requestedGrams.get(p) : null,
                    cartItemNames != null ? cartItemNames.get(p) : null))
                .toList());
        } else {
            this.locations.add(location);
        }
    }

    public boolean hasSizeMismatch() {
        return products.stream().anyMatch(ShoppingProductResult::isSizeMismatch);
    }

    public StoreSummary getStoreSummary() {
        return storeSummary;
    }

    public void setStoreSummary(StoreSummary summary){
        this.storeSummary = summary;
    }
}

