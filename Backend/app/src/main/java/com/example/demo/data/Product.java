package com.example.demo.data;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Product {

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private String id;
    private String city;
    private String product_name;
    private String code;
    private String category;
    private String price;
    private String price_promotion;

    protected Product() {}

    public Product(String city,String product_name,String code,String category,String price,String price_promotion){
        this.city=city;
        this.product_name=product_name;
        this.code=code;
        this.category=category;
        this.price=price;
        this.price_promotion=price_promotion;
    }

    public String getId(){
        return id;
    }

    public String getCity(){
        return city;
    }
}