package com.example.demo.model.response.Shopping;

import java.math.BigDecimal;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.example.demo.entity.Product;
import com.example.demo.model.response.Product.ProductResult;

public class ShoppingProduct extends ProductResult {
    private boolean weightBased;
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

    public ShoppingProduct(Product product){
        super(product);
        parseMeasurements(product.getMeasurements(), product.getProductName());
        this.history = null;
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

    public List<BigDecimal> getHistory() {
        return history;
    }
    
}
