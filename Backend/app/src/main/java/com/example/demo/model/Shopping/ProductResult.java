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
    

    public ProductResult(Product product) {
        this.productName = product.getProductName();
        this.price = product.getPriceAsDecimal();
        this.pricePromotion = product.getPricePromotionAsDecimal();
    }
    
    public ProductResult(String productName, BigDecimal price, BigDecimal pricePromotion, String measurements) {
        this.productName = productName;
        this.price = price;
        this.pricePromotion = pricePromotion;
        this.measurements = measurements;
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
    
}
