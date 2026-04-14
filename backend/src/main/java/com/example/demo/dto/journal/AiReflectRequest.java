package com.example.demo.dto.journal;

import jakarta.validation.constraints.NotBlank;

public record AiReflectRequest(
        @NotBlank String text,
        @NotBlank String action,
        Integer journalId
) {}
