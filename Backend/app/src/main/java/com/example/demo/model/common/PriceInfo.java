package com.example.demo.model.common;

import java.math.BigDecimal;
import java.math.RoundingMode;

import com.example.demo.entity.Product;

public class PriceInfo {
    private BigDecimal price;
    private BigDecimal pricePromotion;
    private BigDecimal effectivePrice;    // whichever is active
    private BigDecimal pricePerKg;        // normalized for comparison
    private double discountPercent;
    private BigDecimal savings;

    private double calculateDiscountPercentige(BigDecimal price, BigDecimal pricePromotion){
        if(price == null || pricePromotion == null){
            throw new IllegalArgumentException("Price and price promotion cant be null");
        }
        return 100.00 - (pricePromotion.multiply(BigDecimal.valueOf(100))
                            .divide(price, 10, RoundingMode.HALF_UP)
                            .doubleValue());
    }

    private BigDecimal calculateSavings(BigDecimal price, BigDecimal effectivePrice){
        if(price == null || effectivePrice == null){
            throw new IllegalArgumentException("Price and effective price cant be null");
        }
        return price.subtract(effectivePrice);
    }

    public PriceInfo(BigDecimal price, BigDecimal pricePromotion, BigDecimal effectivePrice, BigDecimal pricePerKg,
            double discountPercent, BigDecimal savings) {
        if(price == null || effectivePrice == null || savings == null){
            throw new IllegalArgumentException("Constructor arguments pricec, effective price or savings cant be null");
        }
        this.price = price;
        this.pricePromotion = pricePromotion;
        this.effectivePrice = effectivePrice;
        this.pricePerKg = pricePerKg;
        this.discountPercent = discountPercent;
        this.savings = savings;
    }

    public PriceInfo(BigDecimal price, BigDecimal pricePromotion) {
        if (price == null) {
            throw new IllegalArgumentException("Price cant be null");
        }
        this.price = price;
        this.pricePromotion = pricePromotion;
        this.effectivePrice = pricePromotion != null ? pricePromotion : price;
        this.discountPercent = pricePromotion != null ? calculateDiscountPercentige(price, pricePromotion) : 0.0;
        this.pricePerKg = null;
        this.savings = calculateSavings(price, this.effectivePrice);
    }

    public PriceInfo(Product product){
        if(product == null){
            throw new IllegalArgumentException("Product cant be null");
        }
        this.price = product.getPriceAsDecimal();
        this.pricePromotion = product.getPricePromotionAsDecimal();
        this.effectivePrice = product.getEffectivePrice();
        this.discountPercent = pricePromotion==null? 0.0 : calculateDiscountPercentige(price, pricePromotion);
        this.pricePerKg = null;
        this.savings = effectivePrice != null ? calculateSavings(price, effectivePrice) : BigDecimal.ZERO;
    }

    public BigDecimal getPrice() {
        return price;
    }
    public BigDecimal getPricePromotion() {
        return pricePromotion;
    }
    public BigDecimal getEffectivePrice() {
        return effectivePrice;
    }
    public BigDecimal getPricePerKg() {
        return pricePerKg;
    }
    public double getDiscountPercent() {
        return discountPercent;
    }
    public BigDecimal getSavings() {
        return savings;
    } 
}
