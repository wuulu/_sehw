const app = document.getElementById('app');
const modalRoot = document.getElementById('modal-root');
const toastRoot = document.getElementById('toast-root');

const ROLE_LABEL = { admin: '管理員', teacher: '教授', student: '學生' };
const STATUS_LABEL = { present: '出席', absent: '缺席', late: '遲到', leave: '請假' };

const MENUS = {
  admin: [
    { id: 'dashboard', label: '總覽', icon: 'dashboard' },
    { id: 'users', label: '使用者管理', icon: 'users' },
    { id: 'classes', label: '班級管理', icon: 'classes' },
    { id: 'courses', label: '課程管理', icon: 'courses' },
    { id: 'grades', label: '成績管理', icon: 'grades' },
    { id: 'attendance', label: '出缺席', icon: 'attendance' },
    { id: 'announcements', label: '公告', icon: 'announcements' },
    { id: 'profile', label: '個人資料', icon: 'profile' },
  ],
  teacher: [
    { id: 'dashboard', label: '總覽', icon: 'dashboard' },
    { id: 'courses', label: '我的課程', icon: 'courses' },
    { id: 'grades', label: '成績登錄', icon: 'grades' },
    { id: 'attendance', label: '出缺席', icon: 'attendance' },
    { id: 'announcements', label: '公告', icon: 'announcements' },
    { id: 'profile', label: '個人資料', icon: 'profile' },
  ],
  student: [
    { id: 'dashboard', label: '總覽', icon: 'dashboard' },
    { id: 'courses', label: '我的課程', icon: 'courses' },
    { id: 'enrollment', label: '加退選', icon: 'enrollment' },
    { id: 'grades', label: '我的成績', icon: 'grades' },
    { id: 'attendance', label: '我的出缺席', icon: 'attendance' },
    { id: 'announcements', label: '公告', icon: 'announcements' },
    { id: 'profile', label: '個人資料', icon: 'profile' },
  ],
};

const state = {
  token: localStorage.getItem('sms_token') || '',
  data: null,
  backend: null,
  route: 'dashboard',
  ui: {
    userSearch: '',
    userRole: 'all',
    gradeCourse: '',
    attCourse: '',
    attDate: '',
    sidebarOpen: false,
  },
};

const ICONS = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  classes: '<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/>',
  courses: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  enrollment: '<path d="M4 7h13"/><path d="m14 4 3 3-3 3"/><path d="M20 17H7"/><path d="m10 14-3 3 3 3"/>',
  grades: '<path d="M3 3v18h18"/><rect x="7" y="10" width="3" height="7"/><rect x="12" y="6" width="3" height="11"/><rect x="17" y="13" width="3" height="4"/>',
  attendance: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/>',
  announcements: '<path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
};

function icon(name, size = 20) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function fmtDate(value) {
  if (!value) return '—';
  const parts = String(value).slice(0, 10).split('-');
  if (parts.length !== 3) return esc(value);
  return `${parts[0]}/${parts[1]}/${parts[2]}`;
}

function fmtDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return esc(value);
  const display = new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(date);
  return display;
}

function todayLabel() {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  }).format(new Date());
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return '早安';
  if (hour < 18) return '午安';
  return '晚安';
}

function avgPercent(list) {
  if (!list || !list.length) return null;
  const sum = list.reduce((acc, g) => acc + (Number(g.score) / Math.max(1, Number(g.maxScore) || 100)), 0);
  return Math.round((sum / list.length) * 1000) / 10;
}

function attendanceRate(list) {
  if (!list || !list.length) return null;
  const attended = list.filter((a) => a.status === 'present' || a.status === 'late').length;
  return Math.round((attended / list.length) * 100);
}

function roleBadge(role) {
  return `<span class="badge role-${role}">${ROLE_LABEL[role] || role}</span>`;
}

function statusBadge(status) {
  return `<span class="badge status-${status}">${STATUS_LABEL[status] || status}</span>`;
}

function field(label, name, input, hint = '') {
  return `<label class="field"><span>${esc(label)}</span>${input}${hint ? `<small>${esc(hint)}</small>` : ''}</label>`;
}

function emptyState(title, desc, iconName = 'courses') {
  return `<div class="empty">${icon(iconName, 36)}<h3>${esc(title)}</h3><p>${esc(desc)}</p></div>`;
}

const api = {
  async request(path, { method = 'GET', body } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (state.token) headers.Authorization = `Bearer ${state.token}`;
    let res;
    try {
      res = await fetch(path, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch {
      state.backend = false;
      throw new Error('無法連線到後端 API。請先執行 npm start，並使用 http://localhost:3000 開啟系統（不要使用 Live Server 或直接開啟檔案）。');
    }
    state.backend = true;
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    if (!res.ok) {
      if (res.status === 401 && state.data) logoutLocal();
      throw new Error(data?.error || '操作失敗，請稍後再試');
    }
    return data;
  },
  get(path) { return this.request(path); },
  post(path, body) { return this.request(path, { method: 'POST', body: body ?? {} }); },
  put(path, body) { return this.request(path, { method: 'PUT', body: body ?? {} }); },
  del(path) { return this.request(path, { method: 'DELETE' }); },
};

function toast(message, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  toastRoot.appendChild(el);
  setTimeout(() => {
    el.classList.add('hide');
    setTimeout(() => el.remove(), 220);
  }, 2600);
}

function openModal({ title, body, submitText = '儲存', onSubmit, danger = false }) {
  modalRoot.innerHTML = `
    <div class="modal-overlay">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-head">
          <h3>${esc(title)}</h3>
          <button type="button" class="icon-btn modal-close" aria-label="關閉">${icon('close', 18)}</button>
        </div>
        <form class="modal-form">
          <div class="modal-body">${body}</div>
          <div class="modal-foot">
            <button type="button" class="btn ghost modal-cancel">取消</button>
            <button type="submit" class="btn ${danger ? 'danger' : 'primary'}">${esc(submitText)}</button>
          </div>
        </form>
      </div>
    </div>`;

  const overlay = modalRoot.querySelector('.modal-overlay');
  const form = modalRoot.querySelector('form');
  let closed = false;

  const close = () => {
    if (closed) return;
    closed = true;
    modalRoot.innerHTML = '';
    document.removeEventListener('keydown', onKey);
  };
  const onKey = (event) => {
    if (event.key === 'Escape') close();
  };

  overlay.addEventListener('mousedown', (event) => {
    if (event.target === overlay) close();
  });
  modalRoot.querySelector('.modal-close').addEventListener('click', close);
  modalRoot.querySelector('.modal-cancel').addEventListener('click', close);
  document.addEventListener('keydown', onKey);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      const result = await onSubmit(new FormData(form));
      if (result !== false) close();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      button.disabled = false;
    }
  });

  setTimeout(() => {
    const first = form.querySelector('input:not([type="hidden"]), select, textarea');
    first?.focus();
  }, 60);

  return { form, close };
}

function confirmAction({ title, message, confirmText = '確定刪除', onConfirm }) {
  openModal({
    title,
    body: `<p class="confirm-text">${esc(message)}</p>`,
    submitText: confirmText,
    danger: true,
    onSubmit: async () => {
      await onConfirm();
    },
  });
}

function logoutLocal() {
  state.token = '';
  state.data = null;
  localStorage.removeItem('sms_token');
  render();
}

async function refresh() {
  state.data = await api.get('/api/bootstrap');
  render();
}

function render() {
  if (!state.data) renderLogin();
  else renderShell();
}

/* ---------- Login ---------- */
function renderLogin() {
  app.innerHTML = `
    <div class="login-page">
      <div class="login-brand">
        <div class="logo-mark">學</div>
        <h1>大學校務系統</h1>
        <p>整合教授、學生與行政人員的大學校園資訊平台，讓課程、成績與出缺席管理更輕鬆。</p>
        <ul class="feature-list">
          <li><span class="dot">${icon('check', 14)}</span>教授線上登錄成績與出缺席</li>
          <li><span class="dot">${icon('check', 14)}</span>學生即時查詢個人學習紀錄</li>
          <li><span class="dot">${icon('check', 14)}</span>管理員集中維護帳號與課程</li>
        </ul>
        <div class="brand-foot">CAMPUS CONSOLE · 2026</div>
      </div>
      <div class="login-panel">
        <form class="login-card" id="login-form">
          ${state.backend === false ? `<div class="backend-warning">目前無法連線到後端。請執行 <code>npm start</code>，並以 <a href="http://localhost:3000">http://localhost:3000</a> 開啟系統，不要使用 Live Server 或直接開啟 HTML 檔。</div>` : ''}
          <h2>歡迎回來</h2>
          <p class="muted">請使用您的校園帳號登入系統</p>
          ${field('帳號', 'username', '<input class="input" name="username" autocomplete="username" required placeholder="例如：admin">')}
          ${field('密碼', 'password', '<input class="input" name="password" type="password" autocomplete="current-password" required placeholder="請輸入密碼">')}
          <p class="form-error" id="login-error"></p>
          <button class="btn primary block" type="submit">登入系統</button>
          <div class="demo-hint">
            <span>快速登入展示帳號</span>
            <div class="demo-chips">
              <button type="button" class="demo-chip" data-user="admin" data-pass="admin123">管理員</button>
              <button type="button" class="demo-chip" data-user="teacher1" data-pass="teach123">教授</button>
              <button type="button" class="demo-chip" data-user="student1" data-pass="student123">學生</button>
            </div>
            <div class="demo-accounts">
              <span><b>管理員</b><code>admin</code> / <code>admin123</code></span>
              <span><b>教授</b><code>teacher1</code> / <code>teach123</code></span>
              <span><b>學生</b><code>student1</code> / <code>student123</code></span>
            </div>
            <p class="login-help">帳號仍無法登入？請確認伺服器已啟動，或執行 <code>npm run reset</code> 重設示範資料。</p>
          </div>
        </form>
      </div>
    </div>`;

  const form = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');

  app.querySelectorAll('.demo-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      form.username.value = chip.dataset.user;
      form.password.value = chip.dataset.pass;
      errorEl.textContent = '';
      form.password.focus();
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorEl.textContent = '';
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      const result = await api.post('/api/login', {
        username: form.username.value.trim(),
        password: form.password.value,
      });
      state.token = result.token;
      localStorage.setItem('sms_token', result.token);
      state.data = await api.get('/api/bootstrap');
      state.route = 'dashboard';
      render();
    } catch (err) {
      errorEl.textContent = err.message;
    } finally {
      button.disabled = false;
    }
  });
}

/* ---------- Shell ---------- */
function renderShell() {
  const user = state.data.user;
  const menu = MENUS[user.role] || [];
  if (!menu.some((item) => item.id === state.route)) state.route = 'dashboard';
  const current = menu.find((item) => item.id === state.route) || menu[0];
  const initial = user.name.slice(0, 1);
  const subtitle = user.role === 'student'
    ? (state.data.classes.find((c) => c.id === user.classId)?.name || '未分班')
    : (user.subject || ROLE_LABEL[user.role]);

  app.innerHTML = `
    <div class="layout">
      <div class="sidebar-backdrop ${state.ui.sidebarOpen ? 'show' : ''}" id="sidebar-backdrop"></div>
      <aside class="sidebar ${state.ui.sidebarOpen ? 'open' : ''}">
        <div class="brand">
          <div class="brand-mark">學</div>
          <div><strong>大學校務</strong><span>Campus Console</span></div>
        </div>
        <nav class="nav">
          ${menu.map((item) => `
            <button class="nav-item ${state.route === item.id ? 'active' : ''}" data-route="${item.id}">
              ${icon(item.icon, 19)}<span>${item.label}</span>
            </button>`).join('')}
        </nav>
        <div class="sidebar-foot">
          <div class="mini-user">
            <div class="avatar">${esc(initial)}</div>
            <div><strong>${esc(user.name)}</strong><span>${ROLE_LABEL[user.role]}</span></div>
          </div>
          <button class="nav-item logout" id="logout">${icon('logout', 19)}<span>登出</span></button>
        </div>
      </aside>
      <div class="main">
        <header class="topbar">
          <button class="icon-btn menu-toggle" id="menu-toggle" aria-label="開啟選單">${icon('menu', 20)}</button>
          <div class="topbar-title">
            <h1>${current.label}</h1>
            <span>${todayLabel()}</span>
          </div>
          <div class="topbar-user">
            <div class="avatar sm">${esc(initial)}</div>
            <div class="topbar-name"><strong>${esc(user.name)}</strong><span>${esc(subtitle)}</span></div>
          </div>
        </header>
        <main class="content" id="view"></main>
      </div>
    </div>`;

  app.querySelectorAll('[data-route]').forEach((button) => {
    button.addEventListener('click', () => {
      state.route = button.dataset.route;
      state.ui.sidebarOpen = false;
      render();
    });
  });

  document.getElementById('logout').addEventListener('click', async () => {
    try {
      await api.post('/api/logout');
    } catch {
      /* ignore */
    }
    logoutLocal();
  });

  document.getElementById('menu-toggle').addEventListener('click', () => {
    state.ui.sidebarOpen = !state.ui.sidebarOpen;
    render();
  });

  document.getElementById('sidebar-backdrop').addEventListener('click', () => {
    state.ui.sidebarOpen = false;
    render();
  });

  renderView();
}

const VIEWS = {
  dashboard: renderDashboard,
  users: renderUsers,
  classes: renderClasses,
  courses: renderCourses,
  enrollment: renderEnrollment,
  grades: renderGrades,
  attendance: renderAttendance,
  announcements: renderAnnouncements,
  profile: renderProfile,
};

function renderView() {
  const view = document.getElementById('view');
  const renderer = VIEWS[state.route];
  if (renderer) renderer(view);
}

/* ---------- Dashboard ---------- */
function renderDashboard(view) {
  const d = state.data;
  const user = d.user;
  const isAdmin = user.role === 'admin';
  const isTeacher = user.role === 'teacher';

  let stats = [];
  if (isAdmin) {
    stats = [
      [d.users.filter((u) => u.role === 'student').length, '學生人數', 'users'],
      [d.users.filter((u) => u.role === 'teacher').length, '教授人數', 'profile'],
      [d.courses.length, '開設課程', 'courses'],
      [d.classes.length, '班級數', 'classes'],
    ];
  } else if (isTeacher) {
    const studentIds = new Set(d.users.filter((u) => u.role === 'student').map((u) => u.id));
    stats = [
      [d.courses.length, '授課課程', 'courses'],
      [studentIds.size, '授課學生', 'users'],
      [d.grades.length, '已登錄成績', 'grades'],
      [d.announcements.length, '系統公告', 'announcements'],
    ];
  } else {
    const avg = avgPercent(d.grades);
    const rate = attendanceRate(d.attendance);
    stats = [
      [d.courses.length, '修課數', 'courses'],
      [avg === null ? '—' : `${avg}%`, '平均成績', 'grades'],
      [rate === null ? '—' : `${rate}%`, '出缺席率', 'attendance'],
      [d.announcements.length, '最新公告', 'announcements'],
    ];
  }

  const courses = d.courses.slice(0, 5);
  const announcements = d.announcements.slice(0, 4);
  const heroText = isAdmin
    ? '今天的校務運作一切正常，以下是目前的整體概況。'
    : isTeacher
      ? '以下是您的授課班級與最新校園訊息。'
      : '以下是您的修課、成績與校園公告摘要。';

  view.innerHTML = `
    <section class="hero">
      <div>
        <p class="hero-kicker">${greeting()}，${ROLE_LABEL[user.role]}</p>
        <h2>${esc(user.name)}，歡迎回來</h2>
        <p>${heroText}</p>
      </div>
      <div class="hero-date">${icon('attendance', 18)} ${todayLabel()}</div>
    </section>

    <div class="stat-grid">
      ${stats.map(([value, label, iconName]) => `
        <div class="stat-card">
          <div class="stat-icon">${icon(iconName, 22)}</div>
          <div><span>${label}</span><strong>${value}</strong></div>
        </div>`).join('')}
    </div>

    <div class="dashboard-grid">
      <section class="card">
        <div class="card-head">
          <div><h2>${isStudent(user) ? '我的課程' : '課程列表'}</h2><p class="muted">${isStudent(user) ? '本學期修習的課程' : '近期開設的課程'}</p></div>
          <button class="btn ghost sm" data-go="courses">查看全部</button>
        </div>
        ${courses.length ? `<div class="mini-list">
          ${courses.map((course) => `
            <div class="mini-item">
              <div class="mini-badge">${esc(course.name.slice(0, 1))}</div>
              <div class="mini-body">
                <strong>${esc(course.name)}</strong>
                <span>${esc(course.className)} · ${esc(course.schedule || '未排課')}</span>
              </div>
              <span class="mini-meta">${esc(course.teacherName)}</span>
            </div>`).join('')}
        </div>` : emptyState('尚無課程資料', '目前沒有可顯示的課程', 'courses')}
      </section>

      <section class="card">
        <div class="card-head">
          <div><h2>最新公告</h2><p class="muted">校園訊息即時掌握</p></div>
          <button class="btn ghost sm" data-go="announcements">查看全部</button>
        </div>
        ${announcements.length ? announcements.map((a) => `
          <div class="announce-mini">
            <strong>${esc(a.title)}</strong>
            <p>${esc(String(a.content).slice(0, 70))}${String(a.content).length > 70 ? '…' : ''}</p>
            <span>${esc(a.authorName)} · ${fmtDate(a.createdAt)}</span>
          </div>`).join('') : emptyState('目前沒有公告', '發布公告後會顯示在這裡', 'announcements')}
      </section>
    </div>`;

  view.querySelectorAll('[data-go]').forEach((button) => {
    button.addEventListener('click', () => {
      state.route = button.dataset.go;
      render();
    });
  });
}

function isStudent(user) {
  return user.role === 'student';
}

function enrolledStudentList(courseId) {
  const ids = new Set(
    (state.data.enrollments || [])
      .filter((e) => e.courseId === courseId)
      .map((e) => e.studentId)
  );
  return state.data.users.filter((u) => u.role === 'student' && ids.has(u.id));
}

function enrolledCount(courseId) {
  return (state.data.enrollments || []).filter((e) => e.courseId === courseId).length;
}

/* ---------- Users ---------- */
function renderUsers(view) {
  const { users, user } = state.data;
  const keyword = (state.ui.userSearch || '').trim().toLowerCase();
  const roleFilter = state.ui.userRole || 'all';
  const list = users.filter((item) => {
    const matchRole = roleFilter === 'all' || item.role === roleFilter;
    const matchKeyword = !keyword
      || item.name.toLowerCase().includes(keyword)
      || item.username.toLowerCase().includes(keyword);
    return matchRole && matchKeyword;
  });

  view.innerHTML = `
    <section class="card">
      <div class="card-head">
        <div><h2>使用者管理</h2><p class="muted">共 ${users.length} 位使用者</p></div>
        <button class="btn primary" id="add-user">${icon('plus', 18)}新增使用者</button>
      </div>
      <div class="toolbar">
        <div class="search-box">
          ${icon('search', 18)}
          <input id="user-search" placeholder="搜尋姓名或帳號" value="${esc(state.ui.userSearch)}">
        </div>
        <select class="input compact" id="user-role-filter">
          <option value="all" ${roleFilter === 'all' ? 'selected' : ''}>全部角色</option>
          <option value="admin" ${roleFilter === 'admin' ? 'selected' : ''}>管理員</option>
          <option value="teacher" ${roleFilter === 'teacher' ? 'selected' : ''}>教授</option>
          <option value="student" ${roleFilter === 'student' ? 'selected' : ''}>學生</option>
        </select>
      </div>
      ${list.length ? `
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>姓名</th><th>帳號</th><th>角色</th><th>班級 / 專長</th><th>Email</th><th class="right">操作</th></tr>
            </thead>
            <tbody>
              ${list.map((item) => {
                const info = item.role === 'student'
                  ? (state.data.classes.find((c) => c.id === item.classId)?.name || '未分班')
                  : (item.subject || '—');
                return `<tr>
                  <td><div class="person"><div class="avatar sm">${esc(item.name.slice(0, 1))}</div><strong>${esc(item.name)}</strong></div></td>
                  <td><span class="mono">${esc(item.username)}</span></td>
                  <td>${roleBadge(item.role)}</td>
                  <td>${esc(info)}</td>
                  <td class="muted">${esc(item.email || '—')}</td>
                  <td class="right">
                    <div class="row-actions">
                      <button class="icon-btn" data-edit="${item.id}" title="編輯">${icon('edit', 17)}</button>
                      <button class="icon-btn danger" data-del="${item.id}" title="刪除" ${item.id === user.id ? 'disabled' : ''}>${icon('trash', 17)}</button>
                    </div>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>` : emptyState('找不到使用者', '請調整搜尋關鍵字或角色篩選', 'users')}
    </section>`;

  document.getElementById('add-user').addEventListener('click', () => openUserModal());

  const search = document.getElementById('user-search');
  search.addEventListener('input', () => {
    state.ui.userSearch = search.value;
    const cursor = search.selectionStart;
    renderUsers(view);
    const next = document.getElementById('user-search');
    next.focus();
    next.setSelectionRange(cursor, cursor);
  });

  document.getElementById('user-role-filter').addEventListener('change', (event) => {
    state.ui.userRole = event.target.value;
    renderUsers(view);
  });

  view.querySelectorAll('[data-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = users.find((item) => item.id === button.dataset.edit);
      if (target) openUserModal(target);
    });
  });

  view.querySelectorAll('[data-del]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = users.find((item) => item.id === button.dataset.del);
      if (!target) return;
      confirmAction({
        title: '刪除使用者',
        message: `確定要刪除「${target.name}」嗎？相關成績與出缺席紀錄也會一併移除。`,
        onConfirm: async () => {
          await api.del(`/api/users/${target.id}`);
          await refresh();
          toast('使用者已刪除', 'success');
        },
      });
    });
  });
}

function openUserModal(target) {
  const isEdit = Boolean(target);
  const role = target?.role || 'student';
  const classes = state.data.classes;
  const body = `
    <div class="form-grid">
      ${field('姓名', 'name', `<input class="input" name="name" required value="${esc(target?.name || '')}">`)}
      ${field('帳號', 'username', `<input class="input" name="username" required value="${esc(target?.username || '')}">`)}
      ${field('密碼', 'password', `<input class="input" name="password" type="password" ${isEdit ? '' : 'required'} placeholder="${isEdit ? '留空表示不變更' : '至少 6 個字元'}">`)}
      ${field('角色', 'role', `<select class="input" name="role" id="user-role">
        <option value="student" ${role === 'student' ? 'selected' : ''}>學生</option>
        <option value="teacher" ${role === 'teacher' ? 'selected' : ''}>教授</option>
        <option value="admin" ${role === 'admin' ? 'selected' : ''}>管理員</option>
      </select>`)}
    </div>
    <div class="form-grid">
      ${field('班級（學生適用）', 'classId', `<select class="input" name="classId" id="user-class">
        ${classes.map((c) => `<option value="${c.id}" ${target?.classId === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
      </select>`)}
      ${field('系所 / 專長（教授適用）', 'subject', `<input class="input" name="subject" value="${esc(target?.subject || '')}" placeholder="例：資訊工程學系">`)}
    </div>
    ${field('Email', 'email', `<input class="input" name="email" type="email" value="${esc(target?.email || '')}">`)}
  `;

  const { form } = openModal({
    title: isEdit ? '編輯使用者' : '新增使用者',
    body,
    submitText: isEdit ? '儲存變更' : '建立帳號',
    onSubmit: async (formData) => {
      const payload = Object.fromEntries(formData.entries());
      if (!payload.password) delete payload.password;
      if (isEdit) await api.put(`/api/users/${target.id}`, payload);
      else await api.post('/api/users', payload);
      await refresh();
      toast(isEdit ? '使用者已更新' : '使用者已建立', 'success');
    },
  });

  const roleSelect = form.querySelector('#user-role');
  const classField = form.querySelector('#user-class')?.closest('.field');
  const subjectField = form.querySelector('[name="subject"]')?.closest('.field');
  const sync = () => {
    if (classField) classField.hidden = roleSelect.value !== 'student';
    if (subjectField) subjectField.hidden = roleSelect.value !== 'teacher';
  };
  roleSelect.addEventListener('change', sync);
  sync();
}

/* ---------- Classes ---------- */
function renderClasses(view) {
  const classes = state.data.classes;

  view.innerHTML = `
    <section class="card">
      <div class="card-head">
        <div><h2>班級管理</h2><p class="muted">共 ${classes.length} 個班級</p></div>
        <button class="btn primary" id="add-class">${icon('plus', 18)}新增班級</button>
      </div>
      ${classes.length ? `
        <div class="class-grid">
          ${classes.map((cls) => `
            <div class="class-card">
              <div class="class-top">
                <div class="class-icon">${icon('classes', 22)}</div>
                <div class="row-actions">
                  <button class="icon-btn" data-edit="${cls.id}" title="編輯">${icon('edit', 16)}</button>
                  <button class="icon-btn danger" data-del="${cls.id}" title="刪除">${icon('trash', 16)}</button>
                </div>
              </div>
              <h3>${esc(cls.name)}</h3>
              <p class="muted">${esc(cls.grade)} 年級</p>
              <div class="class-meta">
                <span>${cls.studentCount} 位學生</span>
                <span>${cls.courseCount} 門課程</span>
              </div>
            </div>`).join('')}
        </div>` : emptyState('尚無班級', '點擊右上角新增第一個班級', 'classes')}
    </section>`;

  document.getElementById('add-class').addEventListener('click', () => openClassModal());

  view.querySelectorAll('[data-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = classes.find((c) => c.id === button.dataset.edit);
      if (target) openClassModal(target);
    });
  });

  view.querySelectorAll('[data-del]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = classes.find((c) => c.id === button.dataset.del);
      if (!target) return;
      confirmAction({
        title: '刪除班級',
        message: `確定要刪除「${target.name}」嗎？若班級仍有學生或課程將無法刪除。`,
        onConfirm: async () => {
          await api.del(`/api/classes/${target.id}`);
          await refresh();
          toast('班級已刪除', 'success');
        },
      });
    });
  });
}

function openClassModal(target) {
  const isEdit = Boolean(target);
  const grade = Number(target?.grade) || 1;
  const body = `
    ${field('班級名稱', 'name', `<input class="input" name="name" required value="${esc(target?.name || '')}" placeholder="例：資工一丙">`)}
    ${field('年級', 'grade', `<select class="input" name="grade">
      <option value="1" ${grade === 1 ? 'selected' : ''}>一年級</option>
      <option value="2" ${grade === 2 ? 'selected' : ''}>二年級</option>
      <option value="3" ${grade === 3 ? 'selected' : ''}>三年級</option>
      <option value="4" ${grade === 4 ? 'selected' : ''}>四年級</option>
    </select>`)}
  `;

  openModal({
    title: isEdit ? '編輯班級' : '新增班級',
    body,
    submitText: isEdit ? '儲存變更' : '建立班級',
    onSubmit: async (formData) => {
      const payload = Object.fromEntries(formData.entries());
      if (isEdit) await api.put(`/api/classes/${target.id}`, payload);
      else await api.post('/api/classes', payload);
      await refresh();
      toast(isEdit ? '班級已更新' : '班級已建立', 'success');
    },
  });
}

/* ---------- Courses ---------- */
function renderCourses(view) {
  const role = state.data.user.role;
  if (role === 'admin') renderAdminCourses(view);
  else if (role === 'teacher') renderTeacherCourses(view);
  else renderStudentCourses(view);
}

function renderAdminCourses(view) {
  const courses = state.data.courses;

  view.innerHTML = `
    <section class="card">
      <div class="card-head">
        <div><h2>課程管理</h2><p class="muted">共 ${courses.length} 門課程</p></div>
        <button class="btn primary" id="add-course">${icon('plus', 18)}新增課程</button>
      </div>
      ${courses.length ? `
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>代碼</th><th>課程名稱</th><th>授課教授</th><th>班級</th><th>學分</th><th>選課人數</th><th>時間 / 教室</th><th class="right">操作</th></tr>
            </thead>
            <tbody>
              ${courses.map((course) => `
                <tr>
                  <td><span class="mono">${esc(course.code)}</span></td>
                  <td><strong>${esc(course.name)}</strong></td>
                  <td>${esc(course.teacherName)}</td>
                  <td>${esc(course.className)}</td>
                  <td>${course.credits}</td>
                  <td>${course.enrolledCount || 0}</td>
                  <td class="muted">${esc(course.schedule || '—')}${course.room ? ` · ${esc(course.room)}` : ''}</td>
                  <td class="right">
                    <div class="row-actions">
                      <button class="icon-btn" data-edit="${course.id}" title="編輯">${icon('edit', 17)}</button>
                      <button class="icon-btn danger" data-del="${course.id}" title="刪除">${icon('trash', 17)}</button>
                    </div>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>` : emptyState('尚無課程', '點擊右上角新增第一門課程', 'courses')}
    </section>`;

  document.getElementById('add-course').addEventListener('click', () => openCourseModal());

  view.querySelectorAll('[data-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = courses.find((c) => c.id === button.dataset.edit);
      if (target) openCourseModal(target);
    });
  });

  view.querySelectorAll('[data-del]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = courses.find((c) => c.id === button.dataset.del);
      if (!target) return;
      confirmAction({
        title: '刪除課程',
        message: `確定要刪除「${target.name}」嗎？該課程的成績與出缺席紀錄也會一併移除。`,
        onConfirm: async () => {
          await api.del(`/api/courses/${target.id}`);
          await refresh();
          toast('課程已刪除', 'success');
        },
      });
    });
  });
}

function openCourseModal(target) {
  const isEdit = Boolean(target);
  const teachers = state.data.users.filter((u) => u.role === 'teacher');
  const classes = state.data.classes;
  if (!teachers.length || !classes.length) {
    toast('請先建立教授帳號與班級', 'error');
    return;
  }

  const body = `
    <div class="form-grid">
      ${field('課程代碼', 'code', `<input class="input" name="code" required value="${esc(target?.code || '')}" placeholder="例：CS201">`)}
      ${field('課程名稱', 'name', `<input class="input" name="name" required value="${esc(target?.name || '')}" placeholder="例：資料結構">`)}
      ${field('授課教授', 'teacherId', `<select class="input" name="teacherId">
        ${teachers.map((t) => `<option value="${t.id}" ${target?.teacherId === t.id ? 'selected' : ''}>${esc(t.name)}${t.subject ? `（${esc(t.subject)}）` : ''}</option>`).join('')}
      </select>`)}
      ${field('班級', 'classId', `<select class="input" name="classId">
        ${classes.map((c) => `<option value="${c.id}" ${target?.classId === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
      </select>`)}
      ${field('學分數', 'credits', `<input class="input" name="credits" type="number" min="0" step="1" value="${target?.credits ?? 3}">`)}
      ${field('上課時間', 'schedule', `<input class="input" name="schedule" value="${esc(target?.schedule || '')}" placeholder="例：週一 1-2 節">`)}
    </div>
    <div class="form-grid">
      ${field('教室', 'room', `<input class="input" name="room" value="${esc(target?.room || '')}" placeholder="例：A101">`)}
      ${field('課程說明', 'description', `<input class="input" name="description" value="${esc(target?.description || '')}" placeholder="選填">`)}
    </div>
  `;

  openModal({
    title: isEdit ? '編輯課程' : '新增課程',
    body,
    submitText: isEdit ? '儲存變更' : '建立課程',
    onSubmit: async (formData) => {
      const payload = Object.fromEntries(formData.entries());
      if (isEdit) await api.put(`/api/courses/${target.id}`, payload);
      else await api.post('/api/courses', payload);
      await refresh();
      toast(isEdit ? '課程已更新' : '課程已建立', 'success');
    },
  });
}

function courseCard(course, footer = '') {
  return `
    <div class="course-card">
      <div class="course-top">
        <div>
          <span class="course-code">${esc(course.code)}</span>
          <h3>${esc(course.name)}</h3>
          <p class="course-sub">${esc(course.teacherName)} · ${esc(course.className)}</p>
        </div>
      </div>
      <div class="course-info">
        <div><span>上課時間</span><strong>${esc(course.schedule || '未排課')}</strong></div>
        <div><span>教室</span><strong>${esc(course.room || '—')}</strong></div>
        <div><span>學分數</span><strong>${course.credits}</strong></div>
        <div><span>課程代碼</span><strong>${esc(course.code)}</strong></div>
      </div>
      ${course.description ? `<p class="muted small">${esc(course.description)}</p>` : ''}
      ${footer ? `<div class="course-foot">${footer}</div>` : ''}
    </div>`;
}

function renderTeacherCourses(view) {
  const { courses, grades } = state.data;

  view.innerHTML = `
    <section class="card">
      <div class="card-head">
        <div><h2>我的課程</h2><p class="muted">共 ${courses.length} 門授課課程</p></div>
      </div>
      ${courses.length ? `
        <div class="course-grid">
          ${courses.map((course) => {
            const studentCount = enrolledCount(course.id);
            const gradeCount = grades.filter((g) => g.courseId === course.id).length;
            return courseCard(course, `
              <div class="class-meta">
                <span>${studentCount} 位學生</span>
                <span>${gradeCount} 筆成績</span>
              </div>
              <button class="btn ghost sm" data-students="${course.id}">學生名單</button>
            `);
          }).join('')}
        </div>` : emptyState('尚無授課課程', '請聯繫管理員為您安排課程', 'courses')}
    </section>`;

  view.querySelectorAll('[data-students]').forEach((button) => {
    button.addEventListener('click', () => {
      const course = courses.find((c) => c.id === button.dataset.students);
      if (course) openCourseStudentsModal(course);
    });
  });
}

function openCourseStudentsModal(course) {
  const students = enrolledStudentList(course.id);
  const body = students.length ? `
    <div class="table-wrap">
      <table>
        <thead><tr><th>姓名</th><th>帳號</th><th>Email</th></tr></thead>
        <tbody>
          ${students.map((student) => `
            <tr>
              <td><div class="person"><div class="avatar sm">${esc(student.name.slice(0, 1))}</div><strong>${esc(student.name)}</strong></div></td>
              <td><span class="mono">${esc(student.username)}</span></td>
              <td class="muted">${esc(student.email || '—')}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>` : emptyState('此課程尚無學生選課', '學生可透過加退選功能選修本課程', 'users');

  openModal({
    title: `${course.name} · 選課學生（${students.length} 人）`,
    body,
    submitText: '關閉',
    onSubmit: () => {},
  });
}

function renderStudentCourses(view) {
  const { courses, grades } = state.data;

  view.innerHTML = `
    <section class="card">
      <div class="card-head">
        <div><h2>我的課程</h2><p class="muted">本學期共修習 ${courses.length} 門課程</p></div>
      </div>
      ${courses.length ? `
        <div class="course-grid">
          ${courses.map((course) => {
            const avg = avgPercent(grades.filter((g) => g.courseId === course.id));
            return courseCard(course, `
              <span class="muted small">目前平均</span>
              <strong>${avg === null ? '—' : `${avg}%`}</strong>
            `);
          }).join('')}
        </div>` : emptyState('尚無修課資料', '您尚未選修任何課程，可至加退選加選', 'courses')}
    </section>`;
}

/* ---------- Enrollment ---------- */
function renderEnrollment(view) {
  const d = state.data;
  if (d.user.role !== 'student') {
    view.innerHTML = `<section class="card">${emptyState('無法使用加退選', '此功能僅供學生使用', 'enrollment')}</section>`;
    return;
  }
  const enrolledCourses = d.courses.slice().sort((a, b) => String(a.code).localeCompare(String(b.code)));
  const catalog = (d.catalog || []).slice().sort((a, b) => String(a.code).localeCompare(String(b.code)));
  const enrollmentByCourse = new Map((d.enrollments || []).map((e) => [e.courseId, e]));
  const availableCourses = catalog.filter((c) => !enrollmentByCourse.has(c.id));
  const totalCredits = enrolledCourses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);

  const courseRows = (list, action) => list.map((course) => `
    <tr>
      <td><span class="mono">${esc(course.code)}</span></td>
      <td><strong>${esc(course.name)}</strong></td>
      <td>${esc(course.teacherName)}</td>
      <td>${esc(course.className)}</td>
      <td>${course.credits}</td>
      <td>${course.enrolledCount || 0}</td>
      <td class="muted">${esc(course.schedule || '—')}${course.room ? ` · ${esc(course.room)}` : ''}</td>
      <td class="right">${action(course)}</td>
    </tr>`).join('');

  view.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-icon">${icon('courses', 22)}</div><div><span>已選課程</span><strong>${enrolledCourses.length}</strong></div></div>
      <div class="stat-card"><div class="stat-icon">${icon('grades', 22)}</div><div><span>已選學分</span><strong>${totalCredits}</strong></div></div>
      <div class="stat-card"><div class="stat-icon">${icon('enrollment', 22)}</div><div><span>可加選課程</span><strong>${availableCourses.length}</strong></div></div>
    </div>
    <section class="card">
      <div class="card-head">
        <div><h2>已選課程</h2><p class="muted">退選後將一併移除該課程的成績與出缺席紀錄</p></div>
      </div>
      ${enrolledCourses.length ? `
        <div class="table-wrap">
          <table>
            <thead><tr><th>代碼</th><th>課程名稱</th><th>授課教授</th><th>開課班級</th><th>學分</th><th>選課人數</th><th>時間 / 教室</th><th class="right">操作</th></tr></thead>
            <tbody>${courseRows(enrolledCourses, (course) => `<button class="btn ghost sm" data-drop="${course.id}">退選</button>`)}</tbody>
          </table>
        </div>` : emptyState('尚未選課', '從下方可加選課程開始選課', 'enrollment')}
    </section>
    <section class="card">
      <div class="card-head">
        <div><h2>可加選課程</h2><p class="muted">點擊加選即可完成選課</p></div>
      </div>
      ${availableCourses.length ? `
        <div class="table-wrap">
          <table>
            <thead><tr><th>代碼</th><th>課程名稱</th><th>授課教授</th><th>開課班級</th><th>學分</th><th>選課人數</th><th>時間 / 教室</th><th class="right">操作</th></tr></thead>
            <tbody>${courseRows(availableCourses, (course) => `<button class="btn primary sm" data-add="${course.id}">加選</button>`)}</tbody>
          </table>
        </div>` : emptyState('沒有可加選的課程', '您已選修所有開設課程', 'courses')}
    </section>`;

  view.querySelectorAll('[data-add]').forEach((button) => {
    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        await api.post('/api/enrollments', { courseId: button.dataset.add });
        await refresh();
        toast('加選成功', 'success');
      } catch (err) {
        toast(err.message, 'error');
        button.disabled = false;
      }
    });
  });

  view.querySelectorAll('[data-drop]').forEach((button) => {
    button.addEventListener('click', () => {
      const course = enrolledCourses.find((c) => c.id === button.dataset.drop);
      const enrollment = enrollmentByCourse.get(button.dataset.drop);
      if (!course || !enrollment) return;
      confirmAction({
        title: '退選課程',
        message: `確定要退選「${course.name}」嗎？該課程的成績與出缺席紀錄也會一併移除。`,
        confirmText: '確定退選',
        onConfirm: async () => {
          await api.del(`/api/enrollments/${enrollment.id}`);
          await refresh();
          toast('退選成功', 'success');
        },
      });
    });
  });
}

/* ---------- Grades ---------- */
function renderGrades(view) {
  if (state.data.user.role === 'student') renderStudentGrades(view);
  else renderStaffGrades(view);
}

function renderStaffGrades(view) {
  const d = state.data;
  const user = d.user;
  const courses = d.courses;

  if (!courses.length) {
    view.innerHTML = `<section class="card">${emptyState('尚無課程', '目前沒有可登錄成績的課程', 'grades')}</section>`;
    return;
  }

  if (!courses.some((c) => c.id === state.ui.gradeCourse)) state.ui.gradeCourse = courses[0].id;
  const course = courses.find((c) => c.id === state.ui.gradeCourse);
  const records = d.grades
    .filter((g) => g.courseId === course.id)
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  const roster = enrolledStudentList(course.id);
  const avg = avgPercent(records);

  view.innerHTML = `
    <section class="card">
      <div class="card-head">
        <div>
          <h2>成績管理</h2>
          <p class="muted">${user.role === 'teacher' ? '登錄與管理您授課班級的成績' : '檢視與管理所有課程成績'}</p>
        </div>
        <div class="toolbar" style="margin:0">
          <select class="input compact" id="grade-course">
            ${courses.map((c) => `<option value="${c.id}" ${c.id === course.id ? 'selected' : ''}>${esc(c.name)} · ${esc(c.className)}</option>`).join('')}
          </select>
          ${user.role === 'teacher' ? `<button class="btn primary" id="add-grade">${icon('plus', 18)}新增成績</button>` : ''}
        </div>
      </div>
      <div class="course-summary">
        <span>${icon('profile', 16)} ${esc(course.teacherName)}</span>
        <span>${icon('classes', 16)} ${esc(course.className)}</span>
        <span>${icon('users', 16)} ${roster.length} 位學生</span>
        <span>${icon('grades', 16)} 平均 ${avg === null ? '—' : `${avg}%`}</span>
      </div>
      ${records.length ? `
        <div class="table-wrap">
          <table>
            <thead><tr><th>學生</th><th>評量</th><th>分數</th><th>日期</th><th class="right">操作</th></tr></thead>
            <tbody>
              ${records.map((grade) => `
                <tr>
                  <td><div class="person"><div class="avatar sm">${esc(grade.studentName.slice(0, 1))}</div><strong>${esc(grade.studentName)}</strong></div></td>
                  <td>${esc(grade.title)}</td>
                  <td>
                    <strong>${grade.score}</strong><span class="muted"> / ${grade.maxScore}</span>
                    <span class="score-pct">${Math.round((grade.score / grade.maxScore) * 100)}%</span>
                  </td>
                  <td class="muted">${fmtDate(grade.date)}</td>
                  <td class="right">
                    <div class="row-actions">
                      <button class="icon-btn" data-edit="${grade.id}" title="編輯">${icon('edit', 17)}</button>
                      <button class="icon-btn danger" data-del="${grade.id}" title="刪除">${icon('trash', 17)}</button>
                    </div>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>` : emptyState('尚無成績紀錄', '新增第一筆成績紀錄後會顯示在這裡', 'grades')}
    </section>`;

  document.getElementById('grade-course').addEventListener('change', (event) => {
    state.ui.gradeCourse = event.target.value;
    renderStaffGrades(view);
  });

  document.getElementById('add-grade')?.addEventListener('click', () => {
    openGradeModal(course, roster);
  });

  view.querySelectorAll('[data-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      const grade = records.find((g) => g.id === button.dataset.edit);
      if (grade) openGradeModal(course, roster, grade);
    });
  });

  view.querySelectorAll('[data-del]').forEach((button) => {
    button.addEventListener('click', () => {
      const grade = records.find((g) => g.id === button.dataset.del);
      if (!grade) return;
      confirmAction({
        title: '刪除成績',
        message: `確定要刪除「${grade.studentName}」的「${grade.title}」成績嗎？`,
        onConfirm: async () => {
          await api.del(`/api/grades/${grade.id}`);
          await refresh();
          toast('成績已刪除', 'success');
        },
      });
    });
  });
}

function openGradeModal(course, roster, target) {
  const isEdit = Boolean(target);
  if (!roster.length) {
    toast('此班級尚無學生', 'error');
    return;
  }

  const body = `
    ${isEdit
      ? `<input type="hidden" name="studentId" value="${target.studentId}">${field('學生', 'studentDisplay', `<input class="input" value="${esc(target.studentName)}" disabled>`)}`
      : field('學生', 'studentId', `<select class="input" name="studentId">
          ${roster.map((s) => `<option value="${s.id}">${esc(s.name)}（${esc(s.username)}）</option>`).join('')}
        </select>`)}
    <div class="form-grid">
      ${field('評量名稱', 'title', `<input class="input" name="title" required value="${esc(target?.title || '')}" placeholder="例：期中考">`)}
      ${field('日期', 'date', `<input class="input" name="date" type="date" value="${target?.date || todayISO()}">`)}
      ${field('分數', 'score', `<input class="input" name="score" type="number" min="0" step="0.5" required value="${target?.score ?? ''}">`)}
      ${field('滿分', 'maxScore', `<input class="input" name="maxScore" type="number" min="1" step="1" value="${target?.maxScore ?? 100}">`)}
    </div>
  `;

  openModal({
    title: isEdit ? '編輯成績' : '新增成績',
    body,
    submitText: isEdit ? '儲存變更' : '新增成績',
    onSubmit: async (formData) => {
      const payload = Object.fromEntries(formData.entries());
      payload.courseId = course.id;
      if (isEdit) await api.put(`/api/grades/${target.id}`, payload);
      else await api.post('/api/grades', payload);
      await refresh();
      toast(isEdit ? '成績已更新' : '成績已新增', 'success');
    },
  });
}

function renderStudentGrades(view) {
  const { courses, grades } = state.data;
  const overall = avgPercent(grades);
  const byCourse = courses.map((course) => ({
    course,
    list: grades.filter((g) => g.courseId === course.id),
  }));

  view.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-icon">${icon('grades', 22)}</div><div><span>總平均</span><strong>${overall === null ? '—' : `${overall}%`}</strong></div></div>
      <div class="stat-card"><div class="stat-icon">${icon('courses', 22)}</div><div><span>修課數</span><strong>${courses.length}</strong></div></div>
      <div class="stat-card"><div class="stat-icon">${icon('check', 22)}</div><div><span>成績筆數</span><strong>${grades.length}</strong></div></div>
    </div>
    <section class="card">
      <div class="card-head"><div><h2>各科成績</h2><p class="muted">依課程彙整您的評量表現</p></div></div>
      ${courses.length ? `
        <div class="course-grid">
          ${byCourse.map(({ course, list }) => {
            const avg = avgPercent(list);
            return `<div class="course-card">
              <div class="course-top">
                <div>
                  <span class="course-code">${esc(course.code)}</span>
                  <h3>${esc(course.name)}</h3>
                  <p class="course-sub">${esc(course.teacherName)} · ${esc(course.className)}</p>
                </div>
                <div class="grade-ring">${avg === null ? '—' : `${avg}%`}</div>
              </div>
              ${list.length ? `<div class="grade-list">
                ${list.map((g) => `<div class="grade-row"><span>${esc(g.title)}</span><strong>${g.score}<small> / ${g.maxScore}</small></strong></div>`).join('')}
              </div>` : '<p class="muted small">尚未有成績</p>'}
            </div>`;
          }).join('')}
        </div>` : emptyState('尚無修課資料', '目前沒有可顯示的成績', 'grades')}
    </section>`;
}

/* ---------- Attendance ---------- */
function renderAttendance(view) {
  if (state.data.user.role === 'student') renderStudentAttendance(view);
  else renderStaffAttendance(view);
}

function renderStaffAttendance(view) {
  const d = state.data;
  const user = d.user;
  const courses = d.courses;

  if (!courses.length) {
    view.innerHTML = `<section class="card">${emptyState('尚無課程', '目前沒有可登錄出缺席的課程', 'attendance')}</section>`;
    return;
  }

  if (!courses.some((c) => c.id === state.ui.attCourse)) state.ui.attCourse = courses[0].id;
  if (!state.ui.attDate) state.ui.attDate = todayISO();
  const course = courses.find((c) => c.id === state.ui.attCourse);
  const date = state.ui.attDate;
  const roster = enrolledStudentList(course.id);
  const existing = new Map(
    d.attendance
      .filter((a) => a.courseId === course.id && a.date === date)
      .map((a) => [a.studentId, a])
  );
  const editable = user.role === 'teacher';

  view.innerHTML = `
    <section class="card">
      <div class="card-head">
        <div>
          <h2>出缺席管理</h2>
          <p class="muted">${editable ? '選擇課程與日期後登錄學生出缺席' : '管理員檢視模式（唯讀）'}</p>
        </div>
        <div class="toolbar" style="margin:0">
          <select class="input compact" id="att-course">
            ${courses.map((c) => `<option value="${c.id}" ${c.id === course.id ? 'selected' : ''}>${esc(c.name)} · ${esc(c.className)}</option>`).join('')}
          </select>
          <input class="input compact" type="date" id="att-date" value="${date}">
          ${editable ? `<button class="btn primary" id="save-att">${icon('check', 18)}儲存</button>` : ''}
        </div>
      </div>
      <div class="course-summary">
        <span>${icon('profile', 16)} ${esc(course.teacherName)}</span>
        <span>${icon('classes', 16)} ${esc(course.className)}</span>
        <span>${icon('users', 16)} ${roster.length} 位學生</span>
      </div>
      ${roster.length ? `
        <div class="table-wrap">
          <table>
            <thead><tr><th>學生</th><th>狀態</th><th>備註</th></tr></thead>
            <tbody>
              ${roster.map((student) => {
                const record = existing.get(student.id);
                const current = record?.status || 'present';
                return `<tr data-student="${student.id}">
                  <td><div class="person"><div class="avatar sm">${esc(student.name.slice(0, 1))}</div><strong>${esc(student.name)}</strong></div></td>
                  <td>
                    <select class="input compact att-status" ${editable ? '' : 'disabled'}>
                      ${Object.entries(STATUS_LABEL).map(([value, label]) => `<option value="${value}" ${current === value ? 'selected' : ''}>${label}</option>`).join('')}
                    </select>
                  </td>
                  <td><input class="input" style="max-width:260px" placeholder="選填" value="${esc(record?.note || '')}" ${editable ? '' : 'disabled'}></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>` : emptyState('此班級尚無學生', '請先新增學生帳號', 'users')}
    </section>`;

  document.getElementById('att-course').addEventListener('change', (event) => {
    state.ui.attCourse = event.target.value;
    renderStaffAttendance(view);
  });

  document.getElementById('att-date').addEventListener('change', (event) => {
    state.ui.attDate = event.target.value || todayISO();
    renderStaffAttendance(view);
  });

  document.getElementById('save-att')?.addEventListener('click', async () => {
    const rows = [...view.querySelectorAll('tr[data-student]')];
    const records = rows.map((row) => ({
      studentId: row.dataset.student,
      status: row.querySelector('select').value,
      note: row.querySelector('input').value,
    }));
    try {
      await api.post('/api/attendance', { courseId: course.id, date, records });
      await refresh();
      toast('出缺席紀錄已儲存', 'success');
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

function renderStudentAttendance(view) {
  const list = state.data.attendance;
  const rate = attendanceRate(list);
  const counts = { present: 0, absent: 0, late: 0, leave: 0 };
  list.forEach((a) => {
    counts[a.status] = (counts[a.status] || 0) + 1;
  });

  view.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-icon">${icon('attendance', 22)}</div><div><span>出缺席率</span><strong>${rate === null ? '—' : `${rate}%`}</strong></div></div>
      <div class="stat-card"><div class="stat-icon">${icon('check', 22)}</div><div><span>出席 / 遲到</span><strong>${counts.present} / ${counts.late}</strong></div></div>
      <div class="stat-card"><div class="stat-icon">${icon('close', 22)}</div><div><span>缺席 / 請假</span><strong>${counts.absent} / ${counts.leave}</strong></div></div>
    </div>
    <section class="card">
      <div class="card-head"><div><h2>出缺席紀錄</h2><p class="muted">共 ${list.length} 筆紀錄</p></div></div>
      ${list.length ? `
        <div class="table-wrap">
          <table>
            <thead><tr><th>日期</th><th>課程</th><th>狀態</th><th>備註</th></tr></thead>
            <tbody>
              ${list.map((a) => `
                <tr>
                  <td>${fmtDate(a.date)}</td>
                  <td>${esc(a.courseName)}</td>
                  <td>${statusBadge(a.status)}</td>
                  <td class="muted">${esc(a.note || '—')}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>` : emptyState('尚無出缺席紀錄', '教授登錄後將顯示於此', 'attendance')}
    </section>`;
}

/* ---------- Announcements ---------- */
function renderAnnouncements(view) {
  const { user, announcements, classes } = state.data;
  const canPost = user.role === 'admin' || user.role === 'teacher';

  view.innerHTML = `
    <section class="card">
      <div class="card-head">
        <div><h2>公告中心</h2><p class="muted">共 ${announcements.length} 則公告</p></div>
        ${canPost ? `<button class="btn primary" id="add-ann">${icon('plus', 18)}發布公告</button>` : ''}
      </div>
      ${announcements.length ? `
        <div class="announce-list">
          ${announcements.map((a) => `
            <article class="announce">
              <div class="announce-head">
                <h3>${esc(a.title)}</h3>
                ${(user.role === 'admin' || a.authorId === user.id)
                  ? `<button class="icon-btn danger" data-del="${a.id}" title="刪除">${icon('trash', 16)}</button>`
                  : ''}
              </div>
              <p class="announce-content">${esc(a.content).replace(/\n/g, '<br>')}</p>
              <div class="announce-foot">
                <span class="badge soft">${esc(a.audienceName)}</span>
                <span>${esc(a.authorName)} · ${fmtDateTime(a.createdAt)}</span>
              </div>
            </article>`).join('')}
        </div>` : emptyState('目前沒有公告', '發布第一則校園公告，讓大家知道最新消息', 'announcements')}
    </section>`;

  document.getElementById('add-ann')?.addEventListener('click', () => {
    openAnnouncementModal(classes);
  });

  view.querySelectorAll('[data-del]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = announcements.find((a) => a.id === button.dataset.del);
      if (!target) return;
      confirmAction({
        title: '刪除公告',
        message: `確定要刪除公告「${target.title}」嗎？`,
        onConfirm: async () => {
          await api.del(`/api/announcements/${target.id}`);
          await refresh();
          toast('公告已刪除', 'success');
        },
      });
    });
  });
}

function openAnnouncementModal(classes) {
  const options = [['all', '全體師生'], ...classes.map((c) => [c.id, c.name])];
  const body = `
    ${field('標題', 'title', '<input class="input" name="title" required placeholder="請輸入公告標題">')}
    ${field('內容', 'content', '<textarea class="input" name="content" required placeholder="請輸入公告內容"></textarea>')}
    ${field('發布對象', 'audience', `<select class="input" name="audience">
      ${options.map(([value, label]) => `<option value="${value}">${esc(label)}</option>`).join('')}
    </select>`)}
  `;

  openModal({
    title: '發布公告',
    body,
    submitText: '發布',
    onSubmit: async (formData) => {
      await api.post('/api/announcements', Object.fromEntries(formData.entries()));
      await refresh();
      toast('公告已發布', 'success');
    },
  });
}

/* ---------- Profile ---------- */
function renderProfile(view) {
  const user = state.data.user;
  const cls = state.data.classes.find((c) => c.id === user.classId);

  view.innerHTML = `
    <div class="profile-grid">
      <section class="card">
        <div class="profile-head">
          <div class="avatar xl">${esc(user.name.slice(0, 1))}</div>
          <div>
            <h2>${esc(user.name)}</h2>
            <p>${roleBadge(user.role)} <span class="mono">@${esc(user.username)}</span></p>
          </div>
        </div>
        <dl class="profile-info">
          <div><dt>姓名</dt><dd>${esc(user.name)}</dd></div>
          <div><dt>帳號</dt><dd class="mono">${esc(user.username)}</dd></div>
          <div><dt>角色</dt><dd>${ROLE_LABEL[user.role]}</dd></div>
          <div><dt>Email</dt><dd>${esc(user.email || '—')}</dd></div>
          ${user.role === 'student' ? `<div><dt>班級</dt><dd>${esc(cls?.name || '未分班')}</dd></div>` : ''}
          ${user.role === 'teacher' ? `<div><dt>系所 / 專長</dt><dd>${esc(user.subject || '—')}</dd></div>` : ''}
        </dl>
      </section>
      <section class="card">
        <div class="card-head"><div><h2>變更密碼</h2><p class="muted">建議定期更新您的密碼</p></div></div>
        <form id="pw-form" class="form-grid single">
          ${field('目前密碼', 'currentPassword', '<input class="input" type="password" name="currentPassword" required>')}
          ${field('新密碼', 'newPassword', '<input class="input" type="password" name="newPassword" required minlength="6" placeholder="至少 6 個字元">')}
          ${field('確認新密碼', 'confirmPassword', '<input class="input" type="password" name="confirmPassword" required>')}
          <button class="btn primary" type="submit">更新密碼</button>
        </form>
      </section>
    </div>`;

  const form = document.getElementById('pw-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (form.newPassword.value !== form.confirmPassword.value) {
      toast('兩次輸入的新密碼不一致', 'error');
      return;
    }
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      await api.put('/api/me/password', {
        currentPassword: form.currentPassword.value,
        newPassword: form.newPassword.value,
      });
      form.reset();
      toast('密碼已更新', 'success');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      button.disabled = false;
    }
  });
}

async function init() {
  if (state.token) {
    try {
      state.data = await api.get('/api/bootstrap');
    } catch {
      state.token = '';
      localStorage.removeItem('sms_token');
      state.data = null;
    }
  } else {
    try {
      const res = await fetch('/api/health');
      state.backend = res.ok;
    } catch {
      state.backend = false;
    }
  }
  render();
}

init();
