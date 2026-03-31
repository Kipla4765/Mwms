package com.example.demo.repository;

import com.example.demo.model.MoodEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MoodEntryRepository extends JpaRepository<MoodEntry, Integer> {
    List<MoodEntry> findByUserIdOrderByLoggedAtDesc(Integer userId);
}
