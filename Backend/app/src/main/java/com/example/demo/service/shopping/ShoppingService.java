package com.example.demo.service.shopping;

import com.example.demo.data.Product;
import com.example.demo.data.ProductType;
import com.example.demo.data.repository.ProductRepository;
import com.example.demo.data.repository.ProductTypeRepository;
import com.example.demo.model.SearchProduct;
import com.example.demo.model.Shopping.ProductResult;
import com.example.demo.model.Shopping.StoreResult;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ShoppingService {

    private static final String LOG_FILE_PATH = "/logs/appStoreResults.log";

    private static final Pattern WEIGHT_PATTERN = Pattern.compile(
        "(\\d+(?:[,.]\\d+)?)\\s*(КГ|ГР|Л|МЛ)",
        Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );

    @PersistenceContext
    private EntityManager entityManager;

    private final ProductRepository productRepository;
    private final ProductTypeRepository productTypeRepository;

    public ShoppingService(ProductRepository productRepository,
                           ProductTypeRepository productTypeRepository) {
        this.productRepository = productRepository;
        this.productTypeRepository = productTypeRepository;
    }

    // ── Public API ────────────────────────────────────────────────────────────

    public List<StoreResult> findCheapestStore(String city, List<SearchProduct> shoppingList) {
        Map<String, Map<Product, BigDecimal>> storeProductPrices = new HashMap<>();
        Map<Product, Double> productToRequestedGrams = new HashMap<>();
        Map<Product, SearchProduct> productToCartItemName = new HashMap<>();

        for (SearchProduct sp : shoppingList) {
            processShoppingItem(city, sp, storeProductPrices, productToRequestedGrams, productToCartItemName);
        }

        Map<String, BigDecimal> storeTotals = computeStoreTotals(storeProductPrices, shoppingList.size());
        logStoreCompleteness(storeProductPrices, shoppingList.size());
        saveStoreResultsInFile(storeProductPrices, shoppingList.size());

        List<StoreResult> results = buildStoreResults(storeTotals, storeProductPrices, productToRequestedGrams, productToCartItemName);
        results.sort(Comparator
    .comparingInt((StoreResult sr) -> sr.getProducts().size() >= shoppingList.size() ? 0 : 1)
    .thenComparing(StoreResult::hasSizeMismatch)
    .thenComparing(StoreResult::getTotalPrice));
        if (results.isEmpty()) {
            throw new NoSuchElementException("No stores carry all requested products");
        }
        BigDecimal avgStorePrice = computeAverageStorePrice(results);
        BigDecimal bestPrice = results.get(0).getTotalPrice();
        updateStoreResults(results, avgStorePrice, bestPrice);
        logTopStoreResults(results, storeProductPrices);
        return results;
    }

    public List<ProductResult> findAlts(String name, String category, String store,String location, String city, Integer quantity,Double weightGrams){
        ProductType code   = resolveCategory(category);
        List<ProductResult> alts = productRepository.findAltsForProduct(city, code.getCode().toString(), store, location, name, 5, 0)
            .stream()
            .map(p -> new ProductResult(
                p.getProductName(),
                p.getPriceAsDecimal(),
                p.getPricePromotionAsDecimal(),
                p.getMeasurements(),
                p.getId()
            ))
            .collect(Collectors.toList());

        return alts;
    }

    // ── Step 1: resolve category and search name ──────────────────────────────

    private ProductType resolveCategory(String category) {
        return productTypeRepository.findByProductNameIgnoreCase(category)
            .orElseThrow(() -> new RuntimeException("Product type not found: " + category));
    }

    /**
     * Strips the category prefix from the search name so only the
     * differentiating part (e.g. a brand or variety) is passed to the query.
     * Returns {@code null} when no meaningful suffix remains.
     */
    private String resolveSearchName(SearchProduct sp, ProductType category) {
        String searchName = sp.getName();
        if (searchName == null || category.getProductName() == null) return searchName;

        String normalizedSearch   = searchName.trim().toLowerCase();
        String normalizedCategory = category.getProductName().trim().toLowerCase();

        if (normalizedSearch.equals(normalizedCategory)) return null;

        String stripped = searchName
            .replaceAll("(?i)^" + Pattern.quote(category.getProductName().trim()) + "\\s*", "")
            .trim();

        return stripped.isEmpty() ? null : stripped;
    }

    // ── Step 2: fetch products and pick the best one per store ────────────────

    private List<Product> fetchProducts(String city, ProductType category, String searchName) {
        String code = category.getCode().toString();
        return (searchName != null)
            ? productRepository.findMatchingProductsNew(city, code, searchName)
            : productRepository.findMatchingProductsEmptyName(city, code);
    }

    /**
     * For each store, keeps the product that best matches the search:
     * lower match tier wins; ties are broken by effective price (cheapest first).
     */
    private Map<String, Product> selectBestProductPerStore(List<Product> products) {
        return products.stream().collect(Collectors.toMap(
            Product::getStore,
            p -> p,
            (p1, p2) -> {
                int tier1 = p1.getMatchTier() != null ? p1.getMatchTier() : 2;
                int tier2 = p2.getMatchTier() != null ? p2.getMatchTier() : 2;
                if (tier1 != tier2) return tier1 < tier2 ? p1 : p2;
                return p1.getEffectivePrice().compareTo(p2.getEffectivePrice()) <= 0 ? p1 : p2;
            }
        ));
    }

    // ── Step 3: compute cost and accumulate into storeProductPrices ───────────

    private BigDecimal computeCost(SearchProduct sp, ProductType category, Product product) {
        if (category.isWeightBased()) {
            BigDecimal kgRequested = BigDecimal.valueOf(sp.getWeightGrams() / 1000.0);
            return product.getEffectivePrice().multiply(kgRequested);
        }
        return product.getEffectivePrice().multiply(BigDecimal.valueOf(sp.getQuantity()));
    }

    private void processShoppingItem(
            String city,
            SearchProduct sp,
            Map<String, Map<Product, BigDecimal>> storeProductPrices,
            Map<Product, Double> productToRequestedGrams,
            Map<Product, SearchProduct> productToCartItemName) {

        ProductType category   = resolveCategory(sp.getCategory());
        String searchName      = resolveSearchName(sp, category);
        List<Product> products = fetchProducts(city, category, searchName);

        selectBestProductPerStore(products).forEach((storeName, product) -> {
            BigDecimal cost = computeCost(sp, category, product);

            productToCartItemName.put(product, sp);

            storeProductPrices
                .computeIfAbsent(storeName, k -> new HashMap<>())
                .put(product, cost);

            if (cost.compareTo(BigDecimal.ZERO) == 0) {
                System.out.printf(
                    "[WARNING] Store %s: product '%s' (%s) has 0 price — effectivePrice: %s%n",
                    storeName, sp.getName(), product.getProductName(), product.getEffectivePrice()
                );
            }
        });
    }

    // ── Step 4: filter to stores with full product coverage ───────────────────

    private Map<String, BigDecimal> computeStoreTotals(
            Map<String, Map<Product, BigDecimal>> storeProductPrices,
            int requiredProductCount) {

        int threshold = requiredProductCount > 5
            ? (int) Math.floor(requiredProductCount * 0.8)
            : requiredProductCount;

        return storeProductPrices.entrySet().stream()
            .filter(e -> e.getValue().size() >= threshold)
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                e -> e.getValue().values().stream().reduce(BigDecimal.ZERO, BigDecimal::add)
            ));
    }

    // ── Step 5: build StoreResult list, merging duplicate store names ─────────

    private List<StoreResult> buildStoreResults(
            Map<String, BigDecimal> storeTotals,
            Map<String, Map<Product, BigDecimal>> storeProductPrices,
            Map<Product, Double> productToRequestedGrams,
            Map<Product, SearchProduct> productToCartItemName)  {

        Map<String, StoreResult> byChain = new LinkedHashMap<>(); // preserves insertion order

        for (Map.Entry<String, BigDecimal> entry : storeTotals.entrySet()) {
            String storeLocation  = entry.getKey();
            BigDecimal totalPrice = entry.getValue();
            Map<Product, BigDecimal> storeProducts = storeProductPrices.get(storeLocation);
            String storeName = storeProducts.keySet().iterator().next().getFullStoreName();

            byChain.computeIfAbsent(storeName, name -> new StoreResult(
                storeLocation, name,
                new ArrayList<>(storeProducts.keySet()),
                totalPrice,
                productToRequestedGrams,
                productToCartItemName
            )).addLocation(
                    storeLocation,
                    totalPrice,
                    new ArrayList<>(storeProducts.keySet()),
                    productToRequestedGrams,
                    productToCartItemName
                );
        }

        return new ArrayList<>(byChain.values());
        
    }

    private BigDecimal computeAverageStorePrice(List<StoreResult> results) {
        BigDecimal total = results.stream()
            .map(StoreResult::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return total.divide(new BigDecimal(results.size()), 2, RoundingMode.HALF_UP);
    }

    private void updateStoreResults(List<StoreResult> results, BigDecimal avgStorePrice, BigDecimal bestPrice){
        for (StoreResult storeResult : results) {
            storeResult.setIsBest(storeResult.getTotalPrice().compareTo(bestPrice) == 0);
            storeResult.setSavingsVsAvg(avgStorePrice.subtract(storeResult.getTotalPrice()));
        }
    }

    // ── Utility: weight extraction ────────────────────────────────────────────

    private double extractWeightGrams(String text) {
        Matcher m = WEIGHT_PATTERN.matcher(text.toUpperCase());
        if (!m.find()) return Double.MAX_VALUE;

        double val  = Double.parseDouble(m.group(1).replace(",", "."));
        String unit = m.group(2).toUpperCase();
        return (unit.equals("КГ") || unit.equals("Л")) ? val * 1000 : val;
    }

    private double extractProductWeightGrams(Product p) {
        String text = (p.getMeasurements() != null && !p.getMeasurements().isBlank())
            ? p.getMeasurements() + " " + p.getProductName()
            : p.getProductName();
        return extractWeightGrams(text);
    }

    // ── Utility: string normalization ─────────────────────────────────────────

    /** Title-cases every word in each name, modifying the list in place. */
    void normalizeProductNames(List<String> productNames) {
        productNames.replaceAll(name ->
            Arrays.stream(name.split("\\s+"))
                .filter(w -> !w.isEmpty())
                .map(w -> w.substring(0, 1).toUpperCase() + w.substring(1).toLowerCase())
                .collect(Collectors.joining(" "))
        );
        productNames.forEach(System.out::println);
    }

    // ── Logging ───────────────────────────────────────────────────────────────

    private void logStoreCompleteness(
            Map<String, Map<Product, BigDecimal>> storeProductPrices,
            int requiredProductCount) {

        long goodStores = 0, badStores = 0;

        for (Map.Entry<String, Map<Product, BigDecimal>> e : storeProductPrices.entrySet()) {
            int found        = e.getValue().size();
            boolean complete = found >= requiredProductCount;

            System.out.printf("[INFO] Store %-30s %s (%d/%d products)%n",
                e.getKey(),
                complete ? "included" : "skipped — missing products",
                found, requiredProductCount
            );

            if (complete) goodStores++; 
            else badStores++;
        }

        System.out.printf("Total — good stores: %d, skipped: %d%n", goodStores, badStores);
    }

    private void logTopStoreResults(
            List<StoreResult> results,
            Map<String, Map<Product, BigDecimal>> storeProductPrices) {

        results.stream().limit(10).forEach(sr -> {
            System.out.printf("Store: %s | locations: %s%n", sr.getStoreName(), sr.getLocations());
            storeProductPrices.get(sr.getLocations().get(0))
                .forEach((product, price) ->
                    System.out.printf("  %-50s %.2f%n", product.getProductName(), price.floatValue()));
        });
    }

    private boolean saveStoreResultsInFile(
            Map<String, Map<Product, BigDecimal>> storeProductPrices,
            int requiredProductCount) {

        File file      = new File(LOG_FILE_PATH);
        File parentDir = file.getParentFile();
        if (parentDir != null && !parentDir.exists()) {
            parentDir.mkdirs();
        }

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(file))) {
            for (Map.Entry<String, Map<Product, BigDecimal>> entry : storeProductPrices.entrySet()) {
                writer.write(String.format("Store %s has %d/%d products%n",
                    entry.getKey(), entry.getValue().size(), requiredProductCount));
            }
            System.out.println("[INFO] Store results saved to " + file.getAbsolutePath());
            return true;
        } catch (IOException e) {
            System.err.println("[ERROR] Failed to save store results: " + e.getMessage());
            return false;
        }
    }
}