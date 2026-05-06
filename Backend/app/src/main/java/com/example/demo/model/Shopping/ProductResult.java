package com.example.demo.model.Shopping;

import java.math.BigDecimal;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.example.demo.data.Product;

public class ProductResult {
    private String productName;
    private BigDecimal price;
    private BigDecimal pricePromotion;
    private String measurements;
    private Long id;
    

    public ProductResult(Product product) {
        this.productName = product.getProductName();
        this.price = product.getPriceAsDecimal();
        this.pricePromotion = product.getPricePromotionAsDecimal();
        this.id = product.getId();
    }
    
    public ProductResult(String productName, BigDecimal price, BigDecimal pricePromotion, String measurements) {
        this.productName = productName;
        this.price = price;
        this.pricePromotion = pricePromotion;
        this.measurements = measurements;
        this.id = null;
    }

    // Constructor with id (for alts)
    public ProductResult(String productName, BigDecimal price, BigDecimal pricePromotion, String measurements, Long id) {
        this.productName = productName;
        this.price = price;
        this.pricePromotion = pricePromotion;
        this.measurements = measurements;
        this.id = id;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getPricePromotion() {
        return pricePromotion;
    }

    public void setPricePromotion(BigDecimal pricePromotion) {
        this.pricePromotion = pricePromotion;
    }

    public String getMeasurements() {
        return measurements;
    }

    public void setMeasurements(String measurements) {
        this.measurements = measurements;
    }

    public Long getId() { return id; }
    
    public void setId(Long id) { this.id = id; }
    
}
