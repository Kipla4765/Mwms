package com.example.demo.dto.forum;

import jakarta.validation.constraints.NotBlank;

public record ReplyRequest(
        @NotBlank String text,
        String displayName
) {}
