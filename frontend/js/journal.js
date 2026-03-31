requireAuth();
initNav('Journal');

// Entry metadata
document.getElementById('entryMeta').textContent =
  new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) +
  ' • ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

// Auto-save indicator
let saveTimer;
['journalTitle', 'journalBody'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(autoSave, 2000);
  });
});

function autoSave() {
  const draft = {
    title: document.getElementById('journalTitle').value,
    body:  document.getElementById('journalBody').value,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem('ms_journal_draft', JSON.stringify(draft));
}

// Restore draft
const draft = JSON.parse(localStorage.getItem('ms_journal_draft') || 'null');
if (draft) {
  document.getElementById('journalTitle').value = draft.title || '';
  document.getElementById('journalBody').value  = draft.body  || '';
}

// Save FAB
document.getElementById('saveFab').addEventListener('click', async () => {
  const title = document.getElementById('journalTitle').value.trim();
  const body  = document.getElementById('journalBody').value.trim();
  if (!title && !body) { showToast('Nothing to save yet.', 'default'); return; }

  const fab = document.getElementById('saveFab');
  fab.innerHTML = '<span class="spinner" style="border-color:rgba(255,255,255,0.3);border-top-color:#fff;"></span>';

  try {
    await api.createJournal({ title, body, date: new Date().toISOString() });
    localStorage.removeItem('ms_journal_draft');
    showToast('Entry saved!', 'success');
    await loadPastEntries();
  } catch (e) {
    showToast(e.message, 'error');
  } finally {
    fab.innerHTML = '<span class="material-symbols-outlined" style="font-variation-settings:\'FILL\' 1;">save</span>';
  }
});

// ── AI Actions ───────────────────────────────────────────────────────────────
async function aiAction(action) {
  const text = document.getElementById('journalBody').value.trim();
  if (!text) { showToast('Write something first!', 'default'); return; }

  const responseEl = document.getElementById('aiResponse');
  responseEl.style.display = 'block';
  responseEl.innerHTML = '<div style="display:flex;align-items:center;gap:0.75rem;color:var(--on-surface-variant);"><span class="spinner" style="border-color:rgba(51,104,93,0.2);border-top-color:var(--primary);"></span> Thinking...</div>';

  try {
    const data = await api.aiReflect(text, action);
    responseEl.innerHTML = `
      <p style="font-size:1rem;line-height:1.7;color:var(--on-surface);margin-bottom:${data.suggestions?.length ? '1rem' : '0'}">${data.summary || data.aiSummary || ''}</p>
      ${data.suggestions?.length ? `
        <div style="border-top:1px solid rgba(169,180,176,0.15);padding-top:1rem;">
          <p class="text-label" style="color:var(--on-surface-variant);margin-bottom:0.75rem;">Suggestions for today:</p>
          <ul style="display:flex;flex-direction:column;gap:0.75rem;list-style:none;">
            ${data.suggestions.map(s => `
              <li style="display:flex;align-items:flex-start;gap:0.75rem;">
                <span class="material-symbols-outlined text-primary" style="margin-top:2px;font-size:1.1rem;">check_circle</span>
                <span style="font-size:0.9rem;line-height:1.6;color:var(--on-surface);">${s}</span>
              </li>`).join('')}
          </ul>
        </div>` : ''}`;
  } catch (e) {
    responseEl.innerHTML = `<p style="color:var(--error);">${e.message}</p>`;
  }
}
window.aiAction = aiAction;

// ── Past entries ─────────────────────────────────────────────────────────────
const colorMap = {
  primary:   { bg: 'rgba(182,238,224,0.3)', text: 'var(--primary)' },
  secondary: { bg: 'rgba(203,230,255,0.3)', text: 'var(--secondary)' },
  tertiary:  { bg: 'rgba(202,249,220,0.3)', text: 'var(--tertiary)' },
};

const icons = ['wb_sunny', 'nightlight', 'cloud', 'partly_cloudy_day', 'brightness_5'];

let pastEntries = [];

async function loadPastEntries() {
  try {
    pastEntries = await api.getJournals();
    renderPast();
  } catch (e) {
    pastEntries = [];
    renderPast();
  }
}

function renderPast() {
  if (pastEntries.length === 0) {
    document.getElementById('pastEntries').innerHTML = `
      <div style="text-align:center;padding:2rem;color:var(--on-surface-variant);">
        <span class="material-symbols-outlined" style="font-size:3rem;opacity:0.3;">auto_stories</span>
        <p style="margin-top:1rem;">No journal entries yet. Start writing!</p>
      </div>`;
    return;
  }
  document.getElementById('pastEntries').innerHTML = pastEntries.map((e, i) => {
    const colors = ['primary', 'secondary', 'tertiary'];
    const c = colorMap[colors[i % colors.length]];
    const icon = icons[i % icons.length];
    const days = getDaysAgo(new Date(e.createdAt));
    return `
      <div class="past-card" style="background:${c.bg};">
        <span class="material-symbols-outlined" style="color:${c.text};margin-bottom:0.75rem;display:block;">${icon}</span>
        <h4 class="headline" style="font-size:1rem;font-weight:700;margin-bottom:0.4rem;">${e.title || 'Untitled'}</h4>
        <p style="font-size:0.8rem;color:var(--on-surface-variant);line-height:1.5;margin-bottom:0.75rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${(e.body || '').slice(0, 80)}...</p>
        <p style="font-size:0.75rem;font-weight:600;color:${c.text};">${days}</p>
      </div>`;
  }).join('');
}

function getDaysAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

loadPastEntries();
