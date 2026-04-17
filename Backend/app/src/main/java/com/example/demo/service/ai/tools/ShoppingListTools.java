package com.example.demo.service.ai.tools;

import java.util.List;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Service;

import com.example.demo.model.SearchProduct;
import com.example.demo.model.Shopping.StoreResult;
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
            """)
    public List<StoreResult> cheapestStores(
        @ToolParam(description = "City ekatte code for the user's location. Call getCities() from StoreTools to get the correct ekatte for a city name. Defaults to 68134 (Sofia).", required = false) String city,
        @ToolParam(description = """
                List of products the user wants to buy. For each product provide:
                - name: works as a search filter — include everything here: product name, brand, weight, percentage.
                Examples: 'мляко 3.6%', 'Верея 400гр', 'пиле', 'Активиа кисело мляко'
                - category:  call getCategories() from ProductTools to get a valid category name if needed
                - brand: leave emty
                - quantity: how many units the user wants, defaults to 1
                - weightGrams: leave empty
                """) List<SearchProduct> shoppingList
    ){
        return shoppingService.findCheapestStore(
            city != null ? city : "68134",
            shoppingList
        );
    }
}
