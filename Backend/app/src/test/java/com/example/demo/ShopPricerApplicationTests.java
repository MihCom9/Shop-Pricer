package com.example.demo;

// import io.restassured.RestAssured;
// import io.restassured.http.ContentType;


import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.data.Product;
import com.example.demo.data.repository.ProductRepository;
import com.example.demo.model.SearchProduct;
import com.example.demo.model.StoreResult;
import com.example.demo.service.ShoppingService;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(MockitoExtension.class)
class ShoppingServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ShoppingService shoppingService;

    @Test
    void testCheapestStore() {
        // Arrange: mock repository to return products
        when(productRepository.findMatchingProducts("72624", "СИРЕНЕ"))
		.thenReturn(List.of(
			new Product("72624","StoreA","СИРЕНЕ","000006","9",
						"21.99", null),
			new Product("72624","StoreB","СИРЕНЕ","000006","9",
						"20.50", "19.99")
		));
        SearchProduct searchProduct = new SearchProduct("СИРЕНЕ", null, 2);

        // Act
        StoreResult result = shoppingService.findCheapestStore(
            "72624",
            List.of(searchProduct)
        );

        // Assert
        assertEquals("StoreB", result.getStore());
        assertEquals(new BigDecimal("39.98"), result.getTotalPrice()); // 2 * 19.99
    }
}

