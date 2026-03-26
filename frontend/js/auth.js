// Redirect if already logged in
if (localStorage.getItem('ms_token')) {
  location.href = 'dashboard.html';
}

// Toggle password visibility
document.getElementById('togglePwd').addEventListener('click', function () {
  const pwd = document.getElementById('password');
  const icon = this.querySelector('.material-symbols-outlined');
  if (pwd.type === 'password') {
    pwd.type = 'text';
    icon.textContent = 'visibility_off';
  } else {
    pwd.type = 'password';
    icon.textContent = 'visibility';
  }
});

// Login form
document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errEl    = document.getElementById('loginError');
  const btn      = document.getElementById('loginBtn');

  errEl.style.display = 'none';
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Logging in...';

  try {
    // ── Swap this block with real API call when backend is ready ──
    // const data = await api.login(email, password);
    // localStorage.setItem('ms_token', data.token);
    // localStorage.setItem('ms_user', JSON.stringify(data.user));

    // Temporary mock — remove when backend is live
    await new Promise(r => setTimeout(r, 800));
    localStorage.setItem('ms_token', 'mock-token');
    localStorage.setItem('ms_user', JSON.stringify({ name: 'Emmanuel', email }));
    // ─────────────────────────────────────────────────────────────

    const redirect = sessionStorage.getItem('ms_redirect');
    sessionStorage.removeItem('ms_redirect');
    location.href = redirect || 'dashboard.html';
  } catch (err) {
    errEl.textContent = err.message || 'Invalid email or password.';
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = 'Login <span class="material-symbols-outlined">arrow_forward</span>';
  }
});

// Google OAuth placeholder
document.getElementById('googleBtn').addEventListener('click', () => {
  // TODO: redirect to Spring Boot OAuth2 endpoint
  // window.location.href = `${API_BASE}/oauth2/authorization/google`;
  showToast('Google login coming soon — backend needed.', 'default');
});
