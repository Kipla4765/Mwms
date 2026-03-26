-- =============================================================================
-- MindSpace — MySQL Database Schema
-- =============================================================================
-- App: Student mental wellness platform
-- Features: Auth, Mood Tracking, AI Journaling, Peer Forum, Wellness Library
-- =============================================================================

CREATE DATABASE IF NOT EXISTS mindspace
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mindspace;

-- =============================================================================
-- 1. USERS
-- =============================================================================
CREATE TABLE users (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)    NOT NULL,
  email         VARCHAR(255)    NOT NULL,
  password_hash VARCHAR(255)    NOT NULL,               -- bcrypt hash
  avatar_url    VARCHAR(500)        NULL DEFAULT NULL,
  is_active     TINYINT(1)      NOT NULL DEFAULT 1,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- =============================================================================
-- 2. AUTH TOKENS  (JWT refresh / session tracking)
-- =============================================================================
CREATE TABLE auth_tokens (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED  NOT NULL,
  token_hash  VARCHAR(255)  NOT NULL,                   -- hashed refresh token
  expires_at  DATETIME      NOT NULL,
  revoked     TINYINT(1)    NOT NULL DEFAULT 0,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_auth_tokens_user   (user_id),
  KEY idx_auth_tokens_hash   (token_hash),
  CONSTRAINT fk_auth_tokens_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- 3. MOOD ENTRIES
-- =============================================================================
-- value: 1=Awful  2=Meh  3=Good  4=Great  5=Elite
CREATE TABLE mood_entries (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED  NOT NULL,
  value       TINYINT       NOT NULL CHECK (value BETWEEN 1 AND 5),
  note        TEXT              NULL DEFAULT NULL,
  logged_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_mood_user_date (user_id, logged_at),
  CONSTRAINT fk_mood_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Mood factors are multi-select chips (Stress, Exams, Social, Sleep, Work,
-- Health, Exercise, Food) — stored as a child table for flexibility.
CREATE TABLE mood_factors (
  id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  mood_entry_id  INT UNSIGNED  NOT NULL,
  factor         VARCHAR(50)   NOT NULL,

  PRIMARY KEY (id),
  KEY idx_mood_factors_entry (mood_entry_id),
  CONSTRAINT fk_mood_factors_entry
    FOREIGN KEY (mood_entry_id) REFERENCES mood_entries (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- 4. JOURNAL ENTRIES
-- =============================================================================
CREATE TABLE journal_entries (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id         INT UNSIGNED  NOT NULL,
  title           VARCHAR(255)      NULL DEFAULT NULL,
  body            LONGTEXT      NOT NULL,
  -- AI reflection metadata (stored when user triggers AI analysis)
  ai_summary      TEXT              NULL DEFAULT NULL,
  ai_action       VARCHAR(50)       NULL DEFAULT NULL,  -- e.g. 'summarize','reframe','suggest'
  ai_response     TEXT              NULL DEFAULT NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_journal_user_date (user_id, created_at),
  CONSTRAINT fk_journal_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- 5. FORUM POSTS
-- =============================================================================
-- Tags: Anxiety | School | Motivation | Stress | Relationships | General
CREATE TABLE forum_posts (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id      INT UNSIGNED  NOT NULL,
  -- anonymous display name chosen at post time (e.g. "Anonymous Owl")
  display_name VARCHAR(80)   NOT NULL DEFAULT 'Anonymous',
  tag          VARCHAR(50)   NOT NULL DEFAULT 'General',
  body         TEXT          NOT NULL,
  is_featured  TINYINT(1)    NOT NULL DEFAULT 0,
  is_deleted   TINYINT(1)    NOT NULL DEFAULT 0,         -- soft delete
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_forum_posts_tag        (tag),
  KEY idx_forum_posts_user       (user_id),
  KEY idx_forum_posts_created    (created_at),
  CONSTRAINT fk_forum_posts_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- 6. FORUM POST SUPPORTS  (heart / "Support" reactions — one per user per post)
-- =============================================================================
CREATE TABLE forum_post_supports (
  post_id     INT UNSIGNED  NOT NULL,
  user_id     INT UNSIGNED  NOT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (post_id, user_id),
  CONSTRAINT fk_support_post
    FOREIGN KEY (post_id) REFERENCES forum_posts (id) ON DELETE CASCADE,
  CONSTRAINT fk_support_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- 7. FORUM REPLIES
-- =============================================================================
CREATE TABLE forum_replies (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  post_id      INT UNSIGNED  NOT NULL,
  user_id      INT UNSIGNED  NOT NULL,
  display_name VARCHAR(80)   NOT NULL DEFAULT 'Anonymous',
  body         TEXT          NOT NULL,
  is_deleted   TINYINT(1)    NOT NULL DEFAULT 0,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_replies_post (post_id),
  CONSTRAINT fk_replies_post
    FOREIGN KEY (post_id) REFERENCES forum_posts (id) ON DELETE CASCADE,
  CONSTRAINT fk_replies_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- 8. LIBRARY CATEGORIES
-- =============================================================================
CREATE TABLE library_categories (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name         VARCHAR(100)  NOT NULL,
  icon         VARCHAR(80)   NOT NULL,                  -- Material Symbol name
  resource_count INT UNSIGNED NOT NULL DEFAULT 0,       -- denormalised counter
  sort_order   TINYINT       NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  UNIQUE KEY uq_lib_cat_name (name)
) ENGINE=InnoDB;

-- =============================================================================
-- 9. LIBRARY RESOURCES
-- =============================================================================
-- type: Article | Video | Guide | Audio
CREATE TABLE library_resources (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  category_id  INT UNSIGNED  NOT NULL,
  type         ENUM('Article','Video','Guide','Audio') NOT NULL DEFAULT 'Article',
  title        VARCHAR(255)  NOT NULL,
  description  TEXT              NULL,
  author       VARCHAR(150)      NULL DEFAULT NULL,
  meta_label   VARCHAR(100)      NULL DEFAULT NULL,     -- "8 min read", "10 min video", etc.
  icon         VARCHAR(80)       NULL DEFAULT NULL,     -- Material Symbol name
  icon_color   VARCHAR(30)       NULL DEFAULT NULL,     -- 'primary' | 'secondary' | 'tertiary'
  image_url    VARCHAR(500)      NULL DEFAULT NULL,
  is_featured  TINYINT(1)    NOT NULL DEFAULT 0,
  is_published TINYINT(1)    NOT NULL DEFAULT 1,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_lib_res_category  (category_id),
  KEY idx_lib_res_type      (type),
  KEY idx_lib_res_featured  (is_featured),
  CONSTRAINT fk_lib_res_category
    FOREIGN KEY (category_id) REFERENCES library_categories (id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =============================================================================
-- 10. RESOURCE BOOKMARKS  (users saving library items)
-- =============================================================================
CREATE TABLE resource_bookmarks (
  resource_id  INT UNSIGNED  NOT NULL,
  user_id      INT UNSIGNED  NOT NULL,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (resource_id, user_id),
  CONSTRAINT fk_bookmark_resource
    FOREIGN KEY (resource_id) REFERENCES library_resources (id) ON DELETE CASCADE,
  CONSTRAINT fk_bookmark_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Library categories (matches library.js)
INSERT INTO library_categories (name, icon, resource_count, sort_order) VALUES
  ('Stress Management', 'self_improvement', 12, 1),
  ('Study Tips',        'school',           8,  2),
  ('Anxiety Help',      'psychology',       15, 3),
  ('Sleep Improvement', 'bedtime',          10, 4),
  ('Self-Care',         'favorite',         9,  5),
  ('Relationships',     'groups',           7,  6);

-- Library resources (matches library.js allResources)
INSERT INTO library_resources
  (category_id, type, title, description, author, meta_label, icon, icon_color, image_url, is_featured)
VALUES
  (1, 'Article', 'Mastering the Art of Deep Breathing',
   'A comprehensive guide on physiological sighs and box breathing to reset your nervous system in under 5 minutes.',
   NULL, '8 min read', 'article', 'primary',
   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 1),

  (2, 'Video', '10-Minute Desk Yoga for Focus',
   'Simple movements to release tension during long study sessions or work days.',
   'Dr. Sarah Chen', '10 min video', 'play_circle', 'tertiary', NULL, 0),

  (3, 'Guide', 'The Anxiety Toolkit (PDF)',
   'A collection of grounding techniques and cognitive reframing worksheets for daily use.',
   NULL, '2.4 MB Download', 'description', 'secondary', NULL, 0),

  (4, 'Article', 'Sleep Hygiene 101',
   'Optimizing your bedroom environment for deep, restorative sleep cycles tonight.',
   NULL, '5 min read', 'article', 'primary', NULL, 0),

  (5, 'Audio', 'Body Scan Meditation',
   'A 15-minute guided body scan to release physical tension and quiet the mind before sleep.',
   NULL, '15 min audio', 'headphones', 'tertiary', NULL, 0),

  (6, 'Article', 'Setting Healthy Boundaries',
   'Practical strategies for communicating your needs and protecting your energy in relationships.',
   NULL, '6 min read', 'article', 'secondary', NULL, 0),

  (5, 'Video', 'Mindful Journaling for Beginners',
   'How to start a journaling practice that actually sticks and improves your mental clarity.',
   NULL, '12 min video', 'play_circle', 'primary', NULL, 0),

  (1, 'Article', 'The Science of Stress',
   'Understanding cortisol, your fight-or-flight response, and how to work with your body.',
   NULL, '7 min read', 'article', 'tertiary', NULL, 0);

-- =============================================================================
-- USEFUL VIEWS
-- =============================================================================

-- Forum post feed with support count and reply count
CREATE OR REPLACE VIEW v_forum_feed AS
SELECT
  fp.id,
  fp.user_id,
  fp.display_name,
  fp.tag,
  fp.body,
  fp.is_featured,
  fp.created_at,
  COUNT(DISTINCT fps.user_id)  AS support_count,
  COUNT(DISTINCT fr.id)        AS reply_count
FROM forum_posts fp
LEFT JOIN forum_post_supports fps ON fps.post_id = fp.id
LEFT JOIN forum_replies        fr  ON fr.post_id  = fp.id AND fr.is_deleted = 0
WHERE fp.is_deleted = 0
GROUP BY fp.id;

-- Mood history with comma-separated factors
CREATE OR REPLACE VIEW v_mood_history AS
SELECT
  me.id,
  me.user_id,
  me.value,
  me.note,
  me.logged_at,
  GROUP_CONCAT(mf.factor ORDER BY mf.factor SEPARATOR ', ') AS factors
FROM mood_entries me
LEFT JOIN mood_factors mf ON mf.mood_entry_id = me.id
GROUP BY me.id;

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
