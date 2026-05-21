package com.example.demo.model.response.Shopping;

import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.example.demo.entity.Product;
import com.example.demo.model.request.Shopping.SearchProduct;
import com.fasterxml.jackson.annotation.JsonIgnore;

public class ShoppingProductResult {
    private String id;
    private SearchProduct cartItem;
    private ShoppingProduct product;
    private boolean sizeMismatch;
    private Integer matchTier;             // "exact" or "fallback"
    private List<ShoppingProduct> alts;

    public ShoppingProductResult(){
        this.id = UUID.randomUUID().toString();
        cartItem = null;
        product = null;
        sizeMismatch = false; 
        this.matchTier = null;
        this.alts = null;
    }

    public ShoppingProductResult(SearchProduct cartItem){
        this.id = UUID.randomUUID().toString();
        this.cartItem = cartItem;
        this.product = null;
        this.sizeMismatch = false;
        this.matchTier = null;
        this.alts = null;
    }

    public ShoppingProductResult(Product product, Double requestedGrams, SearchProduct cartItem){
        this.id = UUID.randomUUID().toString();
        this.cartItem = cartItem;
        this.product = new ShoppingProduct(product);
        this.sizeMismatch = computeSizeMismatch(requestedGrams);
        this.matchTier = product.getMatchTier();
        this.alts = null;
    }

    private static final Pattern QTY_PATTERN = Pattern.compile(
        "(\\d+(?:[,.]\\d+)?)\\s*(КГ|ГР|Л|МЛ|БР)",
        Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );

    private boolean computeSizeMismatch(Double requestedGrams) {
        if (requestedGrams == null) return false;
        String source = product.getMeasurements() != null ? product.getMeasurements() : product.getProductName() != null ? product.getProductName() : "";
        Matcher m = QTY_PATTERN.matcher(source.toUpperCase());
        if (!m.find()) return true;
        String unit = m.group(2).toUpperCase();
        if (unit.equals("БР")) return false;
        double val = Double.parseDouble(m.group(1).replace(",", "."));
        double productGrams = (unit.equals("КГ") || unit.equals("Л")) ? val * 1000 : val;
        return Math.abs(productGrams - requestedGrams) > 1.0;
    }

    public boolean isSizeMismatch() {
        return sizeMismatch;
    }

    public SearchProduct getCartItem() {
        return cartItem;
    }

    public ShoppingProduct getProduct() {
        return product;
    }

    @JsonIgnore
    public boolean isFound() {
        return product != null;
    }

    public Integer getMatchTier() {
        return matchTier;
    }

    public List<ShoppingProduct> getAlts() {
        return alts;
    }

    public String getId() {
        return id;
    }
    
}
