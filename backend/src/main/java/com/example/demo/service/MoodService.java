package com.example.demo.service;

import com.example.demo.dto.mood.MoodRequest;
import com.example.demo.dto.mood.MoodResponse;
import com.example.demo.model.MoodEntry;
import com.example.demo.model.MoodFactor;
import com.example.demo.repository.MoodEntryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MoodService {

    private final MoodEntryRepository moodEntryRepository;

    public MoodService(MoodEntryRepository moodEntryRepository) {
        this.moodEntryRepository = moodEntryRepository;
    }

    public List<MoodResponse> getMoods(Integer userId) {
        return moodEntryRepository.findByUserIdOrderByLoggedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public MoodResponse logMood(MoodRequest req, Integer userId) {
        MoodEntry entry = new MoodEntry();
        entry.setUserId(userId);
        entry.setValue(req.value());
        entry.setNote(req.note());

        if (req.factors() != null) {
            List<MoodFactor> factors = req.factors().stream().map(f -> {
                MoodFactor mf = new MoodFactor();
                mf.setFactor(f);
                mf.setMoodEntry(entry);
                return mf;
            }).collect(Collectors.toList());
            entry.setFactors(factors);
        }

        MoodEntry saved = moodEntryRepository.save(entry);
        return toResponse(saved);
    }

    public MoodResponse updateMood(Integer id, MoodRequest req, Integer userId) {
        MoodEntry entry = moodEntryRepository.findById(id)
                .filter(e -> e.getUserId().equals(userId))
                .orElseThrow(() -> new com.example.demo.exception.EntityNotFoundException("Mood entry not found"));

        entry.setValue(req.value());
        entry.setNote(req.note());
        entry.getFactors().clear();

        if (req.factors() != null) {
            List<MoodFactor> factors = req.factors().stream().map(f -> {
                MoodFactor mf = new MoodFactor();
                mf.setFactor(f);
                mf.setMoodEntry(entry);
                return mf;
            }).collect(Collectors.toList());
            entry.getFactors().addAll(factors);
        }

        return toResponse(moodEntryRepository.save(entry));
    }

    private MoodResponse toResponse(MoodEntry entry) {
        List<String> factors = entry.getFactors().stream()
                .map(MoodFactor::getFactor)
                .collect(Collectors.toList());
        return new MoodResponse(entry.getId(), entry.getValue(), entry.getNote(), factors, entry.getLoggedAt());
    }
}
