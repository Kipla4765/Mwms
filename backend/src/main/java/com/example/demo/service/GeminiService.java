package com.example.demo.service;

import com.example.demo.exception.GatewayException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestClientException;

import java.util.Arrays;
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
    private final List<String> models;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GeminiService(
            @Value("${app.openrouter.api-key}") String apiKey,
            @Value("${app.openrouter.models}") String modelsConfig) {
        this.apiKey  = apiKey;
        this.models  = Arrays.asList(modelsConfig.split(","));
        this.restClient = RestClient.builder().build();
        log.info("AI service initialized with {} models: {}", models.size(), models);
    }

    public String reflect(String text, String action) {
        String instruction = PROMPTS.getOrDefault(action, PROMPTS.get("summarize"));

        Map<String, Object> requestBody = Map.of(
                "messages", List.of(
                        Map.of("role", "user", "content", instruction + text)
                )
        );

        // Try each model in order; move to next on 429
        for (int m = 0; m < models.size(); m++) {
            String model = models.get(m).trim();
            log.info("Trying model [{}/{}]: {}", m + 1, models.size(), model);

            Map<String, Object> body = new java.util.HashMap<>(requestBody);
            body.put("model", model);

            try {
                String raw = restClient.post()
                        .uri(OPENROUTER_URL)
                        .header("Authorization", "Bearer " + apiKey)
                        .header("HTTP-Referer", "http://localhost:5500")
                        .header("X-Title", "MindSpace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(body)
                        .retrieve()
                        .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                                (req, res) -> {
                                    String errBody = new String(res.getBody().readAllBytes());
                                    log.error("Model {} error {}: {}", model, res.getStatusCode(), errBody);
                                    if (res.getStatusCode().value() == 429) {
                                        throw new RateLimitException("Rate limited on " + model);
                                    }
                                    throw new GatewayException("AI error " + res.getStatusCode().value());
                                })
                        .body(String.class);

                JsonNode response = objectMapper.readTree(raw);
                String content = response.path("choices").get(0)
                        .path("message").path("content").asText();

                if (content == null || content.isBlank()) {
                    log.warn("Empty response from model {}, trying next", model);
                    continue;
                }

                log.info("Success with model: {}", model);
                return content;

            } catch (RateLimitException e) {
                log.warn("Model {} rate limited, trying next", model);
                // continue to next model
            } catch (GatewayException e) {
                throw e; // non-429 error, don't retry
            } catch (RestClientException e) {
                log.error("Network error with model {}: {}", model, e.getMessage());
                if (m == models.size() - 1) {
                    throw new GatewayException("AI service unavailable: " + e.getMessage());
                }
            } catch (Exception e) {
                log.error("Unexpected error with model {}: {}", model, e.getMessage());
                if (m == models.size() - 1) {
                    throw new GatewayException("Failed to process AI response");
                }
            }
        }

        throw new GatewayException("All AI models are currently rate limited. Please try again in a moment.");
    }

    // Internal exception to signal 429 without breaking the loop
    private static class RateLimitException extends RuntimeException {
        RateLimitException(String msg) { super(msg); }
    }
}
