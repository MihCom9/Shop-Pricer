package com.example.demo.model;

import java.math.BigDecimal;

public class StoreResult {
    private String store;
    private BigDecimal totalPrice;

    public StoreResult(String store, BigDecimal totalPrice) {
        this.store = store;
        this.totalPrice = totalPrice;
    }

    public String getStore() {
        return store;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }
}

