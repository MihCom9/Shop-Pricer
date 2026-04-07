package com.example.demo.data.repository;

import java.math.BigDecimal;

public interface PromotionProjection {
    String getProductName();
    String[] getLocations();
    String getStoreName();
    String getCategory();
    String getCategoryName();
    String getPrice();
    String getPricePromotion();
    String getMeasurements();
    BigDecimal getEffectivePrice();
}
