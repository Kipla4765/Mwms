package com.example.demo.repository;

import com.example.demo.model.LibraryCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LibraryCategoryRepository extends JpaRepository<LibraryCategory, Integer> {
    List<LibraryCategory> findAllByOrderBySortOrderAsc();
}
