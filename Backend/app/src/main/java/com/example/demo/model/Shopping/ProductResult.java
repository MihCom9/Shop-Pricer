package com.example.demo.model.Shopping;

import java.math.BigDecimal;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.example.demo.data.Product;

public class ProductResult {
    private String productName;
    private BigDecimal price;
    private BigDecimal pricePromotion;
    private String measurements;
    private boolean weightBased;
    private boolean sizeMismatch;

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

    public ProductResult(Product product, Double requestedGrams) {
        this.productName = product.getProductName();
        this.price = product.getPriceAsDecimal();
        this.pricePromotion = product.getPricePromotionAsDecimal();
        parseMeasurements(product.getMeasurements(), product.getProductName());
        this.sizeMismatch = computeSizeMismatch(requestedGrams);
    }

    private boolean computeSizeMismatch(Double requestedGrams) {
        if (requestedGrams == null) return false;
        Matcher m = QTY_PATTERN.matcher((measurements != null ? measurements : productName != null ? productName : "").toUpperCase());
        if (!m.find()) return true;
        String unit = m.group(2).toUpperCase();
        if (unit.equals("БР")) return false;
        double val = Double.parseDouble(m.group(1).replace(",", "."));
        double productGrams = (unit.equals("КГ") || unit.equals("Л")) ? val * 1000 : val;
        return Math.abs(productGrams - requestedGrams) > 1.0;
    }

    private void parseMeasurements(String dbMeasurements, String name) {
        // Prefer DB value if available
        if (dbMeasurements != null && !dbMeasurements.isBlank()) {
            this.measurements = dbMeasurements.trim();
            String upper = dbMeasurements.toUpperCase();
            this.weightBased = upper.contains("КГ") || upper.contains("ГР")
                    || upper.contains("Л") || upper.contains("МЛ");
            return;
        }
        if (name == null) {
            this.measurements = null;
            this.weightBased = false;
            return;
        }
        String upper = name.toUpperCase();
        // Check per-unit pricing (e.g. /кг)
        Matcher perUnit = PER_UNIT_PATTERN.matcher(upper);
        if (perUnit.find()) {
            String unit = perUnit.group(1).toLowerCase();
            this.measurements = "цена/" + unit;
            this.weightBased = true;
            return;
        }
        // Check fixed quantity (e.g. 500ГР)
        Matcher qty = QTY_PATTERN.matcher(upper);
        if (qty.find()) {
            String unit = qty.group(2).toUpperCase();
            this.measurements = qty.group(1).replace(",", ".") + " " + unit.toLowerCase();
            this.weightBased = !unit.equals("БР");
        } else {
            this.measurements = null;
            this.weightBased = false;
        }
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getPricePromotion() {
        return pricePromotion;
    }

    public void setPricePromotion(BigDecimal pricePromotion) {
        this.pricePromotion = pricePromotion;
    }

    public String getMeasurements() {
        return measurements;
    }

    public boolean isWeightBased() {
        return weightBased;
    }

    public boolean isSizeMismatch() {
        return sizeMismatch;
    }
}
