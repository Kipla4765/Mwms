package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "mood_factors")
public class MoodFactor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mood_entry_id", nullable = false)
    private MoodEntry moodEntry;

    @Column(nullable = false, length = 50)
    private String factor;

    public Integer getId() { return id; }
    public MoodEntry getMoodEntry() { return moodEntry; }
    public void setMoodEntry(MoodEntry moodEntry) { this.moodEntry = moodEntry; }
    public String getFactor() { return factor; }
    public void setFactor(String factor) { this.factor = factor; }
}
