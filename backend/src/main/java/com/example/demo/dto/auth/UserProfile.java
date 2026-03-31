package com.example.demo.dto.auth;

public record UserProfile(
        Integer id,
        String name,
        String email,
        String avatarUrl
) {}
