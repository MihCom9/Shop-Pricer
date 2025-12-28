package com.example.demo.data;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Category {

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;
    private String cid;
    private String name;

    protected Category() {}

    public Category(String cid,String name){
        this.cid=cid;
        this.name=name;
    }

    public Long getId(){
        return id;
    }

    public String getcid(){
        return cid;
    }
}