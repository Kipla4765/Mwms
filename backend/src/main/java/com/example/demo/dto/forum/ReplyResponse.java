package com.example.demo.dto.forum;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public record ReplyResponse(
        Integer id,
        String displayName,
        String body,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime createdAt
) {}
