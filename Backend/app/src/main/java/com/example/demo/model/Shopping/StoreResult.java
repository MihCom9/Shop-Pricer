package com.example.demo.model.Shopping;

import java.math.BigDecimal;
import java.util.List;

import com.example.demo.data.Product;

public class StoreResult {
    private String store;
    List<ProductResult> products;
    private BigDecimal totalPrice;

    public StoreResult(String store,List<Product> products ,BigDecimal totalPrice) {
        this.store = store;
        this.products = products.stream().map(ProductResult::new).toList();
        this.totalPrice = totalPrice;
    }

    public String getStore() {
        return store;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public List<ProductResult> getProducts() {
        return products;
    }
    
}

