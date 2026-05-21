package com.example.demo.model.common;

import java.math.BigDecimal;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MeasurementInfo {

    private static final Pattern QTY_PATTERN = Pattern.compile(
        "(\\d+(?:[,.]\\d+)?)\\s*(КГ|ГР|Л|МЛ|БР)",
        Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );
    private static final Pattern PER_UNIT_PATTERN = Pattern.compile(
        "/(КГ|ГР|Г|Л|МЛ)\\b",
        Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );

    private final String raw;
    private final BigDecimal quantity;
    private final String unit;
    private final boolean weightBased;

    public MeasurementInfo(String raw, BigDecimal quantity, String unit, boolean weightBased) {
        this.raw = raw;
        this.quantity = quantity;
        this.unit = unit;
        this.weightBased = weightBased;
    }

    public static MeasurementInfo parse(String dbMeasurements, String productName) {
        if (dbMeasurements != null && !dbMeasurements.isBlank()) {
            return parseFromMeasurements(dbMeasurements);
        }
        if (productName != null) {
            return parseFromName(productName);
        }
        return empty();
    }

    private static MeasurementInfo parseFromMeasurements(String measurements) {
        String upper = measurements.toUpperCase();
        Matcher qty = QTY_PATTERN.matcher(upper);
        if (qty.find()) {
            String unit = qty.group(2).toUpperCase();
            BigDecimal quantity = new BigDecimal(qty.group(1).replace(",", "."));
            boolean weightBased = !unit.equals("БР");
            return new MeasurementInfo(measurements.trim(), quantity, unit, weightBased);
        }
        // Has measurements string but couldn't parse a quantity
        boolean weightBased = upper.contains("КГ") || upper.contains("ГР")
            || upper.contains("Л") || upper.contains("МЛ");
        return new MeasurementInfo(measurements.trim(), null, null, weightBased);
    }

    private static MeasurementInfo parseFromName(String productName) {
        String upper = productName.toUpperCase();

        Matcher perUnit = PER_UNIT_PATTERN.matcher(upper);
        if (perUnit.find()) {
            String unit = perUnit.group(1).toUpperCase();
            return new MeasurementInfo("цена/" + unit.toLowerCase(), null, unit, true);
        }

        Matcher qty = QTY_PATTERN.matcher(upper);
        if (qty.find()) {
            String unit = qty.group(2).toUpperCase();
            BigDecimal quantity = new BigDecimal(qty.group(1).replace(",", "."));
            boolean weightBased = !unit.equals("БР");
            String raw = quantity + " " + unit.toLowerCase();
            return new MeasurementInfo(raw, quantity, unit, weightBased);
        }

        return empty();
    }

    public static MeasurementInfo empty() {
        return new MeasurementInfo(null, null, null, false);
    }

    // getters only — no setters, fields are final
    public String getRaw() { return raw; }
    public BigDecimal getQuantity() { return quantity; }
    public String getUnit() { return unit; }
    public boolean isWeightBased() { return weightBased; }
}
