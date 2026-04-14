package com.example.demo.service;

import com.example.demo.dto.journal.JournalRequest;
import com.example.demo.dto.journal.JournalResponse;
import com.example.demo.exception.EntityNotFoundException;
import com.example.demo.model.JournalEntry;
import com.example.demo.repository.JournalEntryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class JournalService {

    private final JournalEntryRepository journalEntryRepository;

    public JournalService(JournalEntryRepository journalEntryRepository) {
        this.journalEntryRepository = journalEntryRepository;
    }

    public List<JournalResponse> getJournals(Integer userId) {
        return journalEntryRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public JournalResponse getJournal(Integer id, Integer userId) {
        JournalEntry entry = findOwned(id, userId);
        return toResponse(entry);
    }

    public JournalResponse createJournal(JournalRequest req, Integer userId) {
        JournalEntry entry = new JournalEntry();
        entry.setUserId(userId);
        entry.setTitle(req.title());
        entry.setBody(req.body());
        return toResponse(journalEntryRepository.save(entry));
    }

    public JournalResponse updateJournal(Integer id, JournalRequest req, Integer userId) {
        JournalEntry entry = findOwned(id, userId);
        entry.setTitle(req.title());
        entry.setBody(req.body());
        return toResponse(journalEntryRepository.save(entry));
    }

    public void deleteJournal(Integer id, Integer userId) {
        JournalEntry entry = findOwned(id, userId);
        journalEntryRepository.delete(entry);
    }

    public void saveAiReflection(Integer id, Integer userId, String action, String response) {
        JournalEntry entry = findOwned(id, userId);
        entry.setAiAction(action);
        entry.setAiResponse(response);
        entry.setAiSummary(response); // mirror into summary for convenience
        journalEntryRepository.save(entry);
    }

    private JournalEntry findOwned(Integer id, Integer userId) {
        return journalEntryRepository.findById(id)
                .filter(e -> e.getUserId().equals(userId))
                .orElseThrow(() -> new EntityNotFoundException("Journal entry not found"));
    }

    private JournalResponse toResponse(JournalEntry e) {
        return new JournalResponse(
                e.getId(), e.getTitle(), e.getBody(),
                e.getAiSummary(), e.getAiAction(), e.getAiResponse(),
                e.getCreatedAt(), e.getUpdatedAt()
        );
    }
}
