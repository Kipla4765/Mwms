package com.example.demo.repository;

import com.example.demo.model.ForumReply;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ForumReplyRepository extends JpaRepository<ForumReply, Integer> {
    List<ForumReply> findByPostIdAndIsDeletedFalseOrderByCreatedAtAsc(Integer postId);
    long countByPostIdAndIsDeletedFalse(Integer postId);
}
