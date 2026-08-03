package com.example.demo.model.projection.Category;

public class CategoryInfo {
    private Long id;
    private String name;
    private String unitType;

    public CategoryInfo(){}

    public CategoryInfo(Long id, String name, String unitType) {
        this.id = id;
        this.name = name;
        this.unitType = unitType;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getUnitType() {
        return unitType;
    }
}
