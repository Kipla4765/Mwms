package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "forum_post_supports")
public class ForumPostSupport {

    @EmbeddedId
    private ForumPostSupportId id;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public ForumPostSupport() {}

    public ForumPostSupport(ForumPostSupportId id) {
        this.id = id;
    }

    public ForumPostSupportId getId() { return id; }
    public void setId(ForumPostSupportId id) { this.id = id; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
