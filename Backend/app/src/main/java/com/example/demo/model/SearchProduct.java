package com.example.demo.model;

public class SearchProduct {
    private String name;
    private String productSort;
    private Integer quantity;

    public SearchProduct(String name,String productSort,Integer quantity ){
        this.name=name;
        this.productSort=productSort;
        this.quantity=quantity;
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

}
