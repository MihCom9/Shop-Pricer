package com.example.demo.data;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "stores")
public class Stores {
    @Id
    private Long id;
    String name;
    
    public Stores(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
    
}
