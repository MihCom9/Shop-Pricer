package com.example.demo.model.Shopping;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class PromotionItem {
    private String productName;
    private String store;
    private String storeName;
    private String categoryName;
    private BigDecimal price;
    private BigDecimal pricePromotion;
    private double discountPercent;

    public PromotionItem(String productName, String store, String storeName,
                         String categoryName, String price, String pricePromotion) {
        this.productName = productName;
        this.store = store;
        this.storeName = storeName != null ? storeName : store;
        this.categoryName = categoryName != null ? categoryName : "Other";
        this.price = new BigDecimal(price.trim().replace(",", "."));
        this.pricePromotion = new BigDecimal(pricePromotion.trim().replace(",", "."));
        double ratio = this.pricePromotion.doubleValue() / this.price.doubleValue();
        this.discountPercent = BigDecimal.valueOf((1.0 - ratio) * 100)
                .setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    public String getProductName() { return productName; }
    public String getStore() { return store; }
    public String getStoreName() { return storeName; }
    public String getCategoryName() { return categoryName; }
    public BigDecimal getPrice() { return price; }
    public BigDecimal getPricePromotion() { return pricePromotion; }
    public double getDiscountPercent() { return discountPercent; }
}
