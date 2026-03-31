package com.example.demo.repository;

import com.example.demo.model.ForumPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ForumPostRepository extends JpaRepository<ForumPost, Integer> {

    @Query("SELECT p FROM ForumPost p WHERE p.isDeleted = false " +
           "AND (:tag IS NULL OR p.tag = :tag) ORDER BY p.createdAt DESC")
    List<ForumPost> findActivePosts(@Param("tag") String tag);
}
