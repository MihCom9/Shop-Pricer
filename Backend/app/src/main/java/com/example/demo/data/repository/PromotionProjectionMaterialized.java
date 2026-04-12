package com.example.demo.data.repository;

import java.math.BigDecimal;

public interface PromotionProjectionMaterialized {
    String getProductname();
    String getStorename();
    String getCategory();
    String getCategoryname();
    String getMeasurements();
    BigDecimal getDiscountPerc();
    BigDecimal getPromoNum();
    BigDecimal getPriceNum();
    BigDecimal getEffectivePrice();
    String[] getLocations();
}
