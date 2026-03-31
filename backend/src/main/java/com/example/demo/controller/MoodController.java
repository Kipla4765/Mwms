package com.example.demo.controller;

import com.example.demo.dto.mood.MoodRequest;
import com.example.demo.dto.mood.MoodResponse;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.MoodService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mood")
public class MoodController {

    private final MoodService moodService;
    private final UserRepository userRepository;

    public MoodController(MoodService moodService, UserRepository userRepository) {
        this.moodService = moodService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<MoodResponse>> getMoods(@AuthenticationPrincipal UserDetails principal) {
        Integer userId = resolveUserId(principal);
        return ResponseEntity.ok(moodService.getMoods(userId));
    }

    @PostMapping
    public ResponseEntity<MoodResponse> logMood(@Valid @RequestBody MoodRequest req,
                                                 @AuthenticationPrincipal UserDetails principal) {
        Integer userId = resolveUserId(principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(moodService.logMood(req, userId));
    }

    private Integer resolveUserId(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}
