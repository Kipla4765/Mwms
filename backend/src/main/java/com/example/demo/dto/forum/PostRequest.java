package com.example.demo.dto.forum;

import jakarta.validation.constraints.NotBlank;

public record PostRequest(
        @NotBlank String body,
        String tag,
        String displayName
) {}
