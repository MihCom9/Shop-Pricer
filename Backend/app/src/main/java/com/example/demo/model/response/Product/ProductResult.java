package com.example.demo.model.response.Product;

import java.math.BigDecimal;

import com.example.demo.entity.Product;
import com.example.demo.model.common.PriceInfo;

public class ProductResult {
    private Long id;
    private String productName;
    private PriceInfo priceInfo;
    private String measurements;
    

    public ProductResult(Product product) {
        this.productName = product.getProductName();
        this.priceInfo = new PriceInfo(product);
        this.id = product.getId();
    }
    
    public ProductResult(String productName, BigDecimal price, BigDecimal pricePromotion, String measurements) {
        this.productName = productName;
        this.priceInfo = new PriceInfo(price, pricePromotion);
        this.measurements = measurements;
        this.id = null;
    }

    // Constructor with id (for alts)
    public ProductResult(String productName, BigDecimal price, BigDecimal pricePromotion, String measurements, Long id) {
        this.productName = productName;
        this.priceInfo = new PriceInfo(price, pricePromotion);
        this.measurements = measurements;
        this.id = id;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public PriceInfo getPriceInfo() {
        return priceInfo;
    }

    public void setPriceInfo(PriceInfo price) {
        this.priceInfo = price;
    }

    public String getMeasurements() {
        return measurements;
    }

    public void setMeasurements(String measurements) {
        this.measurements = measurements;
    }

    public Long getId() { return id; }    
}
