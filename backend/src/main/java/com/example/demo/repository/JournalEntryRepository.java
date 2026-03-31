package com.example.demo.repository;

import com.example.demo.model.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JournalEntryRepository extends JpaRepository<JournalEntry, Integer> {
    List<JournalEntry> findByUserIdOrderByCreatedAtDesc(Integer userId);
}
