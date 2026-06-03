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
        if(pricePromotion == null || pricePromotion.compareTo(BigDecimal.ZERO) == 0){
            this.pricePromotion = null;
        }else{
            this.pricePromotion = pricePromotion;
        }
        this.price = price;
        this.effectivePrice = effectivePrice;
        this.pricePerKg = pricePerKg;
        this.discountPercent = discountPercent;
        this.savings = savings;
    }

    public PriceInfo(BigDecimal price, BigDecimal pricePromotion) {
        if (price == null) {
            throw new IllegalArgumentException("Price cant be null");
        }
        if(pricePromotion == null || pricePromotion.compareTo(BigDecimal.ZERO) == 0){
            this.pricePromotion = null;
        }else{
            this.pricePromotion = pricePromotion;
        }
        this.price = price;
        this.effectivePrice = this.pricePromotion != null ? this.pricePromotion : this.price;
        this.discountPercent = this.pricePromotion != null ? calculateDiscountPercentige(this.price, this.pricePromotion) : 0.0;
        this.pricePerKg = null;
        this.savings = calculateSavings(this.price, this.effectivePrice);
    }

    public PriceInfo(Product product){
        if(product == null){
            throw new IllegalArgumentException("Product cant be null");
        }
        this.price = product.getPriceAsDecimal();
        BigDecimal promo = product.getPricePromotionAsDecimal();
        this.pricePromotion = (promo == null || promo.compareTo(BigDecimal.ZERO) == 0) ? null : promo;
        this.effectivePrice = product.getEffectivePrice();
        this.discountPercent = this.pricePromotion==null? 0.0 : calculateDiscountPercentige(this.price, this.pricePromotion);
        this.pricePerKg = null;
        this.savings = this.effectivePrice != null ? calculateSavings(this.price, this.effectivePrice) : BigDecimal.ZERO;
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
