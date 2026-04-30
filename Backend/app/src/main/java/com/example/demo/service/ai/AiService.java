package com.example.demo.service.ai;

import java.util.NoSuchElementException;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.stereotype.Service;

import com.example.demo.service.ai.tools.ProductTools;
import com.example.demo.service.ai.tools.ShoppingListTools;
import com.example.demo.service.ai.tools.StoreTools;

import reactor.core.publisher.Flux;

@Service
public class AiService {
    private final ChatClient chatClient;
    private final MessageWindowChatMemory chatMemory = MessageWindowChatMemory.builder().maxMessages(20).build();
    private final ProductTools productTools;
    private final StoreTools storeTools;
    private final ShoppingListTools shoppingListTools;

    public AiService(ChatClient.Builder chatClientBuilder, ProductTools productTools, StoreTools storeTools, ShoppingListTools shoppingListTools){
        this.chatClient = chatClientBuilder
        .defaultSystem("""
            You are a helpful shopping assistant for a grocery price comparison app in Bulgaria.
            You help users with:
            - Finding products, prices, and promotions across local grocery stores
            - Building shopping lists optimized by budget or store
            - Generating ingredient lists from meals the user wants to cook
            - Comparing prices and recommending the best deals

            Tool usage rules:
            - Always call browseProducts() to answer questions about prices or availability — never guess prices.
            - When a user mentions a city other than Sofia, always call getCities() first to resolve the ekatte code.
            - When filtering by category, always call getCategories() first — never guess a category name.
            - When filtering by store, call getStores() first if you're unsure of the exact store name.
            - Prefer fewer, well-parameterized tool calls over multiple sequential ones.
            - When building a shopping list, check each category's unit_type from getCategories():
            use weightGrams for 'weight' categories and quantity for 'quantity' categories.

            Shopping list retry strategy:
            - If cheapestStores() returns empty or very few results, automatically retry with relaxed filters:
            1. First retry: remove name filters from products that are hard to find (meat, fish, deli).
                Hard-to-find categories include: пиле, месо, риба, кайма, колбаси, наденица, кренвирши, бекон.
                For these, set name to empty string and keep only category and weightGrams.
            2. Second retry: if still failing, remove hard-to-find products entirely from the list
                and inform the user which products were excluded and why.
            3. Always tell the user what you changed between retries and suggest they search
                for excluded products separately using browseProducts().
            - Never silently drop products — always explain what was excluded and offer alternatives.
            - If a retry succeeds, show the result and add a note like:
            "Note: I couldn't find [product] in stores so I excluded it from the comparison."

            Response style:
            - Always respond in the user's language.
            - All prices are in Euro (€). Always display prices with '€' suffix.
            - Be concise, practical, and budget-conscious.
            - When presenting products, show name, price, discount %, and store.
            - When presenting shopping list results, summarize total cost per store and highlight the cheapest option.
            """)
        .defaultAdvisors(new SimpleLoggerAdvisor(), MessageChatMemoryAdvisor.builder(chatMemory).build()).build();

        this.productTools = productTools;
        this.storeTools = storeTools;
        this.shoppingListTools = shoppingListTools;
    }

    public String generation(String userInput, String conversationId) {
        try{
            return this.chatClient.prompt()
                .user(userInput)
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId))
                .tools(productTools, storeTools, shoppingListTools)
                .call()
                .content();
        } catch(NoSuchElementException e){
            return "Sorry, something went wrong processing your request. Please try again.";
        }
    }

    public Flux<String> streamGenerate(String userInput){
        return this.chatClient.prompt()
            .user(userInput)
            .tools(productTools, storeTools, shoppingListTools)
            .stream()
            .content();
    }
}
