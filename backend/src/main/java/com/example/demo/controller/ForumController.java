package com.example.demo.controller;

import com.example.demo.dto.forum.PostRequest;
import com.example.demo.dto.forum.PostResponse;
import com.example.demo.dto.forum.ReplyRequest;
import com.example.demo.dto.forum.ReplyResponse;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ForumService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forum")
public class ForumController {

    private final ForumService forumService;
    private final UserRepository userRepository;

    public ForumController(ForumService forumService, UserRepository userRepository) {
        this.forumService = forumService;
        this.userRepository = userRepository;
    }

    @GetMapping("/posts")
    public ResponseEntity<List<PostResponse>> getPosts(@RequestParam(required = false) String tag) {
        return ResponseEntity.ok(forumService.getPosts(tag));
    }

    @PostMapping("/posts")
    public ResponseEntity<PostResponse> createPost(@Valid @RequestBody PostRequest req,
                                                    @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(forumService.createPost(req, resolveUserId(principal)));
    }

    @PostMapping("/posts/{id}/support")
    public ResponseEntity<Map<String, Long>> supportPost(@PathVariable Integer id,
                                                          @AuthenticationPrincipal UserDetails principal) {
        long count = forumService.toggleSupport(id, resolveUserId(principal));
        return ResponseEntity.ok(Map.of("supportCount", count));
    }

    @GetMapping("/posts/{id}/replies")
    public ResponseEntity<List<ReplyResponse>> getReplies(@PathVariable Integer id) {
        return ResponseEntity.ok(forumService.getReplies(id));
    }

    @PostMapping("/posts/{id}/replies")
    public ResponseEntity<ReplyResponse> addReply(@PathVariable Integer id,
                                                   @Valid @RequestBody ReplyRequest req,
                                                   @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(forumService.addReply(id, req, resolveUserId(principal)));
    }

    private Integer resolveUserId(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}
