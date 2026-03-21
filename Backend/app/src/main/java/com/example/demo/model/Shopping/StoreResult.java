package com.example.demo.model.Shopping;

import java.math.BigDecimal;
import java.util.List;

import com.example.demo.data.Product;

public class StoreResult {
    private String store;
    private String storeName;
    List<ProductResult> products;
    private BigDecimal totalPrice;

    public StoreResult(String store,List<Product> products ,BigDecimal totalPrice) {
        this.store = store;
        this.products = products.stream().map(ProductResult::new).toList();
        this.totalPrice = totalPrice;
        storeName = products.get(0).getFullStoreName();
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

    public String getStoreName() {
        return storeName;
    }
}

