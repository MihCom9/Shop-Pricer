package com.example.demo.model.Shopping;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

import com.example.demo.data.repository.PromotionProjection;

public class PromotionItem extends ProductResult {
    private List<String> locations;
    private String storeName;
    private String categoryName;
    private double discountPercent;

    public PromotionItem(String productName, List<String> locations, String storeName,
        String categoryName, String price, String pricePromotion) {
        super(
            productName,
            new BigDecimal(price.trim().replace(",", ".")),
            new BigDecimal(pricePromotion.trim().replace(",", ".")),
            ""
        );
        this.locations = new ArrayList<>(locations);
        this.storeName = storeName != null ? storeName : locations.get(0);
        this.categoryName = categoryName != null ? categoryName : "Other";
        double ratio = getPricePromotion().doubleValue() / getPrice().doubleValue();
        this.discountPercent = BigDecimal.valueOf((1.0 - ratio) * 100)
            .setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    public List<String> getStore() { return locations; }
    public String getStoreName() { return storeName; }
    public String getCategoryName() { return categoryName; }
    public double getDiscountPercent() { return discountPercent; }
    public void addLocation(String location){ this.locations.add(location);}
    public boolean isSamePromotion(PromotionProjection item){
        return getProductName().equals(item.getProductName()) &&
                this.storeName.equals(item.getStoreName()) &&
                getPrice().compareTo(new BigDecimal(item.getPrice().trim().replace(",", "."))) == 0 &&
                getPricePromotion().compareTo(new BigDecimal(item.getPricePromotion().trim().replace(",", "."))) == 0;
    }
    @Override
    public String toString() {
        return "PromotionItem{" +
            "productName='" + getProductName() + "'" +
            ", storeName='" + storeName + "'" +
            ", locations=" + locations +
            ", categoryName='" + categoryName + "'" +
            ", price=" + getPrice() +
            ", pricePromotion=" + getPricePromotion() +
            ", discountPercent=" + discountPercent +
            "}";
    }
}
