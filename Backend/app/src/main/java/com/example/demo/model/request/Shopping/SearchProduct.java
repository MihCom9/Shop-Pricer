package com.example.demo.model.request.Shopping;

import java.util.Objects;

public class SearchProduct {
    private String name;
    private String category;
    private String brand;
    private Integer quantity;
    private Double weightGrams;

    public SearchProduct(String name,String category,String brand,Integer quantity){
        this.name=name;
        this.category=category;
        this.brand=brand;
        this.quantity=quantity;

    }
    public String toString() {
        return "SearchProduct{" +
               "name='" + name + '\'' +
               ", category='" + category + '\'' +
               ", quantity=" + quantity +
               '}';
    }
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }
    public String getCategory() {
        return category;
    }
    public void setCategory(String category) {
        this.category = category;
    }

    public Double getWeightGrams() {
        return weightGrams;
    }
    public void setWeightGrams(Double weightGrams) {
        this.weightGrams = weightGrams;
    }

    @Override
    public boolean equals(Object o){
        if(this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        SearchProduct that = (SearchProduct) o;

        return Objects.equals(this.name, that.name) &&
           Objects.equals(this.brand, that.brand) &&
           Objects.equals(this.category, that.category) &&
           Objects.equals(this.quantity, that.quantity) &&  
           Objects.equals(this.weightGrams, that.weightGrams);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(name, brand, category, quantity, weightGrams);
    }
}
