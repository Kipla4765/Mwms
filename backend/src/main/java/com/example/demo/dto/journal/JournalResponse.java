package com.example.demo.dto.journal;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public record JournalResponse(
        Integer id,
        String title,
        String body,
        String aiSummary,
        String aiAction,
        String aiResponse,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime createdAt,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime updatedAt
) {}
