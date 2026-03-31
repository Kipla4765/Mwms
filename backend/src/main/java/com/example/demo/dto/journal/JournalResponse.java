package com.example.demo.dto.journal;

import java.time.LocalDateTime;

public record JournalResponse(
        Integer id,
        String title,
        String body,
        String aiSummary,
        String aiAction,
        String aiResponse,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
