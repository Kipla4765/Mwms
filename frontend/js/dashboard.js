requireAuth();
initNav('Dashboard Overview');

// Greeting
const user = JSON.parse(localStorage.getItem('ms_user') || '{}');
const hour = new Date().getHours();
const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
document.getElementById('greeting').textContent =
  `Good ${timeOfDay}${user.name ? ', ' + user.name : ''}.`;

// Date
document.getElementById('todayDate').textContent =
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

// ── Mood picker ──────────────────────────────────────────────────────────────
let selectedMood = null;
document.querySelectorAll('.mood-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
    selectedMood = parseInt(this.dataset.value);
    document.getElementById('logMoodBtn').disabled = false;
  });
});

document.getElementById('logMoodBtn').addEventListener('click', async () => {
  if (!selectedMood) return;
  const btn = document.getElementById('logMoodBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>';
  try {
    await api.logMood({ value: selectedMood, date: new Date().toISOString() });
    showToast('Mood logged successfully!', 'success');
    btn.textContent = '✓ Logged';
  } catch (e) {
    showToast(e.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Log today\'s mood';
  }
});

// ── Mood chart ────────────────────────────────────────────────────────────────
async function loadMoodChart() {
  const chart = document.getElementById('moodChart');
  try {
    const moods = await api.getMoods();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentMoods = moods.filter(m => new Date(m.loggedAt) >= weekAgo);
    
    if (recentMoods.length === 0) {
      chart.innerHTML = '<p style="color:var(--on-surface-variant);padding:2rem;text-align:center;">No mood data yet. Log your first mood!</p>';
      document.getElementById('insightText').innerHTML = `<span style="font-weight:700;color:var(--on-surface);">No data yet.</span> Start tracking your mood to see insights.`;
      return;
    }
    
    const values = recentMoods.slice(-7).map(m => m.value);
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
    
    chart.innerHTML = values.map(v => `
      <div class="bar-wrap">
        <div class="bar-track" style="height:7rem;">
          <div class="bar-fill" style="height:${(v / 5) * 100}%;"></div>
        </div>
      </div>`).join('');
    
    document.getElementById('insightText').innerHTML =
      `<span style="font-weight:700;color:var(--on-surface);">Average mood this week: ${avg}/5.</span> Keep journaling — it helps!`;
  } catch (e) {
    chart.innerHTML = '<p style="color:var(--error);padding:2rem;">Failed to load mood data.</p>';
  }
}

// ── Recommended resources ────────────────────────────────────────────────────
async function loadResources() {
  try {
    const resources = await api.getResources();
    const display = resources.slice(0, 3);
    document.getElementById('resourcesGrid').innerHTML = display.map(r => `
      <div class="resource-card" onclick="location.href='library.html'">
        <div style="position:relative;border-radius:var(--radius);overflow:hidden;margin-bottom:0.75rem;">
          <img src="${r.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80'}" alt="${r.title}" style="width:100%;aspect-ratio:16/10;object-fit:cover;display:block;"/>
          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.5),transparent);"></div>
          <span style="position:absolute;bottom:0.75rem;left:0.75rem;font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#fff;background:rgba(255,255,255,0.2);backdrop-filter:blur(8px);padding:0.25rem 0.75rem;border-radius:var(--radius-full);">${r.type || 'Article'}</span>
        </div>
        <h4 class="headline" style="font-size:1rem;font-weight:800;margin-bottom:0.4rem;">${r.title}</h4>
        <p style="font-size:0.8rem;color:var(--on-surface-variant);line-height:1.5;">${r.description || ''}</p>
      </div>`).join('');
  } catch (e) {
    document.getElementById('resourcesGrid').innerHTML = '<p style="color:var(--error);padding:2rem;">Failed to load resources.</p>';
  }
}

loadMoodChart();
loadResources();
