package com.example.demo.data;

import java.time.LocalDateTime;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "product_type")
public class ProductType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code;  // CHEESE, MILK, etc.

    @Column(nullable = false, length = 100)
    private String displayName;  // СИРЕНЕ, МЛЯКО, etc.

    @OneToMany(mappedBy = "productType", fetch = FetchType.LAZY)
    private Set<Brand> brands;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected ProductType(){}

    public ProductType(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public Set<Brand> getBrands() {
        return brands;
    }

    public void setBrands(Set<Brand> brands) {
        this.brands = brands;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void addBrand(Brand brand) {
        brands.add(brand);
        brand.setProductType(this); // keep the relation consistent
    }

    public void removeBrand(Brand brand) {
        brands.remove(brand);
        brand.setProductType(null);
    }
}
