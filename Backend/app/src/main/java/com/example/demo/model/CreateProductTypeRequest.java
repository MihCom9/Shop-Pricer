package com.example.demo.model;

public class CreateProductTypeRequest {
    private Integer code;
    private String productName;

    public CreateProductTypeRequest(Integer code,String productName) {
        this.code = code;
        this.productName=productName;
    }

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }   
}
