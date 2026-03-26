// Shared navigation component — injected into every page

const NAV_ITEMS = [
  { icon: 'dashboard',     label: 'Dashboard', href: 'dashboard.html' },
  { icon: 'mood',          label: 'Mood',      href: 'mood.html'      },
  { icon: 'forum',         label: 'Forum',     href: 'forum.html'     },
  { icon: 'library_books', label: 'Library',   href: 'library.html'   },
  { icon: 'menu_book',     label: 'Journal',   href: 'journal.html'   },
];

function currentPage() {
  return window.location.pathname.split('/').pop() || 'index.html';
}

function buildSidebar() {
  const page = currentPage();

  const navLinks = NAV_ITEMS.map(item => {
    const active = page === item.href ? 'active' : '';
    return `
      <a class="nav-link ${active}" href="${item.href}">
        <span class="material-symbols-outlined">${item.icon}</span>
        <span>${item.label}</span>
      </a>`;
  }).join('');

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <h1>MindSpace</h1>
        <p>Your Sanctuary</p>
      </div>
      <nav>${navLinks}</nav>
      <div class="sidebar-footer">
        <button class="btn-new-entry" onclick="location.href='journal.html'">
          <span class="material-symbols-outlined" style="font-size:1.1rem">add</span>
          New Journal Entry
        </button>
        <a class="nav-link" href="settings.html">
          <span class="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </a>
        <a class="nav-link" href="support.html">
          <span class="material-symbols-outlined">help_outline</span>
          <span>Support</span>
        </a>
      </div>
    </aside>`;
}

function buildTopbar(title) {
  return `
    <header class="topbar" id="topbar">
      <div style="display:flex;align-items:center;gap:1rem">
        <button class="icon-btn" id="menuToggle" style="display:none" aria-label="Open menu">
          <span class="material-symbols-outlined">menu</span>
        </button>
        <span class="topbar-brand" id="mobileBrand" style="display:none">MindSpace</span>
        <span class="topbar-title" id="desktopTitle">${title}</span>
      </div>
      <div class="topbar-actions">
        <button class="icon-btn" aria-label="Notifications" onclick="window._notifClick && window._notifClick()">
          <span class="material-symbols-outlined">notifications</span>
        </button>
        <img class="avatar" id="userAvatar"
          src="https://ui-avatars.com/api/?name=User&background=b6eee0&color=245a50"
          alt="Profile" onclick="location.href='settings.html'" />
      </div>
    </header>`;
}

function buildBottomNav() {
  const page = currentPage();
  const items = [
    { icon: 'dashboard',     label: 'Home',    href: 'dashboard.html' },
    { icon: 'mood',          label: 'Mood',    href: 'mood.html'      },
    { icon: 'forum',         label: 'Forum',   href: 'forum.html'     },
    { icon: 'library_books', label: 'Library', href: 'library.html'   },
    { icon: 'menu_book',     label: 'Journal', href: 'journal.html'   },
  ];

  const links = items.map(item => {
    const active = page === item.href ? 'active' : '';
    const icon = active
      ? `<div class="active-pill"><span class="material-symbols-outlined">${item.icon}</span></div>`
      : `<span class="material-symbols-outlined">${item.icon}</span>`;
    return `<a class="${active}" href="${item.href}">${icon}<span>${item.label}</span></a>`;
  }).join('');

  return `<nav class="bottom-nav" id="bottomNav">${links}</nav>`;
}

/**
 * Call this on every page (except login).
 * @param {string} title - Page title shown in topbar on desktop
 */
function initNav(title = 'MindSpace') {
  // Inject sidebar before everything, topbar after sidebar, both before <main>
  document.body.insertAdjacentHTML('afterbegin', buildTopbar(title));
  document.body.insertAdjacentHTML('afterbegin', buildSidebar());
  document.body.insertAdjacentHTML('beforeend', buildBottomNav());

  // Mobile: show hamburger + brand, hide desktop title
  const mq = window.matchMedia('(max-width: 767px)');
  function handleMQ(e) {
    document.getElementById('menuToggle').style.display  = e.matches ? 'flex' : 'none';
    document.getElementById('mobileBrand').style.display = e.matches ? 'block' : 'none';
    document.getElementById('desktopTitle').style.display = e.matches ? 'none' : 'block';
  }
  handleMQ(mq);
  mq.addEventListener('change', handleMQ);

  // Mobile sidebar drawer toggle
  const sidebar = document.getElementById('sidebar');
  document.getElementById('menuToggle').addEventListener('click', () => {
    const open = sidebar.style.display === 'flex';
    sidebar.style.display = open ? 'none' : 'flex';
    sidebar.style.position = 'fixed';
    sidebar.style.zIndex = '60';
  });

  // Close sidebar on outside click (mobile)
  document.addEventListener('click', e => {
    if (window.innerWidth < 768 &&
        sidebar.style.display === 'flex' &&
        !sidebar.contains(e.target) &&
        e.target.id !== 'menuToggle') {
      sidebar.style.display = 'none';
    }
  });

  // Populate avatar from stored user
  const user = JSON.parse(localStorage.getItem('ms_user') || '{}');
  if (user.name) {
    document.getElementById('userAvatar').src =
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=b6eee0&color=245a50`;
  }
}

// ── Toast utility (available globally) ──────────────────────────────────────
function showToast(message, type = 'default', duration = 3000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

window.showToast = showToast;
