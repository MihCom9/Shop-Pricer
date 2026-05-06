package com.example.demo.model.Shopping;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.example.demo.data.Product;
import com.example.demo.model.SearchProduct;

public class ShoppingProduct extends ProductResult {
    private SearchProduct cartItem;
    private boolean weightBased;
    private boolean sizeMismatch;
    private List<BigDecimal> history;


    // Matches fixed quantities: 500ГР, 1КГ, 1Л, 500МЛ, 5БР
    private static final Pattern QTY_PATTERN = Pattern.compile(
        "(\\d+(?:[,.]\\d+)?)\\s*(КГ|ГР|Л|МЛ|БР)",
        Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );
    // Matches per-weight pricing: /кг, /г, /л
    private static final Pattern PER_UNIT_PATTERN = Pattern.compile(
        "/(КГ|ГР|Г|Л|МЛ)\\b",
        Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );

    public ShoppingProduct(Product product, Double requestedGrams, SearchProduct cartItem){
        super(product);
        parseMeasurements(product.getMeasurements(), product.getProductName());
        this.sizeMismatch = computeSizeMismatch(requestedGrams);
        this.cartItem = cartItem;
        this.history = null;
    }

    private boolean computeSizeMismatch(Double requestedGrams) {
        if (requestedGrams == null) return false;
        String source = getMeasurements() != null ? getMeasurements() : getProductName() != null ? getProductName() : "";
        Matcher m = QTY_PATTERN.matcher(source.toUpperCase());
        if (!m.find()) return true;
        String unit = m.group(2).toUpperCase();
        if (unit.equals("БР")) return false;
        double val = Double.parseDouble(m.group(1).replace(",", "."));
        double productGrams = (unit.equals("КГ") || unit.equals("Л")) ? val * 1000 : val;
        return Math.abs(productGrams - requestedGrams) > 1.0;
    }

    private void parseMeasurements(String dbMeasurements, String name) {
        if (dbMeasurements != null && !dbMeasurements.isBlank()) {
            setMeasurements(dbMeasurements.trim());
            String upper = dbMeasurements.toUpperCase();
            this.weightBased = upper.contains("КГ") || upper.contains("ГР")
                || upper.contains("Л") || upper.contains("МЛ");
            return;
        }
        if (name == null) {
            setMeasurements(null);
            this.weightBased = false;
            return;
        }
        String upper = name.toUpperCase();
        Matcher perUnit = PER_UNIT_PATTERN.matcher(upper);
        if (perUnit.find()) {
            String unit = perUnit.group(1).toLowerCase();
            setMeasurements("цена/" + unit);
            this.weightBased = true;
            return;
        }
        Matcher qty = QTY_PATTERN.matcher(upper);
        if (qty.find()) {
            String unit = qty.group(2).toUpperCase();
            setMeasurements(qty.group(1).replace(",", ".") + " " + unit.toLowerCase());
            this.weightBased = !unit.equals("БР");
        } else {
            setMeasurements(null);
            this.weightBased = false;
        }
    }
    public boolean isWeightBased() {
        return weightBased;
    }

    public boolean isSizeMismatch() {
        return sizeMismatch;
    }

    public SearchProduct getCartItem() {
        return cartItem;
    }

    public List<BigDecimal> getHistory() {
        return history;
    }
    
}
