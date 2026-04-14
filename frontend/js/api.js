// Central API client — swap BASE_URL when backend is ready
const API_BASE = 'http://localhost:8080/api';

async function request(method, path, body = null) {
  const token = localStorage.getItem('ms_token');
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  };
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (res.status === 401) {
    localStorage.removeItem('ms_token');
    location.href = 'index.html';
    return;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }
  return res.status === 204 ? null : res.json();
}

const api = {
  // Auth
  login:    (email, password)   => request('POST', '/auth/login',    { email, password }),
  register: (name, email, pass) => request('POST', '/auth/register', { name, email, password: pass }),
  logout:   ()                  => request('POST', '/auth/logout'),

  // Mood
  getMoods:  ()           => request('GET',  '/mood'),
  logMood:   (data)       => request('POST', '/mood', data),
  updateMood:(id, data)   => request('PUT',  `/mood/${id}`, data),

  // Journal
  getJournals:   ()     => request('GET',  '/journal'),
  getJournal:    (id)   => request('GET',  `/journal/${id}`),
  createJournal: (data) => request('POST', '/journal', data),
  updateJournal: (id, data) => request('PUT', `/journal/${id}`, data),
  deleteJournal: (id)   => request('DELETE', `/journal/${id}`),
  aiReflect:     (text, action) => request('POST', '/journal/ai', { text, action }),

  // Forum
  getPosts:    (tag)  => request('GET',  `/forum/posts${tag ? `?tag=${tag}` : ''}`),
  createPost:  (data) => request('POST', '/forum/posts', data),
  supportPost: (id)   => request('POST', `/forum/posts/${id}/support`),
  getReplies:  (id)   => request('GET',  `/forum/posts/${id}/replies`),
  addReply:    (id, text) => request('POST', `/forum/posts/${id}/replies`, { text }),

  // Library
  getResources:   (params) => request('GET', `/library/resources${params ? `?${params}` : ''}`),
  getCategories:  ()       => request('GET', '/library/categories'),
};

// Guard: redirect to login if no token
function requireAuth() {
  if (!localStorage.getItem('ms_token')) {
    sessionStorage.setItem('ms_redirect', window.location.href);
    location.href = 'index.html';
  }
}

window.api = api;
window.requireAuth = requireAuth;
