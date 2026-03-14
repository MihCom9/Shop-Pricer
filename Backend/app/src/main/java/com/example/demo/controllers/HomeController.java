package com.example.demo.controllers;

import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.SearchProduct;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Hello, world!";
    }
    @GetMapping("/test")
    public String test() {
        return "It works!";
    }
    @GetMapping("/shop")
    public String search(@RequestParam String name,@RequestParam String productSort,@RequestParam int quantity) {
        return "It works!";
    }
    @PostMapping("/shop")
    public String searchDb(@RequestBody List<SearchProduct> products){
        System.out.println(products);
        return "Done";
    }

}
