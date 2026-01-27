package com.example.demo.service;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.data.Product;
import com.example.demo.data.repository.ProductRepository;
import com.example.demo.model.StoreResult;
import com.example.demo.model.SearchProduct;

@Service
public class ShoppingService {

    private final ProductRepository productRepository;

    public ShoppingService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }
    private boolean saveStoreResultsInFile(Map<String, Map<String, BigDecimal>> storeProductPrices, int compareSize){
        String filePath = "/logs/appStoreResults.log";
         try {
        File file = new File(filePath);

        // Create parent directories if they don't exist
        File parentDir = file.getParentFile();
        if (parentDir != null && !parentDir.exists()) {
            parentDir.mkdirs();
        }

        // Use try-with-resources to safely write to file
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(file))) {
            for (Map.Entry<String, Map<String, BigDecimal>> storeEntry : storeProductPrices.entrySet()) {
                String store = storeEntry.getKey();
                Map<String, BigDecimal> products = storeEntry.getValue();
                writer.write(String.format("Store %s has %d/%d products", store,products.size(),compareSize));
                writer.write("\n");
            }
        }

        System.out.println("[INFO] Store results saved to " + file.getAbsolutePath());
        return true;
        } catch (IOException e) {
            System.err.println("[ERROR] Failed to save store results: " + e.getMessage());
            return false;
        }
    }
    private int extractGrams(String productName) {
        Pattern GRAMS_PATTERN = Pattern.compile("(\\d+)\\s*ГР", Pattern.CASE_INSENSITIVE);
        Matcher matcher = GRAMS_PATTERN.matcher(productName);
        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }
        return 0; // default for unit-based items
    }
    private int extractMilliliters(String productName) {
        Pattern LITERS_PATTERN = Pattern.compile("(\\d+)\\s*Л", Pattern.CASE_INSENSITIVE);
        Matcher matcher = LITERS_PATTERN.matcher(productName);
        if (matcher.find()) {
            int liters = Integer.parseInt(matcher.group(1));
            return liters * 1000; // convert to ml for uniformity
        }
        return 0;
    }
    public StoreResult findCheapestStore(String city, List<SearchProduct> shoppingList) {

        Map<String, Map<String, BigDecimal>> storeProductPrices = new HashMap<>();

        for (SearchProduct sp : shoppingList) {

            String namePattern = "%" + sp.getName() + "%";
            String brandPattern = sp.getBrand() == null
                    ? null
                    : "%" + sp.getBrand() + "%";

            List<Product> products =
                productRepository.findMatchingProductsBrand(
                    city,
                    namePattern,
                    brandPattern
                );

            // cheapest product PER STORE
            Map<String, Product> cheapestPerStore = products.stream()
                    .collect(Collectors.toMap(
                            Product::getStore,
                            p -> p,
                            (p1, p2) -> p1.getEffectivePrice().compareTo(p2.getEffectivePrice()) <= 0 ? p1 : p2
                    ));

            for (Map.Entry<String, Product> entry : cheapestPerStore.entrySet()) {
                Product product = entry.getValue();

                // Determine actual quantity in product's unit
                int productWeightGrams = 0;
                int productVolumeMl = 0;
                if(sp.getWeightInGrams()!=null &&sp.getWeightInGrams()>0){
                    productWeightGrams = extractGrams(product.getProductName());
                    System.out.printf("Product %s weight %d\n",product.getProductName(),productWeightGrams);
                    productVolumeMl = extractMilliliters(product.getProductName());
                    System.out.printf("Product %s ml %d\n",product.getProductName(),productVolumeMl);

                }

                BigDecimal cost;
                BigDecimal quantityBD = BigDecimal.valueOf(sp.getQuantity());
                if (productWeightGrams > 0) {
                    // User quantity is in grams
                    // For example, if user wants 200gr, and productWeightGrams=400, scale price by 200/400
                    BigDecimal requestedWeightBD = BigDecimal.valueOf(sp.getWeightInGrams());
                    BigDecimal productWeightBD = BigDecimal.valueOf(productWeightGrams);

                    cost = product.getEffectivePrice()
                            .multiply(requestedWeightBD.divide(productWeightBD, 4, RoundingMode.HALF_UP))
                            .multiply(quantityBD);
                } else if (productVolumeMl > 0) {
                    // User quantity is in milliliters (liters converted to ml)
                    BigDecimal requestedVolumeBD = BigDecimal.valueOf(sp.getWeightInGrams()); // use grams field for ml if needed
                    BigDecimal productVolumeBD = BigDecimal.valueOf(productVolumeMl);

                    cost = product.getEffectivePrice()
                            .multiply(requestedVolumeBD.divide(productVolumeBD, 4, RoundingMode.HALF_UP))
                            .multiply(quantityBD);
                } else {
                    // Unit-based item (no grams or liters)
                    cost = product.getEffectivePrice()
                            .multiply(BigDecimal.valueOf(sp.getQuantity()));
                }

                storeProductPrices
                        .computeIfAbsent(entry.getKey(), k -> new HashMap<>())
                        .put(product.getProductName(), cost);

                // only print if price is 0
                if (cost.compareTo(BigDecimal.ZERO) == 0) {
                    System.out.printf("[WARNING] Store %s cheapest product for '%s' has 0 price! Product: %s\nCost is %s and the price is %s\n",
                            entry.getKey(), sp.getName(), product.getProductName(), cost, product.getEffectivePrice());
                }
            }
        }

        // Only keep stores that have all requested products
        Map<String, BigDecimal> storeTotals = storeProductPrices.entrySet().stream()
                .filter(e -> e.getValue().size() == shoppingList.size())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> e.getValue().values().stream()
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                ));

        // Print stores that are skipped (don't have all products)
        int goodStores = 0, badStores = 0;

        for (Map.Entry<String, Map<String, BigDecimal>> e : storeProductPrices.entrySet()) {
            String store = e.getKey();
            int productsFound = e.getValue().size();
            int totalRequested = shoppingList.size();

            if (productsFound < totalRequested) {
                System.out.printf("[INFO] Store %s skipped: missing products, has %d/%d\n",
                        store, productsFound, totalRequested);
                badStores++;
            } else {
                System.out.printf("[INFO] Store %s included: has all products, %d/%d\n",
                        store, productsFound, totalRequested);
                goodStores++;
            }
        }

        System.out.printf("Total good stores: %d, bad stores: %d\n", goodStores, badStores);

        // saveStoreResultsInFile(storeProductPrices,shoppingList.size());        
        
        StoreResult cheapestStore= storeTotals.entrySet()
                .stream()
                .min(Map.Entry.comparingByValue())
                .map(e -> new StoreResult(e.getKey(), e.getValue()))
                .orElseThrow(() -> new RuntimeException("No store has all requested products"));
        Map<String, BigDecimal> cheapestStoreProducts = storeProductPrices.get(cheapestStore.getStore());
        cheapestStoreProducts.forEach((product, price) -> System.out.printf("Product: %s, Price: %.2f\n", product, price.floatValue()));
        return cheapestStore;
    }
    
    // public List<Product> searchProductsByCityAndKeyword(String city, String keyword) {
    // List<Product> products = productRepository.searchProductsByCityAndKeyword(city, keyword);

    // // Convert string prices to BigDecimal safely
    // return products.stream().map(p -> {
    //     try {
    //         if (p.getPrice() != null) {
    //             p.setPrice(new BigDecimal(p.getPrice().toString()));
    //         } else {
    //             p.setPrice(null);
    //         }
    //     } catch (Exception e) {
    //         p.setPrice(null);
    //     }

    //     try {
    //         if (p.getPrice_promotion() != null) {
    //             p.setPrice_promotion(new BigDecimal(p.getPrice_promotion().toString()));
    //         } else {
    //             p.setPrice_promotion(null);
    //         }
    //     } catch (Exception e) {
    //         p.setPrice_promotion(null);
    //     }
    //     return p;
    // }).collect(Collectors.toList());
    // }
}

