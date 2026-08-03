package com.example.demo.entity;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, name="cid")
    private Integer code;  // 1,2,3,4

    @Column(length = 255, name="name")
    private String name;

    @Column(nullable = false, length = 25, name="unit_type")
    private String unitType;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "category_brands",
        joinColumns = @JoinColumn(name = "category_id"),
        inverseJoinColumns = @JoinColumn(name = "brand_id")
    )
    private Set<Brand> brands = new HashSet<>();

    protected Category(){}

    public Category(Long id, Integer code, String name, String unitType) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.unitType = unitType;
    }

    public Category(Integer code, String name) {
        this.code = code;
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public Integer getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getUnitType() {
        return unitType;
    }

    public boolean isWeightBased() {
        return "weight".equals(unitType);
    }

    public Set<Brand> getBrands() {
        return brands;
    }

}
