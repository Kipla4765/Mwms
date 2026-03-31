package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "library_categories")
public class LibraryCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, length = 80)
    private String icon;

    @Column(name = "resource_count", nullable = false)
    private int resourceCount = 0;

    @Column(name = "sort_order", nullable = false, columnDefinition = "TINYINT")
    private int sortOrder = 0;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public int getResourceCount() { return resourceCount; }
    public void setResourceCount(int resourceCount) { this.resourceCount = resourceCount; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
}
