package com.example.demo.model;

public class SearchProduct {
    private String name;
    private String productSort;
    private String brand;
    private Integer quantity;
    private Integer weightInGrams;

    public SearchProduct(String name,String productSort,String brand,Integer quantity,Integer weightInGrams){
        this.name=name;
        this.productSort=productSort;
        this.brand=brand;
        this.quantity=quantity;
        this.weightInGrams=weightInGrams;
        
    }
    public String toString() {
        return "SearchProduct{" +
               "name='" + name + '\'' +
               ", productSort='" + productSort + '\'' +
               ", quantity=" + quantity +
               '}';
    }
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getProductSort() {
        return productSort;
    }

    public void setProductSort(String productSort) {
        this.productSort = productSort;
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
    
    public Integer getWeightInGrams() {
        return weightInGrams;
    }
    public void setWeightInGrams(Integer weightInGrams) {
        this.weightInGrams = weightInGrams;
    }
    

}
