package com.example.demo.dto.mood;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;

public record MoodRequest(
        @Min(1) @Max(5) int value,
        String note,
        List<String> factors
) {}
