package com.example.demo.controller;

import com.example.demo.model.LibraryCategory;
import com.example.demo.model.LibraryResource;
import com.example.demo.service.LibraryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/library")
public class LibraryController {

    private final LibraryService libraryService;

    public LibraryController(LibraryService libraryService) {
        this.libraryService = libraryService;
    }

    @GetMapping("/resources")
    public ResponseEntity<List<LibraryResource>> getResources(
            @RequestParam(required = false) Integer category) {
        return ResponseEntity.ok(libraryService.getResources(category));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<LibraryCategory>> getCategories() {
        return ResponseEntity.ok(libraryService.getCategories());
    }
}
