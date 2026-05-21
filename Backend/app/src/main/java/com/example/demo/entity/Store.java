package com.example.demo.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "stores")
public class Store {
    @Id
    private Long id;
    String name;
    
    public Store(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
    
}
