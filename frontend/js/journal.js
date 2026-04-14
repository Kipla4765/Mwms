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
  const title  = document.getElementById('journalTitle').value.trim();
  const body   = document.getElementById('journalBody').value.trim();
  if (!title && !body) { showToast('Nothing to save yet.', 'default'); return; }

  const fab    = document.getElementById('saveFab');
  const editId = fab.dataset.editId ? parseInt(fab.dataset.editId) : null;
  fab.innerHTML = '<span class="spinner" style="border-color:rgba(255,255,255,0.3);border-top-color:#fff;"></span>';

  try {
    if (editId) {
      await api.updateJournal(editId, { title, body });
      delete fab.dataset.editId;
      showToast('Entry updated!', 'success');
    } else {
      await api.createJournal({ title, body });
      localStorage.removeItem('ms_journal_draft');
      showToast('Entry saved!', 'success');
    }
    document.getElementById('journalTitle').value = '';
    document.getElementById('journalBody').value  = '';
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
    const reflection = data.reflection || '';
    responseEl.innerHTML = marked.parse(reflection);
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
      <div class="past-card" style="background:${c.bg};cursor:pointer;" onclick="openEntry(${e.id})">
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

// ── Entry viewer modal ────────────────────────────────────────────────────────
let viewingEntry = null;

function openEntry(id) {
  const e = pastEntries.find(x => x.id === id);
  if (!e) return;
  viewingEntry = e;

  document.getElementById('viewEntryTitle').textContent = e.title || 'Untitled';
  document.getElementById('viewEntryDate').textContent  =
    new Date(e.createdAt).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  document.getElementById('viewEntryBody').textContent  = e.body || '';

  const aiSection = document.getElementById('viewEntryAi');
  if (e.aiResponse) {
    aiSection.style.display = 'block';
    document.getElementById('viewEntryAiAction').textContent =
      e.aiAction ? e.aiAction.charAt(0).toUpperCase() + e.aiAction.slice(1) : 'AI Reflection';
    document.getElementById('viewEntryAiBody').innerHTML = marked.parse(e.aiResponse);
  } else {
    aiSection.style.display = 'none';
  }

  document.getElementById('entryViewModal').style.display = 'flex';
}
window.openEntry = openEntry;

function closeEntry() {
  document.getElementById('entryViewModal').style.display = 'none';
  viewingEntry = null;
}
window.closeEntry = closeEntry;

function editEntry() {
  if (!viewingEntry) return;
  document.getElementById('journalTitle').value = viewingEntry.title || '';
  document.getElementById('journalBody').value  = viewingEntry.body  || '';
  document.getElementById('saveFab').dataset.editId = viewingEntry.id;
  closeEntry();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('Editing — save when done.', 'default');
}
window.editEntry = editEntry;

async function deleteEntry() {
  if (!viewingEntry) return;
  if (!confirm('Delete "' + (viewingEntry.title || 'this entry') + '"? This cannot be undone.')) return;
  try {
    await api.deleteJournal(viewingEntry.id);
    closeEntry();
    await loadPastEntries();
    showToast('Entry deleted.', 'default');
  } catch (err) {
    showToast(err.message, 'error');
  }
}
window.deleteEntry = deleteEntry;

document.getElementById('entryViewModal').addEventListener('click', function(ev) {
  if (ev.target === this) closeEntry();
});

loadPastEntries();
