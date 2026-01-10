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
    public void setId(Long id) {
        this.id = id;
    }

    public void setSid(String sid) {
        this.sid = sid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getName_en() {
        return name_en;
    }

    public void setName_en(String name_en) {
        this.name_en = name_en;
    }

    public String getStype() {
        return stype;
    }

    public void setStype(String stype) {
        this.stype = stype;
    }

    public String getOblast() {
        return oblast;
    }

    public void setOblast(String oblast) {
        this.oblast = oblast;
    }

    public String getObshtina() {
        return obshtina;
    }

    public void setObshtina(String obshtina) {
        this.obshtina = obshtina;
    }
    
}