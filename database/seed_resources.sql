-- =============================================================================
-- MindSpace — Library Resources Seed (Real URLs)
-- Run after schema.sql. Safe to re-run (clears existing resources first).
-- =============================================================================

USE mindspace;

DELETE FROM library_resources;
ALTER TABLE library_resources AUTO_INCREMENT = 1;

-- =============================================================================
-- CATEGORY 1 — Stress Management (cat_id = 1)
-- =============================================================================
INSERT INTO library_resources (category_id, type, title, description, author, meta_label, icon, icon_color, image_url, url, is_featured) VALUES

(1, 'Article', '10 Breathing Techniques for Stress Relief',
 'A practical guide to breathing exercises — box breathing, diaphragmatic breathing, and the 4-7-8 method — that reset your nervous system fast.',
 'Healthline Editorial', '8 min read', 'article', 'primary',
 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
 'https://www.healthline.com/health/breathing-exercise', 1),

(1, 'Article', 'Chronic Stress and Your Health',
 'Mayo Clinic explains how chronic stress affects your body, mood, and behaviour — and what you can do about it.',
 'Mayo Clinic Staff', '6 min read', 'article', 'tertiary', NULL,
 'https://www.mayoclinic.org/healthy-lifestyle/stress-management/in-depth/stress/art-20046037', 0),

(1, 'Article', 'Everything to Know About Stress',
 'A comprehensive overview of stress: causes, symptoms, the fight-or-flight response, and evidence-based coping strategies.',
 'Healthline Editorial', '7 min read', 'article', 'secondary', NULL,
 'https://www.healthline.com/health/stress', 0),

(1, 'Audio', 'Progressive Muscle Relaxation (Guided)',
 'A free guided PMR session on Insight Timer — systematically tense and release muscle groups to drain physical stress from your body.',
 'Insight Timer', '12 min audio', 'headphones', 'primary', NULL,
 'https://insighttimer.com/lauraptherapy/guided-meditations/progressive-muscle-relaxation-pmr-to-reduce-tension', 0),

(1, 'Article', 'Grounding Techniques for Anxiety and Stress',
 'Physical and mental grounding exercises — including the 5-4-3-2-1 method — to bring you back to the present moment during stress.',
 'Healthline Editorial', '7 min read', 'article', 'secondary', NULL,
 'https://www.healthline.com/health/grounding-techniques', 0);

-- =============================================================================
-- CATEGORY 2 — Study Tips (cat_id = 2)
-- =============================================================================
INSERT INTO library_resources (category_id, type, title, description, author, meta_label, icon, icon_color, image_url, url, is_featured) VALUES

(2, 'Article', 'The Pomodoro Technique — Why It Works',
 'Todoist breaks down the Pomodoro method: 25-minute focused sprints, short breaks, and how to adapt it for deep work and long study sessions.',
 'Todoist', '6 min read', 'article', 'secondary',
 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
 'https://todoist.com/productivity-methods/pomodoro-technique', 0),

(2, 'Article', 'How to Remember More with Spaced Repetition',
 'College Info Geek explains the spacing effect and how to use spaced repetition systems (SRS) to dramatically improve long-term retention.',
 'College Info Geek', '8 min read', 'article', 'primary', NULL,
 'https://collegeinfogeek.com/spaced-repetition-memory-technique', 0),

(2, 'Article', 'How to Study When You Have No Motivation',
 'Practical strategies for starting when you feel stuck — the 2-minute rule, environment design, and breaking tasks into micro-goals.',
 'School Habits', '5 min read', 'article', 'tertiary', NULL,
 'https://schoolhabits.com/how-to-study-when-you-have-no-motivation/', 0),

(2, 'Audio', 'Focus Flow: Brown Noise for Concentration',
 'A free brown noise session on Insight Timer — scientifically shown to improve concentration and mask distracting background sounds.',
 'Insight Timer', '30 min audio', 'headphones', 'secondary', NULL,
 'https://insighttimer.com/guided-meditations/browse/focus', 0);

-- =============================================================================
-- CATEGORY 3 — Anxiety Help (cat_id = 3)
-- =============================================================================
INSERT INTO library_resources (category_id, type, title, description, author, meta_label, icon, icon_color, image_url, url, is_featured) VALUES

(3, 'Article', 'Breathing Exercises for Anxiety',
 'Eight evidence-based breathing techniques specifically for anxiety — including resonance breathing, the Papworth method, and box breathing.',
 'Healthline Editorial', '7 min read', 'article', 'primary',
 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
 'https://www.healthline.com/health/breathing-exercises-for-anxiety', 0),

(3, 'Article', 'How to Use the 5-4-3-2-1 Grounding Technique',
 'Step-by-step walkthrough of the 5-4-3-2-1 sensory grounding method — one of the most effective tools for stopping an anxiety spiral.',
 'The Mindfulness App', '5 min read', 'article', 'secondary', NULL,
 'https://www.themindfulnessapp.com/articles/use-5-4-3-2-1-technique-anxiety', 0),

(3, 'Article', 'Anxiety Among Undergraduate Students: Causes and Coping',
 'A peer-reviewed NIH systematic review of anxiety causes and evidence-based coping strategies specific to undergraduate students.',
 'Annals of Neuroscience / NIH', '10 min read', 'article', 'tertiary', NULL,
 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12420638/', 0),

(3, 'Audio', 'RAIN Meditation for Anxiety (Guided)',
 'A free guided RAIN meditation on Insight Timer — Recognize, Allow, Investigate, Nurture — to work through anxious feelings with compassion.',
 'Insight Timer', '12 min audio', 'headphones', 'primary', NULL,
 'https://insighttimer.com/guided-meditations/browse/anxiety', 0),

(3, 'Article', 'Social Anxiety Disorder in College Students',
 'Research on the experience of college students with social anxiety disorder — causes, prevalence, and evidence-based interventions.',
 'Dove Press / NDT Journal', '8 min read', 'article', 'secondary', NULL,
 'https://www.dovepress.com/the-experience-among-college-students-with-social-anxiety-disorder-in--peer-reviewed-fulltext-article-NDT', 0);

-- =============================================================================
-- CATEGORY 4 — Sleep Improvement (cat_id = 4)
-- =============================================================================
INSERT INTO library_resources (category_id, type, title, description, author, meta_label, icon, icon_color, image_url, url, is_featured) VALUES

(4, 'Article', 'Sleep Hygiene: 12 Evidence-Based Tips',
 'The most impactful sleep hygiene habits — consistent schedule, light management, bedroom temperature, and wind-down routines.',
 'Healthline Editorial', '6 min read', 'article', 'primary',
 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80',
 'https://www.healthline.com/health/sleep-hygiene', 0),

(4, 'Article', 'Sleep Hygiene — Your Path to Quality Sleep',
 'The Sleep Foundation''s comprehensive guide to sleep hygiene: what it is, why it matters, and a full checklist of habits to improve your sleep.',
 'Sleep Foundation', '7 min read', 'article', 'secondary', NULL,
 'https://www.sleepfoundation.org/sleep-topics/sleep-hygiene', 0),

(4, 'Article', 'The 5 Principles of Good Sleep Health',
 'An open-access Oxford University research paper proposing five core principles of sleep health — a first-line intervention beyond standard sleep hygiene.',
 'Journal of Sleep Research / NIH', '9 min read', 'article', 'tertiary', NULL,
 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9285041/', 0),

(4, 'Audio', 'Peaceful Body Scan for Sleep (With Music)',
 'A free 15-minute guided body scan on Insight Timer designed for deep relaxation before sleep — suitable for all experience levels.',
 'Insight Timer', '15 min audio', 'headphones', 'primary', NULL,
 'https://insighttimer.com/rebeccaaaawild/guided-meditations/15-minute-bodyscan-with-music', 0),

(4, 'Article', 'Healthy Sleep Habits',
 'The American Academy of Sleep Medicine''s evidence-based guide to healthy sleep habits — covering schedules, environment, and behaviours.',
 'AASM Sleep Education', '5 min read', 'article', 'secondary', NULL,
 'https://sleepeducation.org/healthy-sleep/healthy-sleep-habits/', 0);

-- =============================================================================
-- CATEGORY 5 — Self-Care (cat_id = 5)
-- =============================================================================
INSERT INTO library_resources (category_id, type, title, description, author, meta_label, icon, icon_color, image_url, url, is_featured) VALUES

(5, 'Article', 'How to Start a Mindful Journaling Practice',
 'How to build a journaling habit that sticks — with prompts, formats, and the science behind why it reduces stress and improves mental clarity.',
 'Mindful.org', '7 min read', 'article', 'primary',
 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80',
 'https://www.mindful.org/how-to-start-a-journaling-practice/', 0),

(5, 'Article', '7 Exercises to Journal Your Way to Mindfulness',
 'Seven practical journaling exercises backed by research showing journaling builds resilience, motivation, and self-awareness.',
 'Mindful.org', '6 min read', 'article', 'secondary', NULL,
 'https://mindful.org/7-exercises-to-help-you-journal-your-way-to-mindfulness', 0),

(5, 'Audio', 'Body Scan for Mind-Body Relaxation (Guided)',
 'A free guided body scan on Insight Timer — systematically relaxing body parts and calming the mind. Great for stress relief or before sleep.',
 'Insight Timer', '15 min audio', 'headphones', 'tertiary', NULL,
 'https://insighttimer.com/jasonmaraschiello/guided-meditations/body-scan-meditation-64', 0),

(5, 'Article', 'How Mindful Journaling Helps Your Daily Practice',
 'The science of journaling: how writing focuses attention, regulates breathing, and helps process emotions you''ve been holding in.',
 'Mindful.org', '5 min read', 'article', 'primary', NULL,
 'https://mindful.org/benefits-of-journaling/', 0);

-- =============================================================================
-- CATEGORY 6 — Relationships (cat_id = 6)
-- =============================================================================
INSERT INTO library_resources (category_id, type, title, description, author, meta_label, icon, icon_color, image_url, url, is_featured) VALUES

(6, 'Article', 'Setting Boundaries That Help Relationships Bloom',
 'How to set boundaries with kindness — using clear, compassionate language and handling pushback gracefully without conflict.',
 'Psychology Today', '6 min read', 'article', 'secondary',
 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
 'https://www.psychologytoday.com/us/blog/be-the-sun-not-the-salt/202411/setting-boundaries-that-help-relationships-bloom', 0),

(6, 'Article', '5 Steps to Creating and Maintaining Healthy Boundaries',
 'A practical five-step framework for setting limits around your time, emotions, and energy to protect yourself from burnout in relationships.',
 'Psychology Today', '5 min read', 'article', 'primary', NULL,
 'https://www.psychologytoday.com/us/blog/the-addiction-connection/202210/5-steps-to-creating-and-maintaining-healthy-boundaries', 0),

(6, 'Article', 'Why Are College Students Feeling So Lonely?',
 'Psychology Today examines why 64% of college students report feeling lonely — and what actually helps, based on research with 48,000 students.',
 'Psychology Today', '7 min read', 'article', 'tertiary', NULL,
 'https://www.psychologytoday.com/ca/blog/campus-crunch/202002/why-are-college-students-feeling-so-lonely', 0),

(6, 'Article', 'Fighting Campus Loneliness',
 'Research-backed piece on the link between campus loneliness and anxiety, depression, and poor academic performance — with practical steps forward.',
 'Psychology Today', '6 min read', 'article', 'secondary', NULL,
 'https://www.psychologytoday.com/intl/blog/canines-kids-and-kindness/202407/fighting-campus-loneliness', 0);

-- =============================================================================
-- Update denormalized resource_count on categories
-- =============================================================================
UPDATE library_categories lc
SET resource_count = (
  SELECT COUNT(*) FROM library_resources lr
  WHERE lr.category_id = lc.id AND lr.is_published = 1
);

-- =============================================================================
-- END OF SEED
-- =============================================================================
