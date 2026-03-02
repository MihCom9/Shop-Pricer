package com.example.demo.data;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "brand",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_brand_per_product_type",
            columnNames = {"product_type_id", "name"}
        )
    }
)
public class Brand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name; // "РОДОПЕЯ", "ВЕРЕЯ"

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "product_type_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_brand_product_type")
    )
    @JsonBackReference
    private ProductType productType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Brand(){}

    public Brand(String name, ProductType productType) {
        this.name = name;
        this.productType= productType;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ProductType getProductType() {
        return productType;
    }
    
    public void setProductType(ProductType productType) {
        this.productType = productType;
    }
    

}
