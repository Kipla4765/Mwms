requireAuth();
initNav('Shared Sanctuary');

const AVATAR_ICONS = ['face_6', 'person_4', 'sentiment_neutral', 'face_3', 'face_5', 'person_2'];
const AVATAR_COLORS = [
  { bg: 'var(--tertiary-container)',  text: 'var(--on-tertiary-container)' },
  { bg: 'var(--secondary-container)', text: 'var(--on-secondary-container)' },
  { bg: 'var(--surface-container-high)', text: 'var(--on-surface-variant)' },
  { bg: 'var(--primary-container)',   text: 'var(--on-primary-container)' },
];
const TAG_COLORS = {
  Anxiety:       { bg: 'var(--surface-container-high)', text: 'var(--on-surface-variant)' },
  School:        { bg: 'var(--secondary-container)',    text: 'var(--on-secondary-container)' },
  Motivation:    { bg: 'var(--tertiary-container)',     text: 'var(--on-tertiary-container)' },
  Stress:        { bg: 'var(--surface-container-high)', text: 'var(--on-surface-variant)' },
  Relationships: { bg: 'var(--primary-container)',      text: 'var(--on-primary-container)' },
  General:       { bg: 'var(--surface-container)',      text: 'var(--on-surface-variant)' },
};

let allPosts = [];
let supportedPosts = new Set();

async function loadPosts() {
  try {
    const posts = await api.getPosts();
    allPosts = posts.map(p => ({
      id: p.id,
      author: p.authorName || 'Anonymous',
      icon: AVATAR_ICONS[p.id % AVATAR_ICONS.length],
      colorIdx: p.id % AVATAR_COLORS.length,
      tag: p.tag || 'General',
      time: getTimeAgo(new Date(p.createdAt)),
      text: p.content,
      support: p.supportCount || 0,
      replies: p.replyCount || 0,
      supported: supportedPosts.has(p.id),
      featured: p.featured || false,
    }));
    renderPosts();
  } catch (e) {
    allPosts = [];
    renderPosts();
  }
}

function getTimeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
let visibleCount = 4;
let activeTag = 'all';

function renderPosts() {
  const filtered = activeTag === 'all' ? allPosts : allPosts.filter(p => p.tag === activeTag);
  const visible  = filtered.slice(0, visibleCount);
  const feed = document.getElementById('postsFeed');

  feed.innerHTML = visible.map(post => {
    const av  = AVATAR_COLORS[post.colorIdx % AVATAR_COLORS.length];
    const tag = TAG_COLORS[post.tag] || TAG_COLORS.General;
    return `
      <article class="post-card ${post.featured ? 'featured' : ''}">
        <div style="display:flex;align-items:flex-start;gap:1rem;margin-bottom:1rem;">
          <div class="avatar-icon" style="background:${av.bg};color:${av.text};">
            <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">${post.icon}</span>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.75rem;">
              <span style="font-weight:700;">${post.author}</span>
              <span style="font-size:0.8rem;color:var(--outline);">• ${post.time}</span>
              <span class="tag-badge" style="background:${tag.bg};color:${tag.text};">${post.tag}</span>
            </div>
            <p style="font-size:1rem;line-height:1.7;color:var(--on-surface);">${post.text}</p>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:0.75rem;padding-top:1rem;border-top:1px solid rgba(169,180,176,0.12);">
          <button class="action-btn" style="background:${post.supported ? 'rgba(62,103,82,0.15)' : 'rgba(202,249,220,0.3)'};color:var(--tertiary);" onclick="toggleSupport(${post.id})">
            <span class="material-symbols-outlined" style="font-size:1rem;font-variation-settings:'FILL' ${post.supported ? 1 : 0};">favorite</span>
            ${post.support} Support
          </button>
          <button class="action-btn" style="background:transparent;color:var(--on-surface-variant);" onclick="showToast('Replies coming soon!','default')">
            <span class="material-symbols-outlined" style="font-size:1rem;">reply</span>
            ${post.replies} ${post.replies === 1 ? 'Reply' : 'Replies'}
          </button>
          <div style="flex:1;"></div>
          <button class="icon-btn" style="color:var(--outline);" aria-label="Bookmark">
            <span class="material-symbols-outlined">bookmark</span>
          </button>
        </div>
      </article>`;
  }).join('');

  document.getElementById('loadMoreBtn').style.display =
    filtered.length > visibleCount ? 'inline-flex' : 'none';
}

function filterPosts(tag) {
  activeTag = tag;
  visibleCount = 4;
  document.querySelectorAll('#filterTags .chip').forEach(c => {
    c.classList.toggle('active', c.dataset.tag === tag);
  });
  renderPosts();
}
window.filterPosts = filterPosts;

function loadMore() {
  visibleCount += 4;
  renderPosts();
}
window.loadMore = loadMore;

async function toggleSupport(id) {
  const post = allPosts.find(p => p.id === id);
  if (!post) return;
  try {
    await api.supportPost(id);
    post.supported = !post.supported;
    post.support += post.supported ? 1 : -1;
    if (post.supported) supportedPosts.add(id);
    else supportedPosts.delete(id);
    renderPosts();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// ── New post modal ────────────────────────────────────────────────────────────
let selectedTag = null;

function openNewPost() {
  document.getElementById('newPostModal').style.display = 'flex';
  document.getElementById('postContent').focus();
}
function closeNewPost() {
  document.getElementById('newPostModal').style.display = 'none';
  document.getElementById('postContent').value = '';
  selectedTag = null;
  document.querySelectorAll('#postTagPicker .chip').forEach(c => c.classList.remove('active'));
}
window.openNewPost  = openNewPost;
window.closeNewPost = closeNewPost;

document.querySelectorAll('#postTagPicker .chip').forEach(chip => {
  chip.addEventListener('click', function () {
    document.querySelectorAll('#postTagPicker .chip').forEach(c => c.classList.remove('active'));
    this.classList.add('active');
    selectedTag = this.dataset.tag;
  });
});

async function submitPost() {
  const text = document.getElementById('postContent').value.trim();
  if (!text) { showToast('Write something first!', 'default'); return; }
  const btn = document.getElementById('submitPostBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>';

  try {
    await api.createPost({ text, tag: selectedTag || 'General' });
    closeNewPost();
    await loadPosts();
    showToast('Posted anonymously!', 'success');
  } catch (e) {
    showToast(e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Post anonymously';
  }
}
window.submitPost = submitPost;

// Close modal on overlay click
document.getElementById('newPostModal').addEventListener('click', function (e) {
  if (e.target === this) closeNewPost();
});

loadPosts();
