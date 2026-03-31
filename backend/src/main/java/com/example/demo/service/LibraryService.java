package com.example.demo.service;

import com.example.demo.model.LibraryCategory;
import com.example.demo.model.LibraryResource;
import com.example.demo.repository.LibraryCategoryRepository;
import com.example.demo.repository.LibraryResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LibraryService {

    private final LibraryResourceRepository resourceRepository;
    private final LibraryCategoryRepository categoryRepository;

    public LibraryService(LibraryResourceRepository resourceRepository,
                          LibraryCategoryRepository categoryRepository) {
        this.resourceRepository = resourceRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<LibraryResource> getResources(Integer categoryId) {
        return resourceRepository.findPublished(categoryId);
    }

    public List<LibraryCategory> getCategories() {
        return categoryRepository.findAllByOrderBySortOrderAsc();
    }
}
