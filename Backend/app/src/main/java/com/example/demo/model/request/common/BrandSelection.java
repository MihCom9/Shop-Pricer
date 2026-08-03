package com.example.demo.model.request.common;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Objects;

public class BrandSelection {

    public enum State {
        @JsonProperty("preferred") PREFERRED,
        @JsonProperty("excluded") EXCLUDED
    }

    private Integer brandId;
    private State state;

    public BrandSelection() {}

    public BrandSelection(Integer brandId, State state) {
        this.brandId = brandId;
        this.state = state;
    }

    public Integer getBrandId() {
        return brandId;
    }

    public void setBrandId(Integer brandId) {
        this.brandId = brandId;
    }

    public State getState() {
        return state;
    }

    public void setState(State state) {
        this.state = state;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BrandSelection that = (BrandSelection) o;
        return Objects.equals(brandId, that.brandId) && state == that.state;
    }

    @Override
    public int hashCode() {
        return Objects.hash(brandId, state);
    }
}