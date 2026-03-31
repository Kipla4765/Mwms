package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mood_entries")
public class MoodEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(nullable = false)
    private int value;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "logged_at", nullable = false)
    private LocalDateTime loggedAt;

    @OneToMany(mappedBy = "moodEntry", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<MoodFactor> factors = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (loggedAt == null) loggedAt = LocalDateTime.now();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public int getValue() { return value; }
    public void setValue(int value) { this.value = value; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public LocalDateTime getLoggedAt() { return loggedAt; }
    public void setLoggedAt(LocalDateTime loggedAt) { this.loggedAt = loggedAt; }
    public List<MoodFactor> getFactors() { return factors; }
    public void setFactors(List<MoodFactor> factors) { this.factors = factors; }
}
