package com.example.demo.model.request.category;

import java.util.List;

import com.example.demo.model.request.common.BrandSelection;

public class AttributeFilterRequest {
    private Long categoryId;
    private List<BrandSelection> brandSelections;

    public AttributeFilterRequest() {}

    public AttributeFilterRequest(Long categoryId, List<BrandSelection> brandSelections) {
        this.categoryId = categoryId;
        this.brandSelections = brandSelections;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public List<BrandSelection> getBrandSelections() {
        return brandSelections;
    }

    public void setBrandSelection(List<BrandSelection> brandSelections) {
        this.brandSelections = brandSelections;
    }
}