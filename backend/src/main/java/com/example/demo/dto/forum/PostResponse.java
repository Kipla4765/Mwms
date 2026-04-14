package com.example.demo.dto.forum;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public record PostResponse(
        Integer id,
        String displayName,
        String tag,
        String body,
        boolean isFeatured,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime createdAt,
        long supportCount,
        long replyCount
) {}
