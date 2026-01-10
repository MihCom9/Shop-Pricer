// "Населено място","Търговски обект","Наименование на продукта","Код на продукта","Категория","Цена на дребно","Цена в промоция"
// "72624","БАЛИК - ул.Орфей №36","СИРЕНЕ КРАВЕ РОДОПЕЯ 1КГ КУТИЯ","000006","9","21.99",""
package com.example.demo.data;

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
    private String product_name;
    private String code;
    private String category;
    private String price;
    private String price_promotion;

    protected Product() {}

    public Product(String city,String store,String product_name,String code,String category,String price,String price_promotion){
        this.city=city;
        this.store=store;
        this.product_name=product_name;
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

    public String getProduct_name() {
        return product_name;
    }

    public void setProduct_name(String product_name) {
        this.product_name = product_name;
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
    
}