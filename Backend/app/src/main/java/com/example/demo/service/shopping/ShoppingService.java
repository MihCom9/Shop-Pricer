package com.example.demo.service.shopping;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.lang.classfile.ClassFile.Option;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.data.Product;
import com.example.demo.data.ProductType;
import com.example.demo.data.repository.ProductRepository;
import com.example.demo.data.repository.ProductTypeRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

import com.example.demo.model.SearchProduct;
import com.example.demo.model.Shopping.StoreResult;

@Service
public class ShoppingService {
    @PersistenceContext
    private EntityManager entityManager;
    private final ProductRepository productRepository;
    private final ProductTypeRepository productTypeRepository;

    public ShoppingService(ProductRepository productRepository, ProductTypeRepository productTypeRepository) {
        this.productRepository = productRepository;
        this.productTypeRepository = productTypeRepository;
    }
    private boolean saveStoreResultsInFile(Map<String, Map<Product, BigDecimal>> storeProductPrices, int compareSize){
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
            for (Map.Entry<String, Map<Product, BigDecimal>> storeEntry : storeProductPrices.entrySet()) {
                String store = storeEntry.getKey();
                Map<Product, BigDecimal> products = storeEntry.getValue();
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
    public List<StoreResult> findCheapestStore(String city, List<SearchProduct> shoppingList) {

        Map<String, Map<Product, BigDecimal>> storeProductPrices = new HashMap<>();

        for (SearchProduct sp : shoppingList) {

            String namePattern = sp.getName();
            Integer code = productTypeRepository.findByProductNameIgnoreCase(sp.getCategory())
                .orElseThrow(() -> new RuntimeException("Product type not found"))
                .getCode();
            System.out.print("Code: ");
            System.out.println(code);
            List<Product> products;
            if(!namePattern.isEmpty()){
                products =
                    productRepository.findMatchingProductsNew(
                        city,
                        code.toString(),
                        sp.getName()
                );
            }else{
                products =  productRepository.findMatchingProductsEmptyName(city, code.toString());
            }

            // cheapest product PER STORE
            Map<String, Product> cheapestPerStore = products.stream()
                    .collect(Collectors.toMap(
                            Product::getStore,
                            p -> p,
                            (p1, p2) -> p1.getEffectivePrice().compareTo(p2.getEffectivePrice()) <= 0 ? p1 : p2
                ));

            for (Map.Entry<String, Product> entry : cheapestPerStore.entrySet()) {
                Product product = entry.getValue();

                BigDecimal cost;
                BigDecimal quantityBD = BigDecimal.valueOf(sp.getQuantity());
                cost = product.getEffectivePrice()
                        .multiply(BigDecimal.valueOf(sp.getQuantity()));

                storeProductPrices
                        .computeIfAbsent(entry.getKey(), k -> new HashMap<>())
                        .put(product, cost);

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

        for (Map.Entry<String, Map<Product, BigDecimal>> e : storeProductPrices.entrySet()) {
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

        saveStoreResultsInFile(storeProductPrices,shoppingList.size());        
        List<StoreResult> cheapestStores = new ArrayList<>();
        for(Map.Entry<String, BigDecimal> entry : storeTotals.entrySet()){
            String storeLocation= entry.getKey();
            Map<Product, BigDecimal>store=storeProductPrices.get(storeLocation);
            String storeName = store.keySet().iterator().next().getFullStoreName();
            Optional<StoreResult> found = cheapestStores.stream()
            .filter(r -> r.getStoreName().equals(storeName) && r.getTotalPrice().equals(entry.getValue()))
            .findFirst();
            if(found.isEmpty()){
                cheapestStores.add(new StoreResult(storeLocation,storeName,new ArrayList<>(store.keySet()),entry.getValue()));
            }else{
                StoreResult storeFound= found.get();
                storeFound.addLocation(storeLocation);
            }
        }
        cheapestStores.sort(Comparator.comparing(StoreResult::getTotalPrice));
        if (cheapestStores.isEmpty()) {
            throw new NoSuchElementException("Store not found");
        }
        for (int i = 0; i < Math.min(10, cheapestStores.size()); i++) {
            StoreResult sr = cheapestStores.get(i);
            System.out.printf("Store name: %s, locations: %s\n", sr.getStoreName(), sr.getLocations());
            
            // use first location to look up products
            Map<Product, BigDecimal> cheapestStoreProducts = storeProductPrices.get(sr.getLocations().get(0));
            cheapestStoreProducts.forEach((product, price) -> 
                System.out.printf("Product: %s, Price: %.2f\n", product.getProductName(), price.floatValue()));
        }
        return cheapestStores;
    }
    void normalizeProductName(List<String> productNames){
        for (int i = 0; i < productNames.size(); i++) {

            String product = productNames.get(i);

            String[] words = product.split("\\s+");

            for (int j = 0; j < words.length; j++) {
                if (!words[j].isEmpty()) {
                    words[j] = words[j].substring(0,1).toUpperCase()
                            + words[j].substring(1).toLowerCase();
                }
            }
            productNames.set(i, String.join(" ", words));
            System.out.println(productNames.get(i));
        }
    }
}

