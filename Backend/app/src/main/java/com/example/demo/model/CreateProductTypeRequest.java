package com.example.demo.model;

public class CreateProductTypeRequest {
    private String code;
    
    public CreateProductTypeRequest(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }   
}
