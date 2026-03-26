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
    // await api.createJournal({ title, body, date: new Date().toISOString() });
    await new Promise(r => setTimeout(r, 700)); // mock
    localStorage.removeItem('ms_journal_draft');
    showToast('Entry saved!', 'success');
    // Add to past entries mock
    mockPast.unshift({ icon: 'wb_sunny', color: 'secondary', title: title || 'Untitled', preview: body.slice(0, 80) + '...', time: 'Just now', duration: '' });
    renderPast();
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
    // const data = await api.aiReflect(text, action);
    // Mock response until Gemini backend is wired
    await new Promise(r => setTimeout(r, 1200));
    const mockResponses = {
      reflect: {
        summary: `It seems like you're feeling <strong style="color:var(--primary)">overwhelmed</strong> by the volume of tasks on your plate. This feeling of tightness is a common physical manifestation of stress.`,
        suggestions: [
          'Break your tasks into smaller, micro-steps. Focus only on the first 5 minutes of one task.',
          'Try the 4-7-8 breathing technique right now to release tension.',
          'Permit yourself to leave one non-essential task for tomorrow.',
        ]
      },
      summarize: {
        summary: `Your entry reflects a <strong style="color:var(--primary)">busy, stressful day</strong> with multiple competing priorities. You're aware of your stress response and actively trying to manage it.`,
        suggestions: []
      },
      coping: {
        summary: `Based on your entry, here are some coping strategies that may help:`,
        suggestions: [
          'Practice the 5-4-3-2-1 grounding technique to anchor yourself in the present.',
          'Set a 25-minute Pomodoro timer — work, then rest. Repeat.',
          'Write down your top 3 priorities for tomorrow before bed.',
        ]
      }
    };
    const r = mockResponses[action];
    responseEl.innerHTML = `
      <p style="font-size:1rem;line-height:1.7;color:var(--on-surface);margin-bottom:${r.suggestions.length ? '1rem' : '0'}">${r.summary}</p>
      ${r.suggestions.length ? `
        <div style="border-top:1px solid rgba(169,180,176,0.15);padding-top:1rem;">
          <p class="text-label" style="color:var(--on-surface-variant);margin-bottom:0.75rem;">Suggestions for today:</p>
          <ul style="display:flex;flex-direction:column;gap:0.75rem;list-style:none;">
            ${r.suggestions.map(s => `
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
const mockPast = [
  { icon: 'wb_sunny',  color: 'secondary', title: 'Morning Clarity',  preview: 'The forest walk helped me realize that most of my anxieties are projections of the future...', time: 'Yesterday', duration: '15 min write' },
  { icon: 'nightlight', color: 'tertiary', title: 'Unwinding',         preview: 'Sleep was elusive but the journaling helped me process the day...', time: '2 days ago', duration: '' },
  { icon: 'cloud',      color: 'primary',  title: 'Midweek Check-in',  preview: 'Feeling more grounded today. The breathing exercises are working.', time: '3 days ago', duration: '8 min write' },
];

const colorMap = {
  primary:   { bg: 'rgba(182,238,224,0.3)', text: 'var(--primary)' },
  secondary: { bg: 'rgba(203,230,255,0.3)', text: 'var(--secondary)' },
  tertiary:  { bg: 'rgba(202,249,220,0.3)', text: 'var(--tertiary)' },
};

function renderPast() {
  document.getElementById('pastEntries').innerHTML = mockPast.map(e => {
    const c = colorMap[e.color] || colorMap.primary;
    return `
      <div class="past-card" style="background:${c.bg};">
        <span class="material-symbols-outlined" style="color:${c.text};margin-bottom:0.75rem;display:block;">${e.icon}</span>
        <h4 class="headline" style="font-size:1rem;font-weight:700;margin-bottom:0.4rem;">${e.title}</h4>
        <p style="font-size:0.8rem;color:var(--on-surface-variant);line-height:1.5;margin-bottom:0.75rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${e.preview}</p>
        <p style="font-size:0.75rem;font-weight:600;color:${c.text};">${e.time}${e.duration ? ' • ' + e.duration : ''}</p>
      </div>`;
  }).join('');
}
renderPast();
