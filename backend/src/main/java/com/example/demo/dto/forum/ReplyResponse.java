package com.example.demo.dto.forum;

import java.time.LocalDateTime;

public record ReplyResponse(
        Integer id,
        String displayName,
        String body,
        LocalDateTime createdAt
) {}
