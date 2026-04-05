package com.example.demo.model.Admin;

public class CreateProductTypeAliasRequest {
    private String productTypeCode;
    private String name;
    
    public CreateProductTypeAliasRequest(String productTypeCode, String name) {
        this.productTypeCode = productTypeCode;
        this.name = name;
    }

    public String getProductTypeCode() {
        return productTypeCode;
    }

    public void setProductTypeCode(String productTypeCode) {
        this.productTypeCode = productTypeCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
