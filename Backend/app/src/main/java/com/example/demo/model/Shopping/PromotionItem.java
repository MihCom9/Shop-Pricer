package com.example.demo.model.Shopping;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

import com.example.demo.data.repository.PromotionProjection;

public class PromotionItem {
    private String productName;
    private List<String> locations;
    private String storeName;
    private String categoryName;
    private BigDecimal price;
    private BigDecimal pricePromotion;
    private double discountPercent;

    public PromotionItem(String productName, List<String> locations, String storeName,
                         String categoryName, String price, String pricePromotion) {
        this.productName = productName;
        this.locations = new ArrayList<>(locations);
        this.storeName = storeName != null ? storeName : locations.get(0);
        this.categoryName = categoryName != null ? categoryName : "Other";
        this.price = new BigDecimal(price.trim().replace(",", "."));
        this.pricePromotion = new BigDecimal(pricePromotion.trim().replace(",", "."));
        double ratio = this.pricePromotion.doubleValue() / this.price.doubleValue();
        this.discountPercent = BigDecimal.valueOf((1.0 - ratio) * 100)
                .setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    public String getProductName() { return productName; }
    public List<String> getStore() { return locations; }
    public String getStoreName() { return storeName; }
    public String getCategoryName() { return categoryName; }
    public BigDecimal getPrice() { return price; }
    public BigDecimal getPricePromotion() { return pricePromotion; }
    public double getDiscountPercent() { return discountPercent; }
    public void addLocation(String location){ this.locations.add(location);}
    public boolean isSamePromotion(PromotionProjection item){
        return this.productName.equals(item.getProductName()) &&
                this.storeName.equals(item.getStoreName()) &&
                this.price.compareTo(new BigDecimal(item.getPrice().trim().replace(",", "."))) == 0 &&
                this.pricePromotion.compareTo(new BigDecimal(item.getPricePromotion().trim().replace(",", "."))) == 0;
    }
    @Override
    public String toString() {
        return "PromotionItem{" +
            "productName='" + productName + "'" +
            ", storeName='" + storeName + "'" +
            ", locations=" + locations +
            ", categoryName='" + categoryName + "'" +
            ", price=" + price +
            ", pricePromotion=" + pricePromotion +
            ", discountPercent=" + discountPercent +
            "}";
    }
}
