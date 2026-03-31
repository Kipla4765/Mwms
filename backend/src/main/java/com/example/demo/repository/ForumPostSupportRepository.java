package com.example.demo.repository;

import com.example.demo.model.ForumPostSupport;
import com.example.demo.model.ForumPostSupportId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ForumPostSupportRepository extends JpaRepository<ForumPostSupport, ForumPostSupportId> {
    long countByIdPostId(Integer postId);
    boolean existsByIdPostIdAndIdUserId(Integer postId, Integer userId);
}
