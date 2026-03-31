package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ResourceBookmarkId implements Serializable {

    @Column(name = "resource_id")
    private Integer resourceId;

    @Column(name = "user_id")
    private Integer userId;

    public ResourceBookmarkId() {}

    public ResourceBookmarkId(Integer resourceId, Integer userId) {
        this.resourceId = resourceId;
        this.userId = userId;
    }

    public Integer getResourceId() { return resourceId; }
    public void setResourceId(Integer resourceId) { this.resourceId = resourceId; }
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ResourceBookmarkId that)) return false;
        return Objects.equals(resourceId, that.resourceId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() { return Objects.hash(resourceId, userId); }
}
