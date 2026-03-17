package com.example.demo.model.Shopping;

import java.math.BigDecimal;

import com.example.demo.data.Product;

public class ProductResult {
    private String productName;
    private BigDecimal price;
    private BigDecimal pricePromotion;
    
    public ProductResult(Product product) {
        this.productName = product.getProductName();
        this.price = product.getPriceAsDecimal();
        this.pricePromotion = product.getPricePromotionAsDecimal();
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
}
