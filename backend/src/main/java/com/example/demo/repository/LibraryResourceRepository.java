package com.example.demo.repository;

import com.example.demo.model.LibraryResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface LibraryResourceRepository extends JpaRepository<LibraryResource, Integer> {

    @Query("SELECT r FROM LibraryResource r WHERE r.isPublished = true " +
           "AND (:categoryId IS NULL OR r.categoryId = :categoryId)")
    List<LibraryResource> findPublished(@Param("categoryId") Integer categoryId);
}
