requireAuth();
initNav('Mood Tracking');

const EMOJIS = ['', '😞', '😐', '🙂', '😄', '😁'];
const LABELS = ['', 'Awful', 'Meh', 'Good', 'Great', 'Elite'];

let selectedMood = null;
let selectedFactors = new Set();

// ── Mood picker ──────────────────────────────────────────────────────────────
document.querySelectorAll('#moodPicker .mood-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('#moodPicker .mood-btn').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
    selectedMood = parseInt(this.dataset.value);
    document.getElementById('saveMoodBtn').disabled = false;
  });
});

// ── Factor chips ─────────────────────────────────────────────────────────────
document.querySelectorAll('#factorChips .chip').forEach(chip => {
  chip.addEventListener('click', function () {
    const f = this.dataset.factor;
    if (selectedFactors.has(f)) {
      selectedFactors.delete(f);
      this.classList.remove('active');
    } else {
      selectedFactors.add(f);
      this.classList.add('active');
    }
  });
});

// ── Save / Update mood ────────────────────────────────────────────────────────
document.getElementById('saveMoodBtn').addEventListener('click', async () => {
  if (!selectedMood) return;
  const btn    = document.getElementById('saveMoodBtn');
  const editId = btn.dataset.editId ? parseInt(btn.dataset.editId) : null;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>';

  const payload = {
    value:   selectedMood,
    factors: [...selectedFactors],
    note:    document.getElementById('moodNote').value.trim(),
  };

  try {
    if (editId) {
      await api.updateMood(editId, payload);
      showToast('Mood updated!', 'success');
    } else {
      await api.logMood(payload);
      showToast('Mood saved!', 'success');
    }
    // loadEntries calls checkTodayMood which re-populates everything correctly
    await loadEntries();
  } catch (e) {
    showToast(e.message, 'error');
    btn.disabled = false;
    btn.textContent = editId ? 'Update Today\'s Mood' : 'Save Entry';
  }
});

// ── Chart ────────────────────────────────────────────────────────────────────
let allMoodEntries = [];

function buildChartData(entries, days) {
  // Build a map of date-string -> last mood value that day
  const map = {};
  entries.forEach(e => {
    const d = new Date(e.loggedAt).toDateString();
    map[d] = e.value;
  });

  const values = [];
  const labels = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    values.push(map[d.toDateString()] || 0);
    if (days === 7) {
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    } else {
      labels.push(i % 5 === 0 ? d.getDate() : '');
    }
  }
  return { values, labels };
}

function renderChart(data) {
  const chart  = document.getElementById('analyticsChart');
  const labels = document.getElementById('chartLabels');
  chart.innerHTML = data.values.map(v => `
    <div class="bar-col">
      <div class="bar-outer" style="height:7rem;">
        <div class="bar-inner" style="height:${v ? (v/5)*100 : 0}%;opacity:${v ? 1 : 0.15};"></div>
        <div class="bar-emoji">${v ? EMOJIS[v] : ''}</div>
      </div>
    </div>`).join('');
  labels.innerHTML = data.labels.map(l =>
    `<span style="font-size:0.6rem;font-weight:700;color:var(--outline-variant);text-transform:uppercase;">${l}</span>`
  ).join('');
}

function switchTab(tab) {
  document.getElementById('tabWeekly').classList.toggle('active', tab === 'weekly');
  document.getElementById('tabMonthly').classList.toggle('active', tab === 'monthly');
  if (tab === 'weekly') {
    renderChart(buildChartData(allMoodEntries, 7));
    document.getElementById('chartRange').textContent = 'This week';
  } else {
    renderChart(buildChartData(allMoodEntries, 30));
    document.getElementById('chartRange').textContent = 'This month';
  }
}
window.switchTab = switchTab;

// ── Entries list ─────────────────────────────────────────────────────────────
let entries = [];

async function loadEntries() {
  try {
    entries = await api.getMoods();
    allMoodEntries = entries;
    checkTodayMood();
    renderEntries();
    switchTab('weekly');
  } catch (e) {
    entries = [];
    allMoodEntries = [];
    document.getElementById('entriesList').innerHTML =
      `<div style="text-align:center;padding:2rem;color:var(--on-surface-variant);">
        <p>Could not load entries. Please refresh.</p>
      </div>`;
    switchTab('weekly');
  }
}

// ── Today mood guard ──────────────────────────────────────────────────────────
function getTodayEntry() {
  const today = new Date().toDateString();
  return entries.find(e => new Date(e.loggedAt).toDateString() === today) || null;
}

function checkTodayMood() {
  const todayEntry = getTodayEntry();
  const saveMoodBtn = document.getElementById('saveMoodBtn');
  const todayBanner = document.getElementById('todayMoodBanner');

  if (todayEntry) {
    document.querySelectorAll('#moodPicker .mood-btn').forEach(b => {
      b.classList.toggle('selected', parseInt(b.dataset.value) === todayEntry.value);
    });
    selectedMood = todayEntry.value;

    selectedFactors = new Set(todayEntry.factors || []);
    document.querySelectorAll('#factorChips .chip').forEach(c => {
      c.classList.toggle('active', selectedFactors.has(c.dataset.factor));
    });

    document.getElementById('moodNote').value = todayEntry.note || '';

    saveMoodBtn.disabled = false;
    saveMoodBtn.textContent = "Update Today's Mood";
    saveMoodBtn.dataset.editId = todayEntry.id;

    if (todayBanner) {
      todayBanner.style.display = 'flex';
      todayBanner.querySelector('#todayMoodEmoji').textContent = EMOJIS[todayEntry.value];
      todayBanner.querySelector('#todayMoodLabel').textContent =
        `You logged ${LABELS[todayEntry.value]} today — you can update it below.`;
    }
  } else {
    saveMoodBtn.disabled = true;
    saveMoodBtn.textContent = 'Save Entry';
    delete saveMoodBtn.dataset.editId;
    if (todayBanner) todayBanner.style.display = 'none';
  }

  // Compute a real insight from entries
  const insightEl = document.getElementById('insightCard');
  if (insightEl && entries.length >= 3) {
    const avg = (entries.slice(0, 7).reduce((s, e) => s + e.value, 0) / Math.min(entries.length, 7)).toFixed(1);
    const best = entries.reduce((a, b) => a.value > b.value ? a : b);
    const bestFactors = (best.factors || []);
    if (bestFactors.length) {
      insightEl.textContent = `Your best mood (${LABELS[best.value]}) was linked to: ${bestFactors.join(', ')}.`;
    } else {
      insightEl.textContent = `Your average mood this week is ${avg}/5. Keep checking in!`;
    }
  } else if (insightEl && entries.length > 0) {
    insightEl.textContent = `You've logged ${entries.length} mood${entries.length > 1 ? 's' : ''} so far. Keep it up!`;
  } else if (insightEl) {
    insightEl.textContent = 'Log your first mood to start seeing insights.';
  }
}

function renderEntries() {
  if (entries.length === 0) {
    document.getElementById('entriesList').innerHTML = `
      <div style="text-align:center;padding:2rem;color:var(--on-surface-variant);">
        <span class="material-symbols-outlined" style="font-size:3rem;opacity:0.3;">mood</span>
        <p style="margin-top:1rem;">No mood entries yet. Log your first mood!</p>
      </div>`;
    return;
  }
  document.getElementById('entriesList').innerHTML = entries.map(e => {
    const emoji = EMOJIS[e.value] || '';
    const label = LABELS[e.value] || '';
    const isToday = new Date(e.loggedAt).toDateString() === new Date().toDateString();
    const date = new Date(e.loggedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
                 (isToday ? ', Today' : '');
    const factors = (e.factors || []).join(', ');
    return `
    <div class="entry-row" onclick="openMoodEntry(${e.id})">
      <div class="entry-emoji">${emoji}</div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;">
          <h4 class="headline" style="font-size:0.95rem;font-weight:700;">${label} day</h4>
          <span style="font-size:0.7rem;color:var(--outline);white-space:nowrap;">${date}</span>
        </div>
        <p style="font-size:0.8rem;color:var(--on-surface-variant);margin-top:0.2rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          ${factors ? factors : (e.note || 'No notes added.')}
        </p>
      </div>
      <span class="material-symbols-outlined" style="color:var(--outline);font-size:1.25rem;">chevron_right</span>
    </div>`;
  }).join('');
}

// ── Mood entry detail modal ───────────────────────────────────────────────────
let viewingMoodEntry = null;

function openMoodEntry(id) {
  const e = entries.find(x => x.id === id);
  if (!e) return;
  viewingMoodEntry = e;

  const isToday = new Date(e.loggedAt).toDateString() === new Date().toDateString();
  const factors  = (e.factors || []).join(' · ') || 'None';
  const dateStr  = new Date(e.loggedAt).toLocaleDateString('en-US',
    { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  document.getElementById('moodDetailEmoji').textContent  = EMOJIS[e.value];
  document.getElementById('moodDetailLabel').textContent  = LABELS[e.value] + ' day';
  document.getElementById('moodDetailDate').textContent   = dateStr;
  document.getElementById('moodDetailNote').textContent   = e.note || 'No notes added.';
  document.getElementById('moodDetailFactors').textContent = factors;

  // Only show edit button for today's entry
  document.getElementById('editMoodBtn').style.display = isToday ? 'inline-flex' : 'none';

  document.getElementById('moodDetailModal').style.display = 'flex';
}
window.openMoodEntry = openMoodEntry;

function closeMoodDetail() {
  document.getElementById('moodDetailModal').style.display = 'none';
  viewingMoodEntry = null;
}
window.closeMoodDetail = closeMoodDetail;

function editMoodFromModal() {
  closeMoodDetail();
  // scroll to logger — checkTodayMood already pre-filled it
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('Update your mood below and save.', 'default');
}
window.editMoodFromModal = editMoodFromModal;

document.getElementById('moodDetailModal').addEventListener('click', function(ev) {
  if (ev.target === this) closeMoodDetail();
});

loadEntries();
