package com.example.demo.model.common;

import java.math.BigDecimal;

public class StoreSummary {
    private BigDecimal totalPrice;
    private int totalProductCount;
    private int foundProductCount;
    private int missingProductCount;
    private boolean isBest;
    private BigDecimal savingsVsAvg;
    private BigDecimal savingsVsBest;

    public StoreSummary(BigDecimal totalPrice, int totalProductCount, int foundProductCount,
            boolean isBest, BigDecimal savingsVsAvg, BigDecimal savingsVsBest) {
        this.totalPrice = totalPrice;
        this.totalProductCount = totalProductCount;
        this.foundProductCount = foundProductCount;
        this.missingProductCount = totalProductCount - foundProductCount;
        this.isBest = isBest;
        this.savingsVsAvg = savingsVsAvg;
        this.savingsVsBest = savingsVsBest;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }
    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }
    public int getTotalProductCount() {
        return totalProductCount;
    }
    public void setTotalProductCount(int totalProductCount) {
        this.totalProductCount = totalProductCount;
    }
    public int getFoundProductCount() {
        return foundProductCount;
    }
    public void setFoundProductCount(int foundProductCount) {
        this.foundProductCount = foundProductCount;
    }
    public int getMissingProductCount() {
        return missingProductCount;
    }
    public void setMissingProductCount(int missingProductCount) {
        this.missingProductCount = missingProductCount;
    }
    public boolean isBest() {
        return isBest;
    }
    public void setBest(boolean isBest) {
        this.isBest = isBest;
    }
    public BigDecimal getSavingsVsAvg() {
        return savingsVsAvg;
    }
    public void setSavingsVsAvg(BigDecimal savingsVsAvg) {
        this.savingsVsAvg = savingsVsAvg;
    }
    public BigDecimal getSavingsVsBest() {
        return savingsVsBest;
    }
    public void setSavingsVsBest(BigDecimal savingsVsBest) {
        this.savingsVsBest = savingsVsBest;
    }
}
