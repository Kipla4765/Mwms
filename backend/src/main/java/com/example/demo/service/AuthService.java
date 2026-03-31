package com.example.demo.service;

import com.example.demo.dto.auth.AuthResponse;
import com.example.demo.dto.auth.LoginRequest;
import com.example.demo.dto.auth.RegisterRequest;
import com.example.demo.dto.auth.UserProfile;
import com.example.demo.exception.ConflictException;
import com.example.demo.exception.UnauthorizedException;
import com.example.demo.model.AuthToken;
import com.example.demo.model.User;
import com.example.demo.repository.AuthTokenRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtAuthFilter;
import com.example.demo.security.JwtService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final AuthTokenRepository authTokenRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       AuthTokenRepository authTokenRepository,
                       JwtService jwtService,
                       BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.authTokenRepository = authTokenRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.findByEmail(req.email()).isPresent()) {
            throw new ConflictException("Email already registered: " + req.email());
        }
        User user = new User();
        user.setName(req.name());
        user.setEmail(req.email());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user = userRepository.save(user);

        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, toProfile(user));
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, toProfile(user));
    }

    public void logout(String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) return;
        String rawToken = bearerToken.substring(7);
        String hash = JwtAuthFilter.sha256(rawToken);

        AuthToken authToken = new AuthToken();
        authToken.setUserId(jwtService.extractUserId(rawToken));
        authToken.setTokenHash(hash);
        authToken.setRevoked(true);
        authToken.setExpiresAt(LocalDateTime.now().plusDays(1));
        authTokenRepository.save(authToken);
    }

    private UserProfile toProfile(User user) {
        return new UserProfile(user.getId(), user.getName(), user.getEmail(), user.getAvatarUrl());
    }
}
