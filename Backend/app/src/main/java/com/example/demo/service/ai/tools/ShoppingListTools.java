package com.example.demo.service.ai.tools;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Service;

import com.example.demo.model.request.Shopping.SearchProduct;
import com.example.demo.model.response.Shopping.StoreResult;
import com.example.demo.service.shopping.ShoppingService;

@Service
public class ShoppingListTools {
    private final ShoppingService shoppingService;

    public ShoppingListTools(ShoppingService shoppingService){
        this.shoppingService = shoppingService;
    }

    @Tool(description = """
        Find the cheapest stores to buy a shopping list from.
        Use this when the user provides a list of products they want to buy and wants to know which store or combination of stores is cheapest.
        
        BEFORE calling this tool you MUST:
        1. Call getCities() if the user mentions a city by name to get the correct ekatte code.
        2. Call getCategories() to get valid category names — never guess a category.
        
        Construct the shopping list from what the user mentions — do not ask for confirmation, just build it.

        IMPORTANT - to maximize the chance of finding products in stores:
        - Use as few filters in 'name' as possible — only include details that are truly necessary to distinguish the product.
        - Prefer weight/size filters (e.g. '500гр', '1кг') over brand filters when the user has not specified a brand.
        - If the user only said a generic product (e.g. 'мляко 3.6%'), use only '3.6%' in name — do not add brand or extra words.
        - If a specific detail like brand or size was NOT mentioned by the user, leave name empty rather than guessing.
        - The search engine is fuzzy but strict on units — an overly specific name is more likely to return no results than a simple one.
            """)
    public List<StoreResult> cheapestStores(
        @ToolParam(description = "City ekatte code for the user's location. Call getCities() from StoreTools to get the correct ekatte for a city name. Defaults to 68134 (Sofia).", required = false) String city,
        @ToolParam(description = """
            List of products the user wants to buy. For each product provide:
            - name: search filter — do NOT repeat the category name here. Only include specifics like:
            brand, fat percentage, weight/size, variety, or other distinguishing details.
            If the user gave no specifics beyond the category, leave name empty.
            Examples: '3.6%', 'Верея', 'био', 'Активиа', '400гр'
            Bad examples (do not do this): 'мляко', 'пиле', 'кисело мляко' — these just repeat the category.
            - category: must be a valid category name from getCategories()
            - brand: leave empty
            - quantity: number of units — use this when category unit_type is 'quantity', defaults to 1
            - weightGrams: grams requested — use this when category unit_type is 'weight', e.g. 500 for 500гр, 1000 for 1кг
            """) List<SearchProduct> shoppingList
    ){
        try {
        return shoppingService.findCheapestStore(
            city != null ? city : "68134",
            shoppingList
        );
        } catch (NoSuchElementException e) {
            return List.of();
        }
    }
}
