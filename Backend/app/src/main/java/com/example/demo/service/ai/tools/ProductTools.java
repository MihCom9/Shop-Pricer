package com.example.demo.service.ai.tools;

import java.util.List;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Service;

import com.example.demo.model.response.Browse.PromotionItem;
import com.example.demo.repository.ProductRepository;
import com.example.demo.service.shopping.PromotionService;

@Service
public class ProductTools {
    private final PromotionService promotionService;
    private final ProductRepository productRepository;

    public ProductTools(PromotionService promotionService, ProductRepository productRepository){
        this.promotionService = promotionService;
        this.productRepository = productRepository;
    }

    @Tool(description = """
        Browse and filter grocery products from local shops.
        Use this tool to find products, compare prices, explore promotions and discounts.
        Call this tool when the user asks about products, prices, deals, or wants a shopping list.
        All parameters are optional - only provide what the user explicitly mentions.
        """)
    public List<PromotionItem> browseProducts(
            @ToolParam(description = "City ekatte code for the user's location. Call getCities() from StoreTools to get the correct ekatte for a city name. Defaults to 68134 (Sofia).", required = false) String city,
            @ToolParam(description = "Filter by store name, e.g. 'Билла', 'Кауфланд', 'Лидл'. Call getStores() from StoreTools first if unsure of the exact store name.", required = false) String store,
            @ToolParam(description = "Filter by specific store branch or address. Call getStoreLocations() from StoreTools first if unsure of the exact location.", required = false) String storeLocation,
            @ToolParam(description = "Filter by product category. Call getCategories() first to get valid category names.", required = false) String category,
            @ToolParam(description = "Search for a specific product by name or keyword, e.g. 'Верея', 'Био мляко'", required = false) String search,
            @ToolParam(description = "Minimum discount percentage to filter by. Use when user wants deals above a certain % off. Defaults to 0", required = false) Integer minDiscount,
            @ToolParam(description = "Maximum number of results to return. Increase if user wants a longer list. Defaults to 48", required = false) Integer limit,
            @ToolParam(description = "Pagination offset. Defaults to 0", required = false) Integer offset,
            @ToolParam(description = "Sort order. Allowed values: 'discount' (biggest discount first), 'price_asc' (cheapest first), 'price_desc' (most expensive first), 'newest' (latest additions). Defaults to 'discount'", required = false) String sorting,
            @ToolParam(description = "Which products to show. Allowed values: 'all' (all products), 'promotions' (only discounted products). Defaults to 'all'", required = false) String show
    ) {
        return promotionService.getPromotions(
                city != null ? city : "68134",
                store,
                storeLocation,
                category,
                search != null ? search : "",
                minDiscount != null ? minDiscount : 0,
                limit != null ? limit : 48,
                offset != null ? offset : 0,
                sorting != null ? sorting : "discount",
                show != null ? show : "all"
        );
    }

    // @GetMapping("/promotions/count")
    // public long getPromotionsCount(
    //     @RequestParam(required = false) String city,
    //     @RequestParam(required = false) String store,
    //     @RequestParam(required = false) String storeLocation,
    //     @RequestParam(required = false) String category,
    //     @RequestParam(required = false, defaultValue = "") String search,
    //     @RequestParam(defaultValue = "0") int minDiscount
    // ){
    //     try {
    //         return promotionService.getPromotionsCount(city, store,storeLocation , category, search, minDiscount);
    //     } catch (RuntimeException e) {
    //         throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
    //     }
    // }
    // @Tool(description = "")
    // public long getPromotionsCount

    @Tool(description = """
    Get all available product categories and their unit type.
    unit_type 'weight' means the product is sold by weight — use weightGrams to specify how many grams the user wants.
    unit_type 'quantity' means the product is sold by piece — use quantity to specify how many units.
    Always call this before filtering by category or building a shopping list.
    """)
    public List<String> getCategories(){
        return productRepository.findAllCategoryIds();
    }
}
