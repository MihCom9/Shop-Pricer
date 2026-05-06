package com.example.demo.model;

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

}
