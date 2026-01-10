package com.example.demo;

// import io.restassured.RestAssured;
// import io.restassured.http.ContentType;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;


@SpringBootTest
@EnableAutoConfiguration(exclude = {DataSourceAutoConfiguration.class})
class ShopPricerApplicationTests {
	@Test
	void contextLoads() {
	}

}
