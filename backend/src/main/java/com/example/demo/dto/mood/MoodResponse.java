package com.example.demo.dto.mood;

import java.time.LocalDateTime;
import java.util.List;

public record MoodResponse(
        Integer id,
        int value,
        String note,
        List<String> factors,
        LocalDateTime loggedAt
) {}
