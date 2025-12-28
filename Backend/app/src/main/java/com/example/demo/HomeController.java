package com.example.demo;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

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

}
