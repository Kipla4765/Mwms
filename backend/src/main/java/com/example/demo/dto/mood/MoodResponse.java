package com.example.demo.dto.mood;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.List;

public record MoodResponse(
        Integer id,
        int value,
        String note,
        List<String> factors,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime loggedAt
) {}
