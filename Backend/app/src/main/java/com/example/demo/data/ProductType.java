package com.example.demo.data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "categories")
public class ProductType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, name="cid")
    private Integer code;  // 1,2,3,4

    @Column(nullable = false, unique = true, length = 255, name="name")
    private String productName;

    // @Column(name = "created_at", nullable = false, updatable = false)
    // private LocalDateTime createdAt = LocalDateTime.now();

    protected ProductType(){}

    public ProductType(Integer code, String productName) {
        this.code = code;
        this.productName=productName;
    }

    public Long getId() {
        return id;
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
