package com.sliit.sims.common.auth.service;

import com.sliit.sims.common.auth.dto.AuthResponse;
import com.sliit.sims.common.auth.dto.LoginRequest;
import com.sliit.sims.common.auth.dto.RegisterRequest;
import com.sliit.sims.common.auth.jwt.JwtTokenProvider;
import com.sliit.sims.common.auth.model.Role;
import com.sliit.sims.common.auth.model.User;
import com.sliit.sims.common.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authManager;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.username()))
            throw new IllegalArgumentException("Username already taken");
        if (userRepository.existsByEmail(req.email()))
            throw new IllegalArgumentException("Email already registered");

        var role = req.role() != null ? Role.valueOf(req.role().toUpperCase()) : Role.STUDENT;

        var user = User.builder()
                .username(req.username().trim().toLowerCase())
                .email(req.email().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(req.password()))
                .role(role)
                .build();

        userRepository.save(user);
        var token = tokenProvider.generateToken(user);
        return new AuthResponse(token, user.getUsername(), user.getEmail(), role.name(), user.getId());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password()));

        var user = userRepository.findByUsername(req.username())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        var token = tokenProvider.generateToken(user);
        return new AuthResponse(token, user.getUsername(), user.getEmail(),
                user.getRole().name(), user.getId());
    }
}
