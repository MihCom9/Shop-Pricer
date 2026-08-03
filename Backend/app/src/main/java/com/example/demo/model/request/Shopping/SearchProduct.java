package com.example.demo.model.request.Shopping;

import java.util.List;
import java.util.Objects;

import com.example.demo.model.request.common.BrandSelection;

public class SearchProduct {
    private String name;
    private String category;
    private List<BrandSelection> brandSelections;
    private Integer quantity;
    private Double weightGrams;

    public SearchProduct(String name, String category, List<BrandSelection> brandSelections, Integer quantity) {
        this.name = name;
        this.category = category;
        this.brandSelections = brandSelections;
        this.quantity = quantity;
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

    public List<BrandSelection> getBrandSelections() {
        return brandSelections;
    }

    public void setBrandSelections(List<BrandSelection> brandSelections) {
        this.brandSelections = brandSelections;
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
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        SearchProduct that = (SearchProduct) o;

        return Objects.equals(this.name, that.name) &&
                Objects.equals(this.brandSelections, that.brandSelections) &&
                Objects.equals(this.category, that.category) &&
                Objects.equals(this.quantity, that.quantity) &&
                Objects.equals(this.weightGrams, that.weightGrams);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, brandSelections, category, quantity, weightGrams);
    }
}