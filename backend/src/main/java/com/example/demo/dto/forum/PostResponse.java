package com.example.demo.dto.forum;

import java.time.LocalDateTime;

public record PostResponse(
        Integer id,
        String displayName,
        String tag,
        String body,
        boolean isFeatured,
        LocalDateTime createdAt,
        long supportCount,
        long replyCount
) {}
