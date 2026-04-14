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
      author: p.displayName || 'Anonymous',
      icon: AVATAR_ICONS[p.id % AVATAR_ICONS.length],
      colorIdx: p.id % AVATAR_COLORS.length,
      tag: p.tag || 'General',
      time: getTimeAgo(new Date(p.createdAt)),
      text: p.body,
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
          <button class="action-btn" style="background:transparent;color:var(--on-surface-variant);" onclick="openReplies(${post.id})">
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
let selectedTag  = null;
let postMode     = 'anon'; // 'anon' | 'self'

function setPostMode(mode) {
  postMode = mode;
  const user = JSON.parse(localStorage.getItem('ms_user') || '{}');
  const btnAnon = document.getElementById('btnAnon');
  const btnSelf = document.getElementById('btnSelf');
  const hint    = document.getElementById('postModeHint');
  const submitBtn = document.getElementById('submitPostBtn');

  if (mode === 'anon') {
    btnAnon.style.background    = 'var(--primary)';
    btnAnon.style.color         = 'var(--on-primary)';
    btnAnon.style.borderColor   = 'var(--primary)';
    btnSelf.style.background    = 'transparent';
    btnSelf.style.color         = 'var(--on-surface-variant)';
    btnSelf.style.borderColor   = 'var(--outline-variant)';
    hint.textContent = 'A random alias will be assigned — no one can trace this to you.';
    submitBtn.textContent = 'Post anonymously';
  } else {
    btnSelf.style.background    = 'var(--primary)';
    btnSelf.style.color         = 'var(--on-primary)';
    btnSelf.style.borderColor   = 'var(--primary)';
    btnAnon.style.background    = 'transparent';
    btnAnon.style.color         = 'var(--on-surface-variant)';
    btnAnon.style.borderColor   = 'var(--outline-variant)';
    hint.textContent = `Your name "${user.name || 'You'}" will be visible to everyone.`;
    submitBtn.textContent = `Post as ${user.name || 'yourself'}`;
  }
}
window.setPostMode = setPostMode;

function openNewPost() {
  const user = JSON.parse(localStorage.getItem('ms_user') || '{}');
  document.getElementById('selfLabel').textContent = user.name || 'Yourself';
  document.getElementById('newPostModal').style.display = 'flex';
  document.getElementById('postContent').focus();
  setPostMode('anon'); // always reset to anon on open
}
function closeNewPost() {
  document.getElementById('newPostModal').style.display = 'none';
  document.getElementById('postContent').value = '';
  selectedTag = null;
  postMode = 'anon';
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

  const user = JSON.parse(localStorage.getItem('ms_user') || '{}');
  // Pass displayName only when posting as self — backend generates alias when omitted
  const displayName = postMode === 'self' ? (user.name || '') : '';

  try {
    await api.createPost({ body: text, tag: selectedTag || 'General', displayName });
    closeNewPost();
    await loadPosts();
    showToast(postMode === 'self' ? `Posted as ${user.name}!` : 'Posted anonymously!', 'success');
  } catch (e) {
    showToast(e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = postMode === 'self' ? `Post as ${user.name || 'yourself'}` : 'Post anonymously';
  }
}
window.submitPost = submitPost;

// Close modal on overlay click
document.getElementById('newPostModal').addEventListener('click', function (e) {
  if (e.target === this) closeNewPost();
});

// ── Replies modal ─────────────────────────────────────────────────────────────
let activeReplyPostId = null;

async function openReplies(postId) {
  activeReplyPostId = postId;
  const modal = document.getElementById('repliesModal');
  const list  = document.getElementById('repliesList');
  modal.style.display = 'flex';
  list.innerHTML = '<p style="color:var(--on-surface-variant);padding:1rem 0;">Loading...</p>';
  document.getElementById('replyInput').value = '';

  try {
    const replies = await api.getReplies(postId);
    if (!replies.length) {
      list.innerHTML = '<p style="color:var(--on-surface-variant);padding:1rem 0;">No replies yet. Be the first!</p>';
      return;
    }
    list.innerHTML = replies.map(r => `
      <div style="padding:1rem 0;border-bottom:1px solid rgba(169,180,176,0.12);">
        <div style="display:flex;justify-content:space-between;margin-bottom:0.4rem;">
          <span style="font-weight:700;font-size:0.9rem;">${r.displayName || 'Anonymous'}</span>
          <span style="font-size:0.75rem;color:var(--outline);">${getTimeAgo(new Date(r.createdAt))}</span>
        </div>
        <p style="font-size:0.9rem;line-height:1.6;color:var(--on-surface);">${r.body}</p>
      </div>`).join('');
  } catch (e) {
    list.innerHTML = `<p style="color:var(--error);">${e.message}</p>`;
  }
}
window.openReplies = openReplies;

function closeReplies() {
  document.getElementById('repliesModal').style.display = 'none';
  activeReplyPostId = null;
}
window.closeReplies = closeReplies;

document.getElementById('repliesModal').addEventListener('click', function (e) {
  if (e.target === this) closeReplies();
});

document.getElementById('submitReplyBtn').addEventListener('click', async () => {
  const text = document.getElementById('replyInput').value.trim();
  if (!text || !activeReplyPostId) return;
  const btn = document.getElementById('submitReplyBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>';
  try {
    await api.addReply(activeReplyPostId, text);
    // update reply count in local state
    const post = allPosts.find(p => p.id === activeReplyPostId);
    if (post) post.replies++;
    await openReplies(activeReplyPostId); // refresh list
    renderPosts();
    showToast('Reply posted!', 'success');
  } catch (e) {
    showToast(e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Reply';
  }
});

loadPosts();
