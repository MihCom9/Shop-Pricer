package com.example.demo.model.projection.Category;

public class CategoryInfo {
    private String name;
    private String unitType;

    public CategoryInfo(){}

    public CategoryInfo(String name, String unitType) {
        this.name = name;
        this.unitType = unitType;
    }

    public String getName() {
        return name;
    }

    public String getUnitType() {
        return unitType;
    }

}
