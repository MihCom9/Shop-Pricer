// "Населено място","Търговски обект","Наименование на продукта","Код на продукта","Категория","Цена на дребно","Цена в промоция"
// "72624","БАЛИК - ул.Орфей №36","СИРЕНЕ КРАВЕ РОДОПЕЯ 1КГ КУТИЯ","000006","9","21.99",""
package com.example.demo.data;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "product_test")
public class Product {

    @Id
    private Long id;
    private String city;
    private String store;
    @Column(name = "product_name", insertable = false, updatable = false)
    private String name;
    private String code;
    private String category;
    private String price;
    @Column(name = "price_promotion", nullable = true)
    private String price_promotion;
    @Transient
    private String searchVector;
    @Column(name = "full_store_name", insertable = false, updatable = false)
    private String fullStoreName;

    protected Product() {}

    public Product(String city,String store,String product_name,String code,String category,String price,String price_promotion, String fullStoreName){
        this.city=city;
        this.store=store;
        this.name=product_name;
        this.code=code;
        this.category=category;
        this.price=price;
        this.price_promotion=price_promotion;
        this.fullStoreName=fullStoreName;
    }
    public Product(Product other){
        city= other.city;
        store= other.store;
        name = other.name;
        code= other.code;
        category=other.category;
        price= other.price;
        price_promotion= other.price_promotion;
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
        return name;
    }

    public void setProductName(String name) {
        this.name = name;
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

    public String getPricePromotion() {
        return price_promotion;
    }

    public void setPricePromotion(String price_promotion) {
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

    public String getFullStoreName() {
        return fullStoreName;
    }

    public void setFullStoreName(String fullStoreName) {
        this.fullStoreName = fullStoreName;
    }
    
}