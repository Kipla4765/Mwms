package com.example.demo.service;

import com.example.demo.exception.GatewayException;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    private static final Map<String, String> PROMPTS = Map.of(
            "summarize", "Summarize the following journal entry in 2-3 sentences:\n\n",
            "reframe",   "Reframe the following journal entry with a positive, growth-oriented perspective:\n\n",
            "suggest",   "Based on the following journal entry, suggest 3 practical coping strategies:\n\n"
    );

    private final RestClient restClient;
    private final String apiKey;

    public GeminiService(@Value("${app.gemini.api-key}") String apiKey) {
        this.apiKey = apiKey;
        this.restClient = RestClient.builder()
                .baseUrl(GEMINI_URL)
                .build();
    }

    public String reflect(String text, String action) {
        String instruction = PROMPTS.getOrDefault(action, PROMPTS.get("summarize"));
        String prompt = instruction + text;

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                )
        );

        try {
            JsonNode response = restClient.post()
                    .uri("?key=" + apiKey)
                    .body(requestBody)
                    .retrieve()
                    .body(JsonNode.class);

            return response
                    .path("candidates").get(0)
                    .path("content")
                    .path("parts").get(0)
                    .path("text")
                    .asText();
        } catch (RestClientException e) {
            throw new GatewayException("AI service is currently unavailable: " + e.getMessage());
        } catch (Exception e) {
            throw new GatewayException("Failed to process AI response");
        }
    }
}
