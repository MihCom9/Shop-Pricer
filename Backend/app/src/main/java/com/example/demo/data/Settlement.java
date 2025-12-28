package com.example.demo.data;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Settlement {

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;
    private String sid;
    private String name;
    private String name_en;
    private String stype;
    private String oblast;
    private String obshtina;

    protected Settlement() {}

    public Settlement(String sid,String name,String name_en,String stype,String oblast,String obshtina){
        this.sid=sid;
        this.name=name;
        this.name_en=name_en;
        this.stype=stype;
        this.oblast=oblast;
        this.obshtina=obshtina;
    }

    public Long getId(){
        return id;
    }

    public String getSid(){
        return sid;
    }
}