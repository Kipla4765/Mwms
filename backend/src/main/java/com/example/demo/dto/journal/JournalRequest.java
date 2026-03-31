package com.example.demo.dto.journal;

import jakarta.validation.constraints.NotBlank;

public record JournalRequest(
        String title,
        @NotBlank String body
) {}
