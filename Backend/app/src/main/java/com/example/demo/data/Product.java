// "Населено място","Търговски обект","Наименование на продукта","Код на продукта","Категория","Цена на дребно","Цена в промоция"
// "72624","БАЛИК - ул.Орфей №36","СИРЕНЕ КРАВЕ РОДОПЕЯ 1КГ КУТИЯ","000006","9","21.99",""
package com.example.demo.data;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Product {

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;
    private String city;
    private String store;
    @Column(name = "product_name")
    private String productName;
    private String code;
    private String category;
    private String price;
    @Column(nullable = true)
    private String price_promotion;

    protected Product() {}

    public Product(String city,String store,String product_name,String code,String category,String price,String price_promotion){
        this.city=city;
        this.store=store;
        this.productName=product_name;
        this.code=code;
        this.category=category;
        this.price=price;
        this.price_promotion=price_promotion;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getStore() {
        return store;
    }

    public void setStore(String store) {
        this.store = store;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPrice() {
        return price;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public String getPrice_promotion() {
        return price_promotion;
    }

    public void setPrice_promotion(String price_promotion) {
        this.price_promotion = price_promotion;
    }
    public BigDecimal getPriceAsDecimal() {
    if (price == null || price.isEmpty()) return null;
    return new BigDecimal(price.trim().replace(",", "."));
    }

    public BigDecimal getPricePromotionAsDecimal() {
        if (price_promotion == null || price_promotion.isEmpty()) return null;
        return new BigDecimal(price_promotion.trim().replace(",", "."));
    }

    public BigDecimal getEffectivePrice() {
        try {
            if (price_promotion != null && !price_promotion.isEmpty()) {
                BigDecimal promoPrice = new BigDecimal(price_promotion.trim().replace(",", "."));
                if (promoPrice.compareTo(BigDecimal.ZERO) > 0) {
                    return promoPrice;
                }
            }
            if (price != null && !price.isEmpty()) {
                return new BigDecimal(price);
            }
        } catch (NumberFormatException e) {
            // fallback
        }
        return BigDecimal.ZERO;
    }

    
}