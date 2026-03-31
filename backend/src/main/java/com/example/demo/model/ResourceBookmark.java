package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resource_bookmarks")
public class ResourceBookmark {

    @EmbeddedId
    private ResourceBookmarkId id;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public ResourceBookmark() {}

    public ResourceBookmark(ResourceBookmarkId id) {
        this.id = id;
    }

    public ResourceBookmarkId getId() { return id; }
    public void setId(ResourceBookmarkId id) { this.id = id; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
