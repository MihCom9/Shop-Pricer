package com.example.demo.service.shopping;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MeasurementNormalizer {

    private static final Pattern PATTERN =
        Pattern.compile("(?:(\\d+(?:[.,]\\d+)?)\\s*%)?\\s*(?:(\\d+(?:[.,]\\d+)?)\\s*(л|l|мл|ml|гр|г|g)\\.?)?");

    public static String normalizeForComparison(String raw) {
        if (raw == null || raw.isBlank()) return null;
        String s = raw.trim().toLowerCase();
        s = s.replace(',', '.');
        s = s.replaceAll("\\s+", "");
        s = s.replaceAll("\\.$", "");
        s = s.replaceAll("\\bl\\b", "л");
        return s;
    }

    /** Produces a clean display string like "3.6% 1л" or "480г" from any messy input. */
    public static String toDisplay(String raw) {
        if (raw == null || raw.isBlank()) return null;
        String s = raw.trim().toLowerCase().replace(',', '.');

        Matcher m = PATTERN.matcher(s);
        if (!m.find()) return raw.trim();

        String fat = m.group(1);
        String amount = m.group(2);
        String unit = m.group(3);

        StringBuilder out = new StringBuilder();
        if (fat != null) out.append(fat).append("%");
        if (amount != null && unit != null) {
            if (out.length() > 0) out.append(" ");
            String normUnit = switch (unit) {
                case "l", "л" -> "л";
                case "ml", "мл" -> "мл";
                case "g", "г", "гр" -> "г";
                default -> unit;
            };
            out.append(amount).append(normUnit);
        }

        return out.length() > 0 ? out.toString() : raw.trim();
    }

    public static List<String> deduplicateForDisplay(List<String> rawValues) {
        Map<String, String> seen = new LinkedHashMap<>(); // comparisonKey -> display value

        for (String raw : rawValues) {
            String key = normalizeForComparison(raw);
            if (key == null || key.isEmpty()) continue;

            seen.putIfAbsent(key, toDisplay(raw));
        }

        return seen.values().stream().sorted().toList();
    }
}
