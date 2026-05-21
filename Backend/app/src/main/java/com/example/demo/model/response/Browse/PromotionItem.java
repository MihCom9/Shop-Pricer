package com.example.demo.model.response.Browse;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.logging.Logger;

import com.example.demo.model.projection.Browse.PromotionProjection;
import com.example.demo.model.response.Product.ProductResult;

public class PromotionItem extends ProductResult {
    private static final Logger log = Logger.getLogger(PromotionItem.class.getName());

    private List<String> locations;
    private String storeName;
    private String categoryName;
    private double discountPercent;

    private static BigDecimal parsePrice(String price) {
        if (price == null || price.isBlank()) {
            log.warning("parsePrice received null or blank value");
            return null;
        }
        try {
            return new BigDecimal(price.trim().replace(",", "."));
        } catch (NumberFormatException e) {
            log.warning("parsePrice failed to parse: '" + price + "'");
            return null;
        }
    }

    public PromotionItem(String productName, List<String> locations, String storeName,
        String categoryName, String measurements, BigDecimal price, BigDecimal pricePromotion) {
        super(
            productName,
            price,
            pricePromotion,
            measurements
        );
        this.locations = new ArrayList<>(locations);
        this.storeName = storeName != null ? storeName : locations.get(0);
        this.categoryName = categoryName != null ? categoryName : "Other";
    }

    public List<String> getStore() { return locations; }
    public String getStoreName() { return storeName; }
    public String getCategoryName() { return categoryName; }
    public double getDiscountPercent() { return discountPercent; }
    public void addLocation(String location) {
        log.fine("Adding location '" + location + "' to " + getProductName());
        this.locations.add(location);
    }

    public boolean isSamePromotion(PromotionProjection item) {
        BigDecimal itemPromo = parsePrice(item.getPricePromotion());
        boolean result = getProductName().equals(item.getProductName()) &&
                this.storeName.equals(item.getStoreName()) &&
                getPriceInfo().getPrice().compareTo(parsePrice(item.getPrice())) == 0 &&
                Objects.equals(getPriceInfo().getPricePromotion(), itemPromo);
        return result;
    }

    @Override
    public String toString() {
        return "PromotionItem{" +
            "productName='" + getProductName() + "'" +
            ", storeName='" + storeName + "'" +
            ", locations=" + locations +
            ", categoryName='" + categoryName + "'" +
            ", price=" + getPriceInfo().getPrice() +
            ", pricePromotion=" + getPriceInfo().getPricePromotion() +
            ", discountPercent=" + discountPercent +
            "}";
    }
}