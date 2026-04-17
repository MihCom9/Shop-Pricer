package com.example.demo.controllers.Ai;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.MediaType;
import com.example.demo.service.ai.AiService;

import reactor.core.publisher.Flux;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class AiController {
    private final AiService aiService;

    public AiController(AiService aiService){
        this.aiService = aiService;
    }

    @GetMapping("/ai/test")
    public String aiGenerate(@RequestParam String question, @RequestParam(defaultValue = "default") String conversationId){
        return aiService.generation(question, conversationId);
    }

    @GetMapping(value ="/ai/testStream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> aiStreamGenerate(@RequestParam String question){
        return aiService.streamGenerate(question);
    }
}
