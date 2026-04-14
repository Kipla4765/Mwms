package com.example.demo.controller;

import com.example.demo.dto.journal.AiReflectRequest;
import com.example.demo.dto.journal.JournalRequest;
import com.example.demo.dto.journal.JournalResponse;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.GeminiService;
import com.example.demo.service.JournalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/journal")
public class JournalController {

    private final JournalService journalService;
    private final GeminiService geminiService;
    private final UserRepository userRepository;

    public JournalController(JournalService journalService,
                              GeminiService geminiService,
                              UserRepository userRepository) {
        this.journalService = journalService;
        this.geminiService = geminiService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<JournalResponse>> getJournals(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(journalService.getJournals(resolveUserId(principal)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JournalResponse> getJournal(@PathVariable Integer id,
                                                       @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(journalService.getJournal(id, resolveUserId(principal)));
    }

    @PostMapping
    public ResponseEntity<JournalResponse> createJournal(@Valid @RequestBody JournalRequest req,
                                                          @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(journalService.createJournal(req, resolveUserId(principal)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JournalResponse> updateJournal(@PathVariable Integer id,
                                                          @Valid @RequestBody JournalRequest req,
                                                          @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(journalService.updateJournal(id, req, resolveUserId(principal)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJournal(@PathVariable Integer id,
                                               @AuthenticationPrincipal UserDetails principal) {
        journalService.deleteJournal(id, resolveUserId(principal));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/ai")
    public ResponseEntity<Map<String, String>> aiReflect(@Valid @RequestBody AiReflectRequest req,
                                                          @AuthenticationPrincipal UserDetails principal) {
        String reflection = geminiService.reflect(req.text(), req.action());
        if (req.journalId() != null) {
            journalService.saveAiReflection(req.journalId(), resolveUserId(principal), req.action(), reflection);
        }
        return ResponseEntity.ok(Map.of("reflection", reflection));
    }

    private Integer resolveUserId(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}
