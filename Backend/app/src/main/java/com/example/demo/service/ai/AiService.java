package com.example.demo.service.ai;

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

        Response style:
        - Always respond in the user's language.
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
        return this.chatClient.prompt()
            .user(userInput)
            .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId))
            .tools(productTools, storeTools, shoppingListTools)
            .call()
            .content();
    }

    public Flux<String> streamGenerate(String userInput){
        return this.chatClient.prompt()
            .user(userInput)
            .tools(productTools, storeTools, shoppingListTools)
            .stream()
            .content();
    }
}
