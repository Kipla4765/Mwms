// library.js — no initNav, no requireAuth redirect (page is self-contained)

const categories = [
  { icon: 'self_improvement', label: 'Stress Management', count: 12 },
  { icon: 'school',           label: 'Study Tips',        count: 8  },
  { icon: 'psychology',       label: 'Anxiety Help',      count: 15 },
  { icon: 'bedtime',          label: 'Sleep Improvement', count: 10 },
  { icon: 'favorite',         label: 'Self-Care',         count: 9  },
  { icon: 'groups',           label: 'Relationships',     count: 7  },
];

const allResources = [
  {
    id:1, type:'Article', featured:true,
    title:'Mastering the Art of Deep Breathing',
    desc:'A comprehensive guide on physiological sighs and box breathing to reset your nervous system in under 5 minutes.',
    meta:'8 min read', author:'', icon:'article', iconColor:'primary',
    img:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    category:'Stress Management',
  },
  {
    id:2, type:'Video', featured:false,
    title:'10-Minute Desk Yoga for Focus',
    desc:'Simple movements to release tension during long study sessions or work days.',
    meta:'10 min video', author:'Dr. Sarah Chen', icon:'play_circle', iconColor:'tertiary',
    img:'', category:'Study Tips',
  },
  {
    id:3, type:'Guide', featured:false,
    title:'The Anxiety Toolkit (PDF)',
    desc:'A collection of grounding techniques and cognitive reframing worksheets for daily use.',
    meta:'2.4 MB Download', author:'', icon:'description', iconColor:'secondary',
    img:'', category:'Anxiety Help',
  },
  {
    id:4, type:'Article', featured:false,
    title:'Sleep Hygiene 101',
    desc:'Optimizing your bedroom environment for deep, restorative sleep cycles tonight.',
    meta:'5 min read', author:'', icon:'article', iconColor:'primary',
    img:'', category:'Sleep Improvement',
  },
  {
    id:5, type:'Audio', featured:false,
    title:'Body Scan Meditation',
    desc:'A 15-minute guided body scan to release physical tension and quiet the mind before sleep.',
    meta:'15 min audio', author:'', icon:'headphones', iconColor:'tertiary',
    img:'', category:'Self-Care',
  },
  {
    id:6, type:'Article', featured:false,
    title:'Setting Healthy Boundaries',
    desc:'Practical strategies for communicating your needs and protecting your energy in relationships.',
    meta:'6 min read', author:'', icon:'article', iconColor:'secondary',
    img:'', category:'Relationships',
  },
  {
    id:7, type:'Video', featured:false,
    title:'Mindful Journaling for Beginners',
    desc:'How to start a journaling practice that actually sticks and improves your mental clarity.',
    meta:'12 min video', author:'', icon:'play_circle', iconColor:'primary',
    img:'', category:'Self-Care',
  },
  {
    id:8, type:'Article', featured:false,
    title:'The Science of Stress',
    desc:'Understanding cortisol, your fight-or-flight response, and how to work with your body.',
    meta:'7 min read', author:'', icon:'article', iconColor:'tertiary',
    img:'', category:'Stress Management',
  },
];

const IC = {
  primary:   { bg:'#b6eee0', text:'#245a50' },
  secondary: { bg:'#cbe6ff', text:'#36556d' },
  tertiary:  { bg:'#caf9dc', text:'#37614b' },
};

let currentPage  = 1;
const perPage    = 5; // featured + tip + 3 side cards
let filtered     = [...allResources];
let activeCategory = null;

// ── Categories ────────────────────────────────────────────────────────────────
function renderCategories() {
  document.getElementById('categoriesGrid').innerHTML = categories.map(c => `
    <div class="cat-card ${activeCategory === c.label ? 'active' : ''}"
         onclick="filterByCategory('${c.label}')"
         style="${activeCategory === c.label ? 'outline:2px solid #33685d;background:rgba(182,238,224,0.35);' : ''}">
      <div class="cat-icon-bg">
        <span class="material-symbols-outlined" style="font-size:4rem;color:#33685d;">${c.icon}</span>
      </div>
      <h3>${c.label}</h3>
      <p>${c.count} Resources</p>
    </div>`).join('');
}

// ── Resources ─────────────────────────────────────────────────────────────────
function renderResources() {
  const start = (currentPage - 1) * perPage;
  const items = filtered.slice(start, start + perPage);
  const grid  = document.getElementById('resourcesGrid');

  if (!items.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:4rem 1rem;color:#57615e;">
        <span class="material-symbols-outlined" style="font-size:3rem;display:block;margin-bottom:1rem;opacity:0.4;">search_off</span>
        <p>No resources found.</p>
        <button onclick="resetFilter()" style="margin-top:1rem;color:#33685d;background:none;border:none;cursor:pointer;font-weight:700;font-family:'Manrope',sans-serif;">Clear filter</button>
      </div>`;
    renderPagination();
    return;
  }

  let html = '';
  const featured = items.find(r => r.featured);
  const rest     = items.filter(r => !r.featured).slice(0, 3);

  // Featured (span 8)
  if (featured) {
    html += `
      <div class="res-featured" onclick="openResource(${featured.id})">
        <div class="res-featured-inner">
          <div class="res-feat-img">
            <img src="${featured.img}" alt="${featured.title}" loading="lazy"/>
            <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.3),transparent);"></div>
            <span class="res-feat-badge">${featured.type}</span>
          </div>
          <div class="res-feat-body">
            <h3>${featured.title}</h3>
            <p>${featured.desc}</p>
            <div class="res-feat-footer">
              <div style="display:flex;align-items:center;gap:0.4rem;">
                <span class="material-symbols-outlined" style="color:#33685d;font-size:1rem;">timer</span>
                <span style="font-size:0.8rem;color:#57615e;">${featured.meta}</span>
              </div>
              <button style="width:2.5rem;height:2.5rem;border-radius:9999px;border:none;background:#e1eae6;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.15s;"
                onmouseover="this.style.background='#33685d';this.querySelector('span').style.color='#e3fff6'"
                onmouseout="this.style.background='#e1eae6';this.querySelector('span').style.color='#2a3532'"
                aria-label="Bookmark">
                <span class="material-symbols-outlined" style="font-size:1.1rem;">bookmark</span>
              </button>
            </div>
          </div>
        </div>
      </div>`;
  } else {
    // If no featured on this page, show first item as a side card instead
    rest.unshift(items[0]);
  }

  // Side cards (span 4 each)
  rest.forEach(r => {
    const ic = IC[r.iconColor] || IC.primary;
    html += `
      <div class="res-side" onclick="openResource(${r.id})">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.5rem;">
          <div class="res-side-icon" style="background:${ic.bg};color:${ic.text};">
            <span class="material-symbols-outlined">${r.icon}</span>
          </div>
          <span style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#a9b4b0;">${r.type}</span>
        </div>
        <h3>${r.title}</h3>
        <p>${r.desc}</p>
        <div class="res-side-footer">
          <span style="font-size:0.75rem;font-weight:600;color:#33685d;">${r.author || r.meta}</span>
          <span class="material-symbols-outlined" style="color:#33685d;font-size:1rem;">${r.type === 'Guide' ? 'download' : 'arrow_outward'}</span>
        </div>
      </div>`;
  });

  // Quick tip (span 4)
  html += `
    <div class="res-tip">
      <span class="material-symbols-outlined" style="font-size:2.5rem;color:#b6eee0;margin-bottom:1rem;font-variation-settings:'FILL' 1;">lightbulb</span>
      <h3>Quick Tip</h3>
      <p>Try the 5-4-3-2-1 grounding technique: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.</p>
      <div class="res-tip-deco"></div>
    </div>`;

  grid.innerHTML = html;
  renderPagination();
}

// ── Pagination ────────────────────────────────────────────────────────────────
function renderPagination() {
  const total   = Math.ceil(filtered.length / perPage);
  const showing = Math.min(currentPage * perPage, filtered.length);
  document.getElementById('paginationInfo').textContent =
    `Showing ${showing} of ${filtered.length} resource${filtered.length !== 1 ? 's' : ''}`;

  if (total <= 1) { document.getElementById('paginationBtns').innerHTML = ''; return; }

  let html = `<button class="pg-btn" onclick="goPage(${currentPage-1})" ${currentPage===1?'disabled style="opacity:0.3"':''}>
    <span class="material-symbols-outlined" style="font-size:1rem;">chevron_left</span></button>`;
  for (let i = 1; i <= total; i++) {
    if (i===1 || i===total || Math.abs(i-currentPage)<=1)
      html += `<button class="pg-btn ${i===currentPage?'active':''}" onclick="goPage(${i})">${i}</button>`;
    else if (Math.abs(i-currentPage)===2)
      html += `<span style="padding:0 0.25rem;color:#727d79;">…</span>`;
  }
  html += `<button class="pg-btn" onclick="goPage(${currentPage+1})" ${currentPage===total?'disabled style="opacity:0.3"':''}>
    <span class="material-symbols-outlined" style="font-size:1rem;">chevron_right</span></button>`;
  document.getElementById('paginationBtns').innerHTML = html;
}

function goPage(p) {
  const total = Math.ceil(filtered.length / perPage);
  if (p < 1 || p > total) return;
  currentPage = p;
  renderResources();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.goPage = goPage;

// ── Filters ───────────────────────────────────────────────────────────────────
function filterByCategory(cat) {
  activeCategory = cat;
  filtered = allResources.filter(r => r.category === cat);
  currentPage = 1;
  document.getElementById('resourcesHeading').textContent = cat;
  renderCategories();
  renderResources();
}
window.filterByCategory = filterByCategory;

function resetFilter() {
  activeCategory = null;
  filtered = [...allResources];
  currentPage = 1;
  document.getElementById('resourcesHeading').textContent = 'Top Resources for You';
  const si = document.getElementById('desktopSearch');
  const mi = document.getElementById('mobileSearch');
  if (si) si.value = '';
  if (mi) mi.value = '';
  renderCategories();
  renderResources();
}
window.resetFilter = resetFilter;

function handleSearch(q) {
  const query = q.toLowerCase().trim();
  activeCategory = null;
  filtered = query
    ? allResources.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.desc.toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query))
    : [...allResources];
  currentPage = 1;
  document.getElementById('resourcesHeading').textContent =
    query ? `Results for "${q}"` : 'Top Resources for You';
  renderCategories();
  renderResources();
}
window.handleSearch = handleSearch;

function openResource(id) {
  const r = allResources.find(x => x.id === id);
  if (!r) return;
  // Simple toast for now — replace with navigation when detail page exists
  const msg = document.createElement('div');
  msg.style.cssText = 'position:fixed;bottom:5rem;right:1.5rem;background:#33685d;color:#e3fff6;padding:0.875rem 1.5rem;border-radius:1rem;font-size:0.875rem;font-weight:500;z-index:100;animation:fadeIn 0.2s ease;';
  msg.textContent = `"${r.title}" — detail page coming soon`;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}
window.openResource = openResource;

// ── Boot ──────────────────────────────────────────────────────────────────────
renderCategories();
renderResources();
