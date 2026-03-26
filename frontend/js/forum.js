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

let allPosts = [
  { id:1, author:'Anonymous Owl',    icon:'face_6',          colorIdx:0, tag:'Anxiety',    time:'2 hours ago',  text:"Does anyone else feel like they're just holding their breath until the weekend? Trying to find small moments of peace during the mid-week rush, but it's hard when exams are looming.", support:12, replies:4,  supported:false, featured:false },
  { id:2, author:'Silent Wanderer',  icon:'person_4',        colorIdx:1, tag:'Motivation', time:'5 hours ago',  text:"Finally managed to step outside for a 10-minute walk today after being stuck at my desk for 8 hours. The fresh air felt like a reset button. Highly recommend taking that tiny break even when it feels impossible. 🌿", support:28, replies:1, supported:false, featured:true  },
  { id:3, author:'Morning Mist',     icon:'sentiment_neutral',colorIdx:2, tag:'Stress',    time:'8 hours ago',  text:"Struggling with burnout. How do you all separate your personal life from work when your office is literally 5 feet from your bed? My brain won't stop thinking about spreadsheets even at midnight.", support:8, replies:15, supported:false, featured:false },
  { id:4, author:'Quiet River',      icon:'face_3',          colorIdx:3, tag:'School',     time:'Yesterday',    text:"Passed my midterms! I honestly didn't think I would make it through this semester. If you're struggling right now — you're not alone, and it does get better. 💚", support:45, replies:7, supported:false, featured:false },
];
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

function toggleSupport(id) {
  const post = allPosts.find(p => p.id === id);
  if (!post) return;
  post.supported = !post.supported;
  post.support += post.supported ? 1 : -1;
  renderPosts();
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
    // await api.createPost({ text, tag: selectedTag || 'General' });
    await new Promise(r => setTimeout(r, 700));
    const icons = AVATAR_ICONS;
    allPosts.unshift({
      id: Date.now(), author: 'You', icon: icons[Math.floor(Math.random() * icons.length)],
      colorIdx: 3, tag: selectedTag || 'General', time: 'Just now',
      text, support: 0, replies: 0, supported: false, featured: false,
    });
    closeNewPost();
    renderPosts();
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

renderPosts();
