package com.sliit.sims.common.auth.dto;

public record AuthResponse(
        String token,
        String username,
        String email,
        String role,
        Long userId
) {}
