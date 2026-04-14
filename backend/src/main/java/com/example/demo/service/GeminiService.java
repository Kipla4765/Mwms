package com.example.demo.service;

import com.example.demo.exception.GatewayException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    private static final String OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

    private static final Map<String, String> PROMPTS = Map.of(
            "summarize",
            "You are a compassionate mental wellness journaling assistant. " +
            "Read the journal entry below and write a warm, concise reflection in 2-3 sentences. " +
            "Speak directly to the writer in second person (\"you\"). " +
            "Do not use bullet points, headers, or markdown. Just plain, caring prose.\n\nJournal entry:\n",

            "reframe",
            "You are a compassionate mental wellness journaling assistant. " +
            "Read the journal entry below and rewrite it as a single short paragraph from a positive, growth-oriented perspective. " +
            "Speak directly to the writer in second person (\"you\"). " +
            "Do not offer multiple options, do not use bullet points, headers, or markdown. Just one warm, encouraging paragraph.\n\nJournal entry:\n",

            "suggest",
            "You are a compassionate mental wellness journaling assistant. " +
            "Based on the journal entry below, suggest exactly 3 practical, specific coping strategies. " +
            "Format as a plain numbered list (1. 2. 3.) with no markdown, no bold, no headers. " +
            "Each suggestion should be one sentence, actionable, and directly relevant to what the writer shared.\n\nJournal entry:\n"
    );

    private final RestClient restClient;
    private final String apiKey;
    private final String model;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GeminiService(
            @Value("${app.openrouter.api-key}") String apiKey,
            @Value("${app.openrouter.model}") String model) {
        this.apiKey = apiKey;
        this.model  = model;
        this.restClient = RestClient.builder().build();
    }

    public String reflect(String text, String action) {
        String instruction = PROMPTS.getOrDefault(action, PROMPTS.get("summarize"));

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "user", "content", instruction + text)
                )
        );

        int maxRetries = 3;
        long delayMs   = 5000;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                log.info("OpenRouter request: model={}, action={}, attempt={}", model, action, attempt);

                String raw = restClient.post()
                        .uri(OPENROUTER_URL)
                        .header("Authorization", "Bearer " + apiKey)
                        .header("HTTP-Referer", "http://localhost:5500")
                        .header("X-Title", "MindSpace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(requestBody)
                        .retrieve()
                        .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), (req, res) -> {
                            String body = new String(res.getBody().readAllBytes());
                            log.error("OpenRouter error {}: {}", res.getStatusCode(), body);
                            if (res.getStatusCode().value() == 429) {
                                throw new GatewayException("AI rate limited. Please try again in a moment.");
                            }
                            throw new GatewayException("AI service error " + res.getStatusCode().value() + ": " + body);
                        })
                        .body(String.class);

                JsonNode response = objectMapper.readTree(raw);
                String content = response
                        .path("choices").get(0)
                        .path("message")
                        .path("content")
                        .asText();

                if (content == null || content.isBlank()) {
                    log.error("Empty content from OpenRouter. Full response: {}", response);
                    throw new GatewayException("AI returned an empty response.");
                }

                log.info("OpenRouter success, content length={}", content.length());
                return content;

            } catch (GatewayException e) {
                // re-throw our own exceptions directly — check if retryable
                if (e.getMessage().contains("rate limited") && attempt < maxRetries) {
                    try { Thread.sleep(delayMs * attempt); } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                    continue;
                }
                throw e;
            } catch (RestClientException e) {
                log.error("RestClient error on attempt {}: {}", attempt, e.getMessage());
                if (attempt == maxRetries) {
                    throw new GatewayException("AI service is currently unavailable: " + e.getMessage());
                }
                try { Thread.sleep(delayMs); } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            } catch (Exception e) {
                log.error("Unexpected error calling OpenRouter: {}", e.getMessage(), e);
                throw new GatewayException("Failed to process AI response: " + e.getMessage());
            }
        }
        throw new GatewayException("AI service unavailable after retries.");
    }
}
