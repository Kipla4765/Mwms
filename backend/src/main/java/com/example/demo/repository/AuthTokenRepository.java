package com.example.demo.repository;

import com.example.demo.model.AuthToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AuthTokenRepository extends JpaRepository<AuthToken, Integer> {
    Optional<AuthToken> findByTokenHash(String tokenHash);
}
