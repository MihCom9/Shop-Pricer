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
@Table(name = "product_type")
public class ProductType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Integer code;  // 1,2,3,4

    @Column(nullable = false, unique = true, length = 255)
    private String productName;

    @OneToMany(mappedBy = "productType", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private Set<ProductTypeAlias> aliases;


    @OneToMany(mappedBy = "productType", fetch = FetchType.LAZY, cascade = CascadeType.ALL,orphanRemoval = true)
    @JsonManagedReference
    private Set<Brand> brands;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

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

    public Set<Brand> getBrands() {
        return brands;
    }

    public void setBrands(Set<Brand> brands) {
        this.brands = brands;
    }

    public Set<ProductTypeAlias> getAliases() {
        return aliases;
    }

    public void setAliases(Set<ProductTypeAlias> aliases) {
        this.aliases = aliases;
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
    
    public void addAlias(ProductTypeAlias alias) {
        aliases.add(alias);
        alias.setProductType(this); // keep the relation consistent
    }

    public void removeAlias(ProductTypeAlias alias) {
        aliases.remove(alias);
        alias.setProductType(null);
    }

}
