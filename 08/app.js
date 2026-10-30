const STORAGE_KEY = 'shiguang-market-v1';
const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

const CATEGORIES = ['全部', '數位', '家電', '服飾', '書籍', '居家', '運動', '其他'];

const CATEGORY_IMAGES = {
  '數位': 'assets/camera.svg',
  '家電': 'assets/lamp.svg',
  '服飾': 'assets/jacket.svg',
  '書籍': 'assets/books.svg',
  '居家': 'assets/vase.svg',
  '運動': 'assets/bike.svg',
  '其他': 'assets/placeholder.svg',
};

const seedProducts = [
  {
    id: 'fujifilm-x-t30',
    title: 'Fujifilm X-T30 微單眼相機',
    price: 16800,
    originalPrice: 28900,
    category: '數位',
    condition: '九成新',
    location: '台北市',
    seller: '林小姐',
    description: '少用出售，快門數約 8,000 次，附原廠電池、充電器與 15-45mm 鏡頭。外觀維持良好，功能一切正常，可相約台北面交試機。',
    image: 'assets/camera.svg',
    ageMs: 2 * 60 * 60 * 1000,
  },
  {
    id: 'marshall-emberton',
    title: 'Marshall Emberton 藍牙音響',
    price: 3200,
    originalPrice: 4990,
    category: '數位',
    condition: '近全新',
    location: '新北市',
    seller: '陳先生',
    description: '去年收到的禮物，使用不到五次，音質飽滿、續航正常。附原廠充電線與收納袋，外表沒有明顯刮痕。',
    image: 'assets/speaker.svg',
    ageMs: 5 * 60 * 60 * 1000,
  },
  {
    id: 'nordic-lamp',
    title: '北歐木質桌燈',
    price: 850,
    originalPrice: 1680,
    category: '居家',
    condition: '九成新',
    location: '台中市',
    seller: '王小姐',
    description: '暖白光桌燈，木質底座搭配亞麻燈罩，適合放在書桌或床頭。搬家出清，燈泡與電線皆可正常使用。',
    image: 'assets/lamp.svg',
    ageMs: 8 * 60 * 60 * 1000,
  },
  {
    id: 'levis-jacket',
    title: "Levi's 復古丹寧外套",
    price: 1200,
    originalPrice: 3290,
    category: '服飾',
    condition: '八成新',
    location: '高雄市',
    seller: '張同學',
    description: '經典水洗藍，版型偏寬鬆，男女皆可穿。僅穿過幾次，袖口有自然刷色，沒有破損，尺寸為 M。',
    image: 'assets/jacket.svg',
    ageMs: 26 * 60 * 60 * 1000,
  },
  {
    id: 'design-books',
    title: '設計思考套書三冊',
    price: 600,
    originalPrice: 1350,
    category: '書籍',
    condition: '良好',
    location: '台南市',
    seller: '黃先生',
    description: '包含設計思考、視覺溝通與使用者研究三本書，內頁乾淨、沒有畫線。適合想入門設計實務的朋友。',
    image: 'assets/books.svg',
    ageMs: 30 * 60 * 60 * 1000,
  },
  {
    id: 'coffee-machine',
    title: '義式半自動咖啡機',
    price: 4500,
    originalPrice: 8900,
    category: '家電',
    condition: '九成新',
    location: '桃園市',
    seller: '李太太',
    description: '每週使用兩三次，已定期清洗與除鈣。附單份與雙份濾杯、壓粉器，因換新機而出售。',
    image: 'assets/coffee.svg',
    ageMs: 48 * 60 * 60 * 1000,
  },
  {
    id: 'giant-bike',
    title: '捷安特城市通勤腳踏車',
    price: 3800,
    originalPrice: 8800,
    category: '運動',
    condition: '八成新',
    location: '新竹市',
    seller: '吳先生',
    description: '七段變速，適合市區通勤與河濱騎乘。近期剛更換煞車皮與鏈條，車況良好，可相約試騎。',
    image: 'assets/bike.svg',
    ageMs: 72 * 60 * 60 * 1000,
  },
  {
    id: 'ceramic-vase',
    title: '手作陶瓷花瓶',
    price: 480,
    originalPrice: 980,
    category: '居家',
    condition: '近全新',
    location: '台北市',
    seller: '許小姐',
    description: '手作霧面陶瓷花瓶，米白色搭配自然釉色，適合插乾燥花或作為空間擺飾。沒有缺角或裂痕。',
    image: 'assets/vase.svg',
    ageMs: 96 * 60 * 60 * 1000,
  },
];

function createSeedStore() {

  const now = Date.now();
  return {
    users: [],
    sessionUserId: null,
    products: seedProducts.map(({ ageMs, ...product }) => ({
      ...product,
      createdAt: new Date(now - ageMs).toISOString(),
      sold: false,
      ownerId: null,
    })),
    purchases: [],
    offers: [],
    favorites: [],
    notifications: [],
  };
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.products)) {
        return {
          users: Array.isArray(parsed.users) ? parsed.users : [],
          sessionUserId: typeof parsed.sessionUserId === 'string' ? parsed.sessionUserId : null,
          products: parsed.products,
          purchases: Array.isArray(parsed.purchases) ? parsed.purchases : [],
          offers: Array.isArray(parsed.offers) ? parsed.offers : [],
          favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
        };
      }
    }
  } catch (error) {
    console.warn('無法讀取本機資料，將使用預設商品。', error);
  }

  const initial = createSeedStore();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  } catch (error) {
    console.warn('無法寫入本機資料。', error);
  }
  return initial;
}

const store = loadStore();
const state = {
  users: store.users,
  sessionUserId: store.sessionUserId,
  products: store.products,
  purchases: store.purchases,
  offers: store.offers,
  favorites: store.favorites,
  notifications: store.notifications,
  category: '全部',
  search: '',
  sort: 'newest',
  tradeTab: 'purchases',
  accountMode: 'login',
  pendingImage: null,
  checkoutId: null,
  offerProductId: null,
  priceEditId: null,
};

const els = {
  header: document.querySelector('.site-header'),
  grid: document.getElementById('productGrid'),
  emptyState: document.getElementById('emptyState'),
  categoryFilters: document.getElementById('categoryFilters'),
  resultCount: document.getElementById('resultCount'),
  searchInput: document.getElementById('searchInput'),
  sortSelect: document.getElementById('sortSelect'),
  resetFiltersButton: document.getElementById('resetFiltersButton'),
  statAvailable: document.getElementById('statAvailable'),
  statSold: document.getElementById('statSold'),
  statCategories: document.getElementById('statCategories'),
  tradeBadge: document.getElementById('tradeBadge'),
  notificationButton: document.getElementById('notificationButton'),
  notificationBadge: document.getElementById('notificationBadge'),
  purchaseCount: document.getElementById('purchaseCount'),
  offerCount: document.getElementById('offerCount'),
  favoriteCount: document.getElementById('favoriteCount'),
  listingCount: document.getElementById('listingCount'),
  accountButton: document.getElementById('accountButton'),
  accountAvatar: document.getElementById('accountAvatar'),
  accountLabel: document.getElementById('accountLabel'),
  headerTradesButton: document.getElementById('headerTradesButton'),
  openListingButton: document.getElementById('openListingButton'),
  heroBrowseButton: document.getElementById('heroBrowseButton'),
  heroListButton: document.getElementById('heroListButton'),
  accountDialog: document.getElementById('accountDialog'),
  accountDialogContent: document.getElementById('accountDialogContent'),
  productDialog: document.getElementById('productDialog'),
  productDialogContent: document.getElementById('productDialogContent'),
  listingDialog: document.getElementById('listingDialog'),
  listingForm: document.getElementById('listingForm'),
  listingImage: document.getElementById('listingImage'),
  uploadEmpty: document.getElementById('uploadEmpty'),
  uploadPreview: document.getElementById('uploadPreview'),
  imagePreview: document.getElementById('imagePreview'),
  imageFileName: document.getElementById('imageFileName'),
  listingDescription: document.getElementById('listingDescription'),
  descCount: document.getElementById('descCount'),
  listingError: document.getElementById('listingError'),
  checkoutDialog: document.getElementById('checkoutDialog'),
  checkoutDialogContent: document.getElementById('checkoutDialogContent'),
  offerDialog: document.getElementById('offerDialog'),
  offerDialogContent: document.getElementById('offerDialogContent'),
  priceDialog: document.getElementById('priceDialog'),
  priceDialogContent: document.getElementById('priceDialogContent'),
  notificationsDialog: document.getElementById('notificationsDialog'),
  notificationsContent: document.getElementById('notificationsContent'),
  tradesDialog: document.getElementById('tradesDialog'),
  tradesContent: document.getElementById('tradesContent'),
  toast: document.getElementById('toast'),
  toastMessage: document.getElementById('toastMessage'),
  currentYear: document.getElementById('currentYear'),
};

const priceFormatter = new Intl.NumberFormat('zh-TW');
let toastTimer;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[character];
  });
}

function formatMoney(value) {
  return priceFormatter.format(Math.round(Number(value) || 0));
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '時間不明';
  return new Intl.DateTimeFormat('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function timeAgo(value) {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return '剛剛';
  const diff = Math.max(0, Date.now() - time);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return '剛剛';
  if (diff < hour) return `${Math.floor(diff / minute)} 分鐘前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小時前`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`;
  return new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric' }).format(new Date(time));
}

function initialOf(name) {
  return Array.from(String(name || '拾'))[0];
}

function productImage(product) {
  return product.image || CATEGORY_IMAGES[product.category] || 'assets/placeholder.svg';
}

function getCurrentUser() {
  return state.users.find((user) => user.id === state.sessionUserId) || null;
}

function recordsForCurrentUser(records) {
  const user = getCurrentUser();
  return user ? records.filter((record) => record.userId === user.id) : [];
}

function isMine(product) {
  const user = getCurrentUser();
  return Boolean(user && product.ownerId === user.id);
}

function userIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.8"/>
      <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
  `;
}

function requireUser(message = '請先登入或註冊帳號。') {
  const user = getCurrentUser();
  if (user) return user;
  openAccountDialog('login');
  showToast(message);
  return null;
}

function findFavorite(productId) {
  return recordsForCurrentUser(state.favorites).find((favorite) => favorite.productId === productId);
}

function pendingOfferFor(productId) {
  return recordsForCurrentUser(state.offers).find((offer) => offer.productId === productId && offer.status === 'pending');
}

function favoriteIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.7A4 4 0 0 1 19 10c0 5.7-7 10-7 10Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    </svg>
  `;
}

function toggleFavorite(productId) {
  const product = state.products.find((item) => item.id === productId);
  const user = requireUser('登入後就能收藏商品。');
  if (!product || !user) return;

  const existingIndex = state.favorites.findIndex((favorite) => favorite.userId === user.id && favorite.productId === productId);
  if (existingIndex >= 0) {
    state.favorites.splice(existingIndex, 1);
    persist();
    renderAll();
    if (els.productDialog.open) openProduct(productId);
    showToast('已取消收藏。');
    return;
  }

  state.favorites.unshift({
    userId: user.id,
    productId,
    addedAt: new Date().toISOString(),
    priceAtFavorite: product.price,
    lastNotifiedPrice: product.price,
  });

  persist();
  renderAll();
  if (els.productDialog.open) openProduct(productId);
  showToast('已加入收藏，降價時會通知你。');
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      users: state.users,
      sessionUserId: state.sessionUserId,
      products: state.products,
      purchases: state.purchases,
      offers: state.offers,
      favorites: state.favorites,
      notifications: state.notifications,
    }));
    return true;
  } catch (error) {
    console.warn('資料儲存失敗。', error);
    showToast('瀏覽器儲存空間不足，部分操作可能無法保存。');
    return false;
  }
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  els.toastMessage.textContent = message;
  els.toast.classList.add('is-visible');
  toastTimer = window.setTimeout(() => {
    els.toast.classList.remove('is-visible');
  }, 3200);
}

function renderAccountButton() {
  const user = getCurrentUser();
  els.accountButton.classList.toggle('is-logged-in', Boolean(user));
  els.accountButton.setAttribute('aria-label', user ? `帳號：${user.name}` : '登入或註冊帳號');
  els.accountLabel.textContent = user ? user.name : '登入';
  if (user) {
    els.accountAvatar.textContent = initialOf(user.name);
  } else {
    els.accountAvatar.innerHTML = userIcon();
  }
}

function accountError(message) {
  const errorBox = document.getElementById('accountError');
  if (!errorBox) return;
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function renderAccountDialog() {
  const user = getCurrentUser();
  if (user) {
    const listingTotal = state.products.filter(isMine).length;
    const favoriteTotal = recordsForCurrentUser(state.favorites).length;
    const purchaseTotal = recordsForCurrentUser(state.purchases).length;
    els.accountDialogContent.innerHTML = `
      <button class="modal-close" type="button" data-close-dialog aria-label="關閉帳號資訊">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="account-profile">
        <span class="account-profile-avatar">${escapeHtml(initialOf(user.name))}</span>
        <div>
          <p class="eyebrow"><span></span>你的拾光帳號</p>
          <h2 id="accountTitle">${escapeHtml(user.name)}</h2>
          <p>${escapeHtml(user.email)}</p>
        </div>
      </div>
      <div class="account-stats">
        <div><strong>${listingTotal}</strong><span>刊登</span></div>
        <div><strong>${favoriteTotal}</strong><span>收藏</span></div>
        <div><strong>${purchaseTotal}</strong><span>購買</span></div>
      </div>
      <p class="account-note">加入於 ${formatDate(user.createdAt)}。此帳號的收藏、刊登與交易紀錄保存在這台裝置的瀏覽器中。</p>
      <div class="account-actions">
        <button class="primary-button" type="button" data-logout>登出帳號</button>
        <button class="secondary-button" type="button" data-close-dialog>關閉</button>
      </div>
    `;
    return;
  }

  const isRegister = state.accountMode === 'register';
  const form = isRegister
    ? `
      <form id="registerForm" novalidate>
        <label class="field">
          <span>顯示名稱 <b>*</b></span>
          <input name="name" type="text" maxlength="20" autocomplete="nickname" placeholder="例如：小光" required>
        </label>
        <label class="field">
          <span>電子郵件 <b>*</b></span>
          <input name="email" type="email" autocomplete="email" placeholder="you@example.com" required>
        </label>
        <label class="field">
          <span>密碼 <b>*</b><small>至少 6 個字</small></span>
          <input name="password" type="password" minlength="6" autocomplete="new-password" placeholder="設定一組密碼" required>
        </label>
        <label class="field">
          <span>確認密碼 <b>*</b></span>
          <input name="confirmPassword" type="password" minlength="6" autocomplete="new-password" placeholder="再輸入一次密碼" required>
        </label>
        <p class="form-error" id="accountError" role="alert" hidden></p>
        <div class="form-actions">
          <button class="primary-button" type="submit">建立帳號</button>
        </div>
      </form>
    `
    : `
      <form id="loginForm" novalidate>
        <label class="field">
          <span>電子郵件 <b>*</b></span>
          <input name="email" type="email" autocomplete="email" placeholder="you@example.com" required>
        </label>
        <label class="field">
          <span>密碼 <b>*</b></span>
          <input name="password" type="password" autocomplete="current-password" placeholder="輸入你的密碼" required>
        </label>
        <p class="form-error" id="accountError" role="alert" hidden></p>
        <div class="form-actions">
          <button class="primary-button" type="submit">登入</button>
        </div>
      </form>
    `;

  els.accountDialogContent.innerHTML = `
    <button class="modal-close" type="button" data-close-dialog aria-label="關閉登入視窗">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    </button>
    <span class="dialog-icon account-icon" aria-hidden="true">${userIcon()}</span>
    <div class="modal-heading">
      <p class="eyebrow"><span></span>${isRegister ? '第一次來到拾光' : '歡迎回到拾光'}</p>
      <h2 id="accountTitle">${isRegister ? '建立你的帳號' : '登入帳號'}</h2>
      <p>${isRegister ? '註冊後即可收藏、出價與刊登自己的好物。' : '登入後繼續收藏、出價與管理你的刊登。'}</p>
    </div>
    <div class="account-tabs" role="tablist" aria-label="帳號操作">
      <button class="account-tab${isRegister ? '' : ' active'}" type="button" role="tab" aria-selected="${!isRegister}" data-account-mode="login">登入</button>
      <button class="account-tab${isRegister ? ' active' : ''}" type="button" role="tab" aria-selected="${isRegister}" data-account-mode="register">註冊</button>
    </div>
    ${form}
    <p class="account-switch">
      ${isRegister ? '已經有帳號了？' : '還沒有帳號？'}
      <button type="button" data-account-mode="${isRegister ? 'login' : 'register'}">${isRegister ? '前往登入' : '立即註冊'}</button>
    </p>
  `;
}

function openAccountDialog(mode = 'login') {
  state.accountMode = mode;
  renderAccountDialog();
  if (!els.accountDialog.open) els.accountDialog.showModal();
}

async function hashPassword(email, password) {
  const value = `shiguang:${String(email).trim().toLowerCase()}:${password}`;
  if (window.crypto && window.crypto.subtle) {
    const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(index);
  }
  return `fallback-${(hash >>> 0).toString(16)}`;
}

function claimLegacyData(userId) {
  let changed = false;
  state.products.forEach((product) => {
    if (!product.ownerId && product.mine) {
      product.ownerId = userId;
      delete product.mine;
      changed = true;
    }
  });
  [state.purchases, state.offers, state.favorites, state.notifications].forEach((records) => {
    records.forEach((record) => {
      if (!record.userId) {
        record.userId = userId;
        changed = true;
      }
    });
  });
  return changed;
}

async function submitLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const errorBox = document.getElementById('accountError');
  if (errorBox) errorBox.hidden = true;

  if (!email || !password) {
    accountError('請輸入電子郵件與密碼。');
    return;
  }

  const user = state.users.find((item) => item.email.toLowerCase() === email);
  if (!user) {
    accountError('電子郵件或密碼不正確。');
    return;
  }

  const passwordHash = await hashPassword(email, password);
  if (user.passwordHash !== passwordHash) {
    accountError('電子郵件或密碼不正確。');
    return;
  }

  state.sessionUserId = user.id;
  persist();
  closeDialog(els.accountDialog);
  state.accountMode = 'login';
  renderAll();
  showToast(`歡迎回來，${user.name}。`);
}

async function submitRegister(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');
  const errorBox = document.getElementById('accountError');
  if (errorBox) errorBox.hidden = true;

  if (name.length < 2) {
    accountError('顯示名稱至少需要 2 個字。');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    accountError('請輸入有效的電子郵件格式。');
    return;
  }
  if (password.length < 6) {
    accountError('密碼至少需要 6 個字。');
    return;
  }
  if (password !== confirmPassword) {
    accountError('兩次輸入的密碼不一致。');
    return;
  }
  if (state.users.some((user) => user.email.toLowerCase() === email)) {
    accountError('這個電子郵件已經註冊過了。');
    return;
  }

  const user = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    passwordHash: await hashPassword(email, password),
    createdAt: new Date().toISOString(),
  };

  state.users.push(user);
  state.sessionUserId = user.id;
  claimLegacyData(user.id);
  persist();
  closeDialog(els.accountDialog);
  state.accountMode = 'login';
  renderAll();
  showToast(`帳號建立完成，歡迎你，${user.name}。`);
}

function logout() {
  const user = getCurrentUser();
  state.sessionUserId = null;
  persist();
  closeDialog(els.accountDialog);
  state.accountMode = 'login';
  renderAll();
  showToast(user ? `已登出 ${user.name} 的帳號。` : '已登出。');
}

function renderCategories() {
  els.categoryFilters.innerHTML = CATEGORIES.map((category) => {
    const active = state.category === category ? ' active' : '';
    return `<button class="category-chip${active}" type="button" data-category="${escapeHtml(category)}" aria-pressed="${state.category === category}">${escapeHtml(category)}</button>`;
  }).join('');
}

function getVisibleProducts() {
  const search = state.search.trim().toLowerCase();
  const visible = state.products.filter((product) => {
    const matchesCategory = state.category === '全部' || product.category === state.category;
    const haystack = [
      product.title,
      product.description,
      product.category,
      product.seller,
      product.location,
      product.condition,
    ].join(' ').toLowerCase();
    return matchesCategory && (!search || haystack.includes(search));
  });

  return visible.sort((a, b) => {
    if (state.sort === 'price-asc') return a.price - b.price;
    if (state.sort === 'price-desc') return b.price - a.price;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function renderProducts() {
  const products = getVisibleProducts();
  els.resultCount.textContent = `共 ${products.length} 件好物`;
  els.emptyState.hidden = products.length > 0;

  els.grid.innerHTML = products.map((product, index) => {
    const originalPrice = Number(product.originalPrice) > 0
      ? `<span class="original-price">NT$ ${formatMoney(product.originalPrice)}</span>`
      : '';
    const soldClass = product.sold ? ' is-sold' : '';
    const soldRibbon = product.sold ? '<span class="sold-ribbon">已售出</span>' : '';
    const mineBadge = isMine(product) ? '<span class="mine-badge">我的刊登</span>' : '';
    const favorite = Boolean(findFavorite(product.id));
    const offer = pendingOfferFor(product.id);
    const favoriteButton = (!product.sold || favorite)
      ? `
        <button class="favorite-button${favorite ? ' active' : ''}" type="button" data-favorite-id="${escapeHtml(product.id)}" aria-label="${favorite ? '取消收藏' : '收藏'} ${escapeHtml(product.title)}" aria-pressed="${favorite}">
          ${favoriteIcon()}
        </button>
      `
      : '';
    const offerBadge = offer ? `<span class="offer-badge">已出價 NT$ ${formatMoney(offer.amount)}</span>` : '';
    const delay = Math.min(index * 45, 360);

    return `
      <article class="product-card${soldClass}" data-product-id="${escapeHtml(product.id)}" tabindex="0" role="button" aria-label="查看 ${escapeHtml(product.title)}" style="--delay: ${delay}ms">
        <div class="product-media">
          <img src="${escapeHtml(productImage(product))}" alt="${escapeHtml(product.title)}" loading="lazy">
          <span class="product-condition">${escapeHtml(product.condition)}</span>
          ${mineBadge}
          ${soldRibbon}
          ${offerBadge}
          ${favoriteButton}
        </div>
        <div class="product-body">
          <div class="product-meta">
            <span>${escapeHtml(product.category)}</span>
            <span>${timeAgo(product.createdAt)}</span>
          </div>
          <h3>${escapeHtml(product.title)}</h3>
          <div class="product-price-row">
            <span class="product-price"><small>NT$</small>${formatMoney(product.price)}</span>
            ${originalPrice}
          </div>
          <div class="seller-row">
            <span class="card-avatar">${escapeHtml(initialOf(product.seller))}</span>
            <span>${escapeHtml(product.seller)}</span>
            <span class="seller-location">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" stroke="currentColor" stroke-width="1.8"/>
                <circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.8"/>
              </svg>
              ${escapeHtml(product.location)}
            </span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function updateSummary() {
  const available = state.products.filter((product) => !product.sold).length;
  const sold = state.products.filter((product) => product.sold).length;
  const purchases = recordsForCurrentUser(state.purchases);
  const offers = recordsForCurrentUser(state.offers).filter((offer) => offer.status === 'pending');
  const favorites = recordsForCurrentUser(state.favorites);
  const notifications = recordsForCurrentUser(state.notifications);
  const listings = state.products.filter(isMine);
  const unread = notifications.filter((notification) => !notification.read).length;

  els.statAvailable.textContent = available;
  els.statSold.textContent = sold;
  els.statCategories.textContent = CATEGORIES.length - 1;
  els.purchaseCount.textContent = purchases.length;
  els.offerCount.textContent = offers.length;
  els.favoriteCount.textContent = favorites.length;
  els.listingCount.textContent = listings.length;
  els.tradeBadge.textContent = purchases.length;
  els.tradeBadge.hidden = purchases.length === 0;
  els.notificationBadge.textContent = unread;
  els.notificationBadge.hidden = unread === 0;
  renderAccountButton();
}

function renderAll() {
  renderCategories();
  renderProducts();
  updateSummary();
  if (els.tradesDialog.open) renderTrades();
  if (els.notificationsDialog.open) renderNotifications();
}

function openProduct(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;

  const originalPrice = Number(product.originalPrice) > 0
    ? `<span class="detail-original">原價 NT$ ${formatMoney(product.originalPrice)}</span>`
    : '';
  const favorite = Boolean(findFavorite(product.id));
  const pendingOffer = pendingOfferFor(product.id);
  const favoriteButton = (!product.sold || favorite)
    ? `
      <button class="detail-favorite${favorite ? ' active' : ''}" type="button" data-favorite-id="${escapeHtml(product.id)}" aria-pressed="${favorite}">
        ${favoriteIcon()}
        <span>${favorite ? '已收藏' : '收藏'}</span>
      </button>
    `
    : '';
  let actions = '';

  if (product.sold) {
    actions = '<div class="sold-detail-note">這件好物已經找到新主人了，再逛逛其他商品吧。</div>';
  } else if (isMine(product)) {
    actions = `
      <div class="detail-secondary-actions">
        <button class="secondary-button" type="button" data-edit-price="${escapeHtml(product.id)}">調整價格</button>
        <button class="secondary-button" type="button" data-remove-listing="${escapeHtml(product.id)}">下架商品</button>
      </div>
      <p class="detail-hint">這是你的刊登商品，買家可透過面交與你完成交易。</p>
    `;
  } else {
    actions = `
      ${pendingOffer ? `
        <div class="offer-note">
          <span>你的出價</span>
          <strong>NT$ ${formatMoney(pendingOffer.amount)}</strong>
          <small>等待賣家回覆</small>
        </div>
      ` : ''}
      <button class="primary-button" type="button" data-buy-id="${escapeHtml(product.id)}">
        立即購買
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="detail-secondary-actions">
        <button class="secondary-button" type="button" data-offer-id="${escapeHtml(product.id)}">${pendingOffer ? '修改出價' : '我要出價'}</button>
        ${pendingOffer ? `<button class="secondary-button subtle-button" type="button" data-withdraw-offer="${escapeHtml(pendingOffer.id)}">撤回出價</button>` : ''}
      </div>
      <p class="detail-hint">確認購買後，商品會標示為已售出。</p>
    `;
  }

  els.productDialogContent.innerHTML = `
    <button class="modal-close" type="button" data-close-dialog aria-label="關閉商品詳細資訊">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    </button>
    <div class="detail-layout">
      <div class="detail-media">
        <img src="${escapeHtml(productImage(product))}" alt="${escapeHtml(product.title)}">
        <span class="detail-condition">${escapeHtml(product.condition)}</span>
      </div>
      <div class="detail-body">
        <span class="detail-category">${escapeHtml(product.category)} · 二手好物</span>
        <h2 id="productDialogTitle">${escapeHtml(product.title)}</h2>
        <div class="detail-price-row">
          <span class="detail-price"><small>NT$</small>${formatMoney(product.price)}</span>
          ${originalPrice}
          ${favoriteButton}
        </div>
        <div class="detail-meta">
          <span>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" stroke="currentColor" stroke-width="1.8"/>
              <circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.8"/>
            </svg>
            ${escapeHtml(product.location)}
          </span>
          <span>${escapeHtml(product.condition)}</span>
          <span>${timeAgo(product.createdAt)}刊登</span>
        </div>
        <p class="detail-description">${escapeHtml(product.description)}</p>
        <div class="detail-seller">
          <span class="card-avatar">${escapeHtml(initialOf(product.seller))}</span>
          <span class="detail-seller-info">
            <strong>${escapeHtml(product.seller)}</strong>
            <span>${isMine(product) ? '你的賣場' : '賣家'}</span>
          </span>
          <span class="detail-seller-time">${formatDate(product.createdAt)}</span>
        </div>
        <div class="detail-actions">${actions}</div>
      </div>
    </div>
  `;

  if (!els.productDialog.open) els.productDialog.showModal();
}
function openCheckout(productId) {
  const product = state.products.find((item) => item.id === productId);
  const user = requireUser('登入後才能購買商品。');
  if (!product || product.sold || !user || isMine(product)) return;

  state.checkoutId = productId;

  els.checkoutDialogContent.innerHTML = `
    <button class="modal-close" type="button" data-close-dialog aria-label="關閉購買確認">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    </button>
    <span class="checkout-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M5 8.5h14l-1 11H6l-1-11Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
        <path d="M9 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
      </svg>
    </span>
    <h2 id="checkoutTitle">確認購買</h2>
    <p class="checkout-subtitle">確認後，這件好物就會保留給你，並標示為已售出。</p>
    <div class="checkout-item">
      <img src="${escapeHtml(productImage(product))}" alt="${escapeHtml(product.title)}">
      <div class="checkout-item-info">
        <strong>${escapeHtml(product.title)}</strong>
        <span>${escapeHtml(product.seller)} · ${escapeHtml(product.location)}</span>
      </div>
      <span class="checkout-item-price">NT$ ${formatMoney(product.price)}</span>
    </div>
    <div class="checkout-summary">
      <div><span>商品金額</span><span>NT$ ${formatMoney(product.price)}</span></div>
      <div><span>面交方式</span><span>當面付款</span></div>
      <div class="checkout-total"><span>合計</span><strong>NT$ ${formatMoney(product.price)}</strong></div>
    </div>
    <div class="checkout-note">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3 5 6v5c0 4.6 2.8 8.1 7 10 4.2-1.9 7-5.4 7-10V6l-7-3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>這是展示網站，確認購買後不會產生實際付款；請與賣家相約面交，當面確認商品狀況。</span>
    </div>
    <div class="checkout-actions">
      <button class="secondary-button" type="button" data-close-dialog>再想想</button>
      <button class="primary-button" type="button" data-confirm-purchase>確認購買</button>
    </div>
  `;

  if (!els.checkoutDialog.open) els.checkoutDialog.showModal();
}

function purchaseProduct(productId) {
  const product = state.products.find((item) => item.id === productId);
  const user = requireUser('登入後才能購買商品。');
  if (!product || !user || isMine(product)) return;
  if (product.sold) {
    closeDialog(els.checkoutDialog);
    renderAll();
    showToast('這件商品已售出，看看其他好物吧。');
    return;
  }

  product.sold = true;
  product.soldAt = new Date().toISOString();
  state.offers = state.offers.filter((offer) => offer.productId !== product.id);
  state.purchases.unshift({
    id: `purchase-${Date.now()}`,
    userId: user.id,
    productId: product.id,
    title: product.title,
    price: product.price,
    image: productImage(product),
    seller: product.seller,
    location: product.location,
    purchasedAt: new Date().toISOString(),
  });

  persist();
  state.checkoutId = null;
  closeDialog(els.checkoutDialog);
  renderAll();
  showToast(`已購買「${product.title}」，記得與賣家相約面交。`);
}

function removeListing(productId) {
  const product = state.products.find((item) => item.id === productId);
  const user = getCurrentUser();
  if (!product || !user || !isMine(product) || product.sold) return;
  if (!window.confirm(`確定要下架「${product.title}」嗎？`)) return;

  state.products = state.products.filter((item) => item.id !== productId);
  state.favorites = state.favorites.filter((favorite) => favorite.productId !== productId);
  state.offers = state.offers.filter((offer) => offer.productId !== productId);
  state.notifications = state.notifications.filter((notification) => notification.productId !== productId);
  persist();
  closeDialog(els.productDialog);
  renderAll();
  showToast('商品已下架。');
}

function removeFavorite(productId) {
  const exists = findFavorite(productId);
  const user = getCurrentUser();
  if (!exists || !user) return;
  state.favorites = state.favorites.filter((favorite) => favorite.userId !== user.id || favorite.productId !== productId);
  persist();
  renderAll();
  if (els.productDialog.open) openProduct(productId);
  showToast('已取消收藏。');
}

function openOfferDialog(productId) {
  const product = state.products.find((item) => item.id === productId);
  const user = requireUser('登入後才能向賣家出價。');
  if (!product || !user || isMine(product) || product.sold) return;

  const pendingOffer = pendingOfferFor(productId);
  state.offerProductId = productId;
  closeDialog(els.productDialog);
  closeDialog(els.tradesDialog);

  els.offerDialogContent.innerHTML = `
    <button class="modal-close" type="button" data-close-dialog aria-label="關閉出價視窗">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    </button>
    <span class="dialog-icon offer-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="m9 8 7 7M6.5 17.5l-2 2M14.5 4.5l5 5M4 20l4.5-1.5L19 8a2.1 2.1 0 0 0-3-3l-9.5 9.5L4 20Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    <h2 id="offerTitle">${pendingOffer ? '修改出價' : '向賣家出價'}</h2>
    <p class="checkout-subtitle">提出你心中的理想價格，等待賣家回覆。</p>
    <div class="checkout-item offer-product">
      <img src="${escapeHtml(productImage(product))}" alt="${escapeHtml(product.title)}">
      <div class="checkout-item-info">
        <strong>${escapeHtml(product.title)}</strong>
        <span>${escapeHtml(product.seller)} · ${escapeHtml(product.condition)}</span>
      </div>
      <span class="checkout-item-price">NT$ ${formatMoney(product.price)}</span>
    </div>
    <form id="offerForm" novalidate>
      <label class="field offer-amount-field">
        <span>你的出價 <b>*</b></span>
        <span class="input-with-prefix">
          <i>NT$</i>
          <input name="amount" type="number" min="1" step="1" value="${pendingOffer ? escapeHtml(pendingOffer.amount) : ''}" placeholder="${formatMoney(Math.round(product.price * 0.85))}" required>
        </span>
      </label>
      <label class="field offer-message-field">
        <span>想對賣家說（選填）<small>最多 120 字</small></span>
        <textarea name="message" maxlength="120" rows="3" placeholder="例如：這週末可以面交，請問方便嗎？">${escapeHtml(pendingOffer ? pendingOffer.message : '')}</textarea>
      </label>
      <p class="price-tip">參考：目前售價的 8 至 9 折是常見的出價區間。</p>
      <p class="form-error" id="offerError" role="alert" hidden></p>
      <div class="form-actions">
        <button class="secondary-button" type="button" data-close-dialog>取消</button>
        <button class="primary-button" type="submit">${pendingOffer ? '更新出價' : '送出出價'}</button>
      </div>
    </form>
  `;

  if (!els.offerDialog.open) els.offerDialog.showModal();
}

function submitOffer(event) {
  event.preventDefault();
  const form = event.target;
  const product = state.products.find((item) => item.id === state.offerProductId);
  const user = getCurrentUser();
  const errorBox = document.getElementById('offerError');

  if (!product || !user || product.sold || isMine(product)) {
    if (errorBox) {
      errorBox.textContent = '這件商品目前無法出價。';
      errorBox.hidden = false;
    }
    return;
  }

  const formData = new FormData(form);
  const amount = Number(formData.get('amount'));
  const message = String(formData.get('message') || '').trim();

  if (!Number.isFinite(amount) || amount <= 0) {
    if (errorBox) {
      errorBox.textContent = '請輸入大於 0 的出價金額。';
      errorBox.hidden = false;
    }
    return;
  }

  if (amount >= product.price) {
    if (errorBox) {
      errorBox.textContent = `出價需低於目前售價 NT$ ${formatMoney(product.price)}；若想直接購買，請選「立即購買」。`;
      errorBox.hidden = false;
    }
    return;
  }

  const existing = pendingOfferFor(product.id);
  if (existing) {
    existing.amount = Math.round(amount);
    existing.message = message;
    existing.updatedAt = new Date().toISOString();
  } else {
    state.offers.unshift({
      id: `offer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId: user.id,
      buyerName: user.name,
      productId: product.id,
      title: product.title,
      image: productImage(product),
      seller: product.seller,
      listPrice: product.price,
      amount: Math.round(amount),
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  }

  persist();
  closeDialog(els.offerDialog);
  renderAll();
  showToast(`已出價 NT$ ${formatMoney(amount)}，等待賣家回覆。`);
  window.setTimeout(() => openProduct(product.id), 140);
}

function withdrawOffer(offerId) {
  const user = getCurrentUser();
  if (!user) return;
  const offer = state.offers.find((item) => item.id === offerId && item.userId === user.id);
  if (!offer || offer.status !== 'pending') return;

  state.offers = state.offers.filter((item) => item.id !== offerId);
  persist();
  renderAll();
  if (els.productDialog.open) openProduct(offer.productId);
  showToast('已撤回出價。');
}

function notifyPriceDrop(product, oldPrice, newPrice) {
  let notified = 0;
  state.favorites
    .filter((favorite) => favorite.userId && favorite.productId === product.id)
    .forEach((favorite) => {
      const priceAtFavorite = Number(favorite.priceAtFavorite) || oldPrice;
      const lastNotifiedPrice = Number(favorite.lastNotifiedPrice) || priceAtFavorite;
      if (newPrice < priceAtFavorite && newPrice < lastNotifiedPrice) {
        state.notifications.unshift({
          id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId: favorite.userId,
          productId: product.id,
          title: product.title,
          image: productImage(product),
          oldPrice,
          newPrice,
          createdAt: new Date().toISOString(),
          read: false,
        });
        favorite.lastNotifiedPrice = newPrice;
        notified += 1;
      }
    });
  return notified;
}

function openPriceDialog(productId) {
  const product = state.products.find((item) => item.id === productId);
  const user = requireUser('登入後才能調整商品價格。');
  if (!product || !user || !isMine(product) || product.sold) return;

  state.priceEditId = productId;
  closeDialog(els.productDialog);
  closeDialog(els.tradesDialog);

  els.priceDialogContent.innerHTML = `
    <button class="modal-close" type="button" data-close-dialog aria-label="關閉調價視窗">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    </button>
    <span class="dialog-icon price-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 6.5V4h2.5L20 17.5 17.5 20 4 6.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
        <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/>
      </svg>
    </span>
    <h2 id="priceTitle">調整售價</h2>
    <p class="checkout-subtitle">降價後，收藏這件商品的人會收到通知。</p>
    <div class="price-current">
      <span>目前售價</span>
      <strong>NT$ ${formatMoney(product.price)}</strong>
    </div>
    <form id="priceForm" novalidate>
      <label class="field">
        <span>新售價 <b>*</b></span>
        <span class="input-with-prefix">
          <i>NT$</i>
          <input name="newPrice" type="number" min="1" step="1" value="${escapeHtml(product.price)}" required>
        </span>
      </label>
      <p class="price-tip">${recordsForCurrentUser(state.favorites).some((favorite) => favorite.productId === product.id)
        ? '這件商品目前在你的收藏中，調降價格後會立即產生一則降價通知。'
        : '調降價格後，若有收藏此商品的人，系統會自動發出通知。'}</p>
      <p class="form-error" id="priceError" role="alert" hidden></p>
      <div class="form-actions">
        <button class="secondary-button" type="button" data-close-dialog>取消</button>
        <button class="primary-button" type="submit">儲存新價格</button>
      </div>
    </form>
  `;

  if (!els.priceDialog.open) els.priceDialog.showModal();
}

function submitPriceChange(event) {
  event.preventDefault();
  const form = event.target;
  const product = state.products.find((item) => item.id === state.priceEditId);
  const user = getCurrentUser();
  const errorBox = document.getElementById('priceError');

  if (!product || !user || !isMine(product) || product.sold) return;

  const formData = new FormData(form);
  const newPrice = Math.round(Number(formData.get('newPrice')));

  if (!Number.isFinite(newPrice) || newPrice <= 0) {
    if (errorBox) {
      errorBox.textContent = '請輸入大於 0 的售價。';
      errorBox.hidden = false;
    }
    return;
  }

  if (newPrice === product.price) {
    if (errorBox) {
      errorBox.textContent = '新售價與目前售價相同。';
      errorBox.hidden = false;
    }
    return;
  }

  const oldPrice = product.price;
  product.price = newPrice;
  const notified = newPrice < oldPrice ? notifyPriceDrop(product, oldPrice, newPrice) : 0;

  persist();
  closeDialog(els.priceDialog);
  renderAll();
  showToast(notified > 0
    ? `已調降售價，並通知 ${notified} 位收藏者。`
    : '商品售價已更新。');
}

function markNotificationsRead() {
  let changed = false;
  const user = getCurrentUser();
  if (!user) return;
  state.notifications.forEach((notification) => {
    if (notification.userId === user.id && !notification.read) {
      notification.read = true;
      changed = true;
    }
  });
  if (changed) {
    persist();
    updateSummary();
  }
}

function renderNotifications() {
  const notifications = recordsForCurrentUser(state.notifications);
  if (!notifications.length) {
    els.notificationsContent.innerHTML = `
      <div class="trade-empty notifications-empty">
        <span class="trade-empty-icon">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
            <path d="M10 20a2.2 2.2 0 0 0 4 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
          </svg>
        </span>
        <h3>目前沒有降價通知</h3>
        <p>收藏喜歡的商品，當賣家降價時就會在這裡提醒你。</p>
      </div>
    `;
    return;
  }

  const unread = notifications.filter((notification) => !notification.read).length;
  els.notificationsContent.innerHTML = `
    <div class="notifications-toolbar">
      <span>${unread > 0 ? `${unread} 則未讀通知` : '所有通知都已讀取'}</span>
      <button type="button" data-clear-notifications>清除全部</button>
    </div>
    <div class="notification-list">
      ${notifications.map((notification) => `
        <button class="notification-item${notification.read ? '' : ' unread'}" type="button" data-notification-product="${escapeHtml(notification.productId)}">
          <img src="${escapeHtml(notification.image)}" alt="${escapeHtml(notification.title)}">
          <span class="notification-body">
            <span class="notification-title">
              <strong>${escapeHtml(notification.title)}</strong>
              ${notification.read ? '' : '<i class="notification-dot"></i>'}
            </span>
            <span class="notification-price">
              <s>NT$ ${formatMoney(notification.oldPrice)}</s>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <b>NT$ ${formatMoney(notification.newPrice)}</b>
            </span>
            <span class="notification-time">${timeAgo(notification.createdAt)}</span>
          </span>
        </button>
      `).join('')}
    </div>
  `;
}

function openNotifications() {
  if (!requireUser('登入後才能查看降價通知。')) return;
  renderNotifications();
  if (!els.notificationsDialog.open) els.notificationsDialog.showModal();
}

function renderTrades() {
  els.tradesDialog.querySelectorAll('[data-trade-tab]').forEach((tab) => {
    const active = tab.dataset.tradeTab === state.tradeTab;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });

  const purchases = recordsForCurrentUser(state.purchases);
  const offersForUser = recordsForCurrentUser(state.offers);
  const favoritesForUser = recordsForCurrentUser(state.favorites);

  if (state.tradeTab === 'purchases') {
    if (!purchases.length) {
      els.tradesContent.innerHTML = `
        <div class="trade-empty">
          <span class="trade-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 8.5h14l-1 11H6l-1-11Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
              <path d="M9 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
            </svg>
          </span>
          <h3>還沒有購買紀錄</h3>
          <p>逛一圈，也許會遇見剛好需要的那件好物。</p>
          <button class="primary-button" type="button" data-browse-empty>去逛逛</button>
        </div>
      `;
      return;
    }

    els.tradesContent.innerHTML = `
      <div class="trade-list">
        ${purchases.map((purchase) => `
          <div class="trade-item">
            <img src="${escapeHtml(purchase.image)}" alt="${escapeHtml(purchase.title)}">
            <div class="trade-item-info">
              <strong>${escapeHtml(purchase.title)}</strong>
              <span>${escapeHtml(purchase.seller)} · ${formatDate(purchase.purchasedAt)} 購買</span>
            </div>
            <div class="trade-item-side">
              <span class="trade-item-price">NT$ ${formatMoney(purchase.price)}</span>
              <span class="trade-status">已購買</span>
              <div class="trade-item-actions">
                <button class="trade-mini-button" type="button" data-view-product="${escapeHtml(purchase.productId)}">查看</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    return;
  }

  if (state.tradeTab === 'offers') {
    const offers = offersForUser
      .filter((offer) => offer.status === 'pending')
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

    if (!offers.length) {
      els.tradesContent.innerHTML = `
        <div class="trade-empty">
          <span class="trade-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m9 8 7 7M6.5 17.5l-2 2M14.5 4.5l5 5M4 20l4.5-1.5L19 8a2.1 2.1 0 0 0-3-3l-9.5 9.5L4 20Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <h3>還沒有出價紀錄</h3>
          <p>看到喜歡的商品，可以用心中的理想價格向賣家提出邀請。</p>
          <button class="primary-button" type="button" data-browse-empty>去找好物</button>
        </div>
      `;
      return;
    }

    els.tradesContent.innerHTML = `
      <div class="trade-list">
        ${offers.map((offer) => {
          const product = state.products.find((item) => item.id === offer.productId);
          const unavailable = !product || product.sold;
          return `
            <div class="trade-item">
              <img src="${escapeHtml(offer.image)}" alt="${escapeHtml(offer.title)}">
              <div class="trade-item-info">
                <strong>${escapeHtml(offer.title)}</strong>
                <span>${escapeHtml(offer.seller)} · ${formatDate(offer.updatedAt || offer.createdAt)} 出價</span>
                ${offer.message ? `<span class="trade-message">「${escapeHtml(offer.message)}」</span>` : ''}
              </div>
              <div class="trade-item-side">
                <span class="trade-item-price">NT$ ${formatMoney(offer.amount)}</span>
                <span class="trade-status${unavailable ? ' sold' : ' pending'}">${unavailable ? '商品已售出' : '等待回覆'}</span>
                <div class="trade-item-actions">
                  <button class="trade-mini-button" type="button" data-view-product="${escapeHtml(offer.productId)}">查看</button>
                  ${unavailable ? '' : `<button class="trade-mini-button danger" type="button" data-withdraw-offer="${escapeHtml(offer.id)}">撤回</button>`}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    return;
  }

  if (state.tradeTab === 'favorites') {
    const favorites = favoritesForUser
      .map((favorite) => ({
        ...favorite,
        product: state.products.find((item) => item.id === favorite.productId),
      }))
      .filter((favorite) => favorite.product)
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

    if (!favorites.length) {
      els.tradesContent.innerHTML = `
        <div class="trade-empty">
          <span class="trade-empty-icon">
            ${favoriteIcon()}
          </span>
          <h3>收藏夾還是空的</h3>
          <p>把心動的好物收藏起來，降價時會第一時間通知你。</p>
          <button class="primary-button" type="button" data-browse-empty>收藏第一件好物</button>
        </div>
      `;
      return;
    }

    els.tradesContent.innerHTML = `
      <div class="trade-list">
        ${favorites.map((favorite) => {
          const product = favorite.product;
          const drop = Math.max(0, Number(favorite.priceAtFavorite) - Number(product.price));
          const status = product.sold
            ? '<span class="trade-status sold">已售出</span>'
            : drop > 0
              ? `<span class="trade-status drop">降價 NT$ ${formatMoney(drop)}</span>`
              : '<span class="trade-status">已收藏</span>';
          return `
            <div class="trade-item">
              <img src="${escapeHtml(productImage(product))}" alt="${escapeHtml(product.title)}">
              <div class="trade-item-info">
                <strong>${escapeHtml(product.title)}</strong>
                <span>收藏價 NT$ ${formatMoney(favorite.priceAtFavorite)} · ${formatDate(favorite.addedAt)} 收藏</span>
              </div>
              <div class="trade-item-side">
                <span class="trade-item-price">NT$ ${formatMoney(product.price)}</span>
                ${status}
                <div class="trade-item-actions">
                  <button class="trade-mini-button" type="button" data-view-product="${escapeHtml(product.id)}">查看</button>
                  <button class="trade-mini-button danger" type="button" data-remove-favorite="${escapeHtml(product.id)}">取消</button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    return;
  }

  const listings = state.products
    .filter(isMine)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (!listings.length) {
    els.tradesContent.innerHTML = `
      <div class="trade-empty">
        <span class="trade-empty-icon">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </span>
        <h3>還沒有刊登商品</h3>
        <p>把家中閒置的好物拍下來，為它找到下一位主人。</p>
        <button class="primary-button" type="button" data-open-listing>刊登第一件好物</button>
      </div>
    `;
    return;
  }

  els.tradesContent.innerHTML = `
    <div class="trade-list">
      ${listings.map((product) => `
        <div class="trade-item">
          <img src="${escapeHtml(productImage(product))}" alt="${escapeHtml(product.title)}">
          <div class="trade-item-info">
            <strong>${escapeHtml(product.title)}</strong>
            <span>${escapeHtml(product.location)} · ${formatDate(product.createdAt)} 刊登</span>
          </div>
          <div class="trade-item-side">
            <span class="trade-item-price">NT$ ${formatMoney(product.price)}</span>
            <span class="trade-status${product.sold ? ' sold' : ''}">${product.sold ? '已售出' : '刊登中'}</span>
            <div class="trade-item-actions">
              <button class="trade-mini-button" type="button" data-view-product="${escapeHtml(product.id)}">查看</button>
              ${product.sold ? '' : `
                <button class="trade-mini-button" type="button" data-edit-price="${escapeHtml(product.id)}">調價</button>
                <button class="trade-mini-button danger" type="button" data-remove-listing="${escapeHtml(product.id)}">下架</button>
              `}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
function openTrades(tab = 'purchases') {
  if (!requireUser('登入後才能查看你的交易紀錄。')) return;
  state.tradeTab = tab;
  renderTrades();
  if (!els.tradesDialog.open) els.tradesDialog.showModal();
}

function openListingDialog() {
  if (!requireUser('登入後才能刊登商品。')) return;
  resetListingForm();
  if (!els.listingDialog.open) els.listingDialog.showModal();
}

function resetListingForm() {
  els.listingForm.reset();
  state.pendingImage = null;
  els.uploadEmpty.hidden = false;
  els.uploadPreview.hidden = true;
  els.imagePreview.removeAttribute('src');
  els.imageFileName.textContent = '';
  els.listingError.hidden = true;
  els.listingError.textContent = '';
  els.descCount.textContent = '0';
}

function showListingError(message) {
  els.listingError.textContent = message;
  els.listingError.hidden = false;
}

function closeDialog(dialog) {
  if (dialog && dialog.open) dialog.close();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function scrollToCatalog() {
  document.getElementById('browse').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openListingFromTrades() {
  closeDialog(els.tradesDialog);
  window.setTimeout(() => openListingDialog(), 120);
}

els.grid.addEventListener('click', (event) => {
  const favoriteButton = event.target.closest('[data-favorite-id]');
  if (favoriteButton) {
    event.stopPropagation();
    toggleFavorite(favoriteButton.dataset.favoriteId);
    return;
  }

  const card = event.target.closest('[data-product-id]');
  if (card) openProduct(card.dataset.productId);
});

els.grid.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  if (event.target.closest('[data-favorite-id]')) return;
  const card = event.target.closest('[data-product-id]');
  if (!card) return;
  event.preventDefault();
  openProduct(card.dataset.productId);
});

document.querySelectorAll('[data-open-product]').forEach((trigger) => {
  trigger.addEventListener('click', () => openProduct(trigger.dataset.openProduct));
});

els.categoryFilters.addEventListener('click', (event) => {
  const chip = event.target.closest('[data-category]');
  if (!chip) return;
  state.category = chip.dataset.category;
  renderCategories();
  renderProducts();
});

els.searchInput.addEventListener('input', () => {
  state.search = els.searchInput.value;
  renderProducts();
});

els.sortSelect.addEventListener('change', () => {
  state.sort = els.sortSelect.value;
  renderProducts();
});

els.resetFiltersButton.addEventListener('click', () => {
  state.category = '全部';
  state.search = '';
  state.sort = 'newest';
  els.searchInput.value = '';
  els.sortSelect.value = 'newest';
  renderCategories();
  renderProducts();
});

els.accountButton.addEventListener('click', () => {
  openAccountDialog(getCurrentUser() ? 'profile' : 'login');
});
els.headerTradesButton.addEventListener('click', () => openTrades('purchases'));
els.notificationButton.addEventListener('click', openNotifications);
els.openListingButton.addEventListener('click', openListingDialog);
els.heroListButton.addEventListener('click', openListingDialog);
els.heroBrowseButton.addEventListener('click', scrollToCatalog);

els.accountDialogContent.addEventListener('click', (event) => {
  const modeButton = event.target.closest('[data-account-mode]');
  if (modeButton) {
    state.accountMode = modeButton.dataset.accountMode;
    renderAccountDialog();
    return;
  }
  if (event.target.closest('[data-logout]')) logout();
});

els.accountDialogContent.addEventListener('submit', (event) => {
  if (event.target.id === 'loginForm') submitLogin(event);
  if (event.target.id === 'registerForm') submitRegister(event);
});

els.tradesDialog.querySelectorAll('[data-trade-tab]').forEach((tab) => {
  tab.addEventListener('click', () => {
    state.tradeTab = tab.dataset.tradeTab;
    renderTrades();
  });
});

els.tradesContent.addEventListener('click', (event) => {
  const removeButton = event.target.closest('[data-remove-listing]');
  if (removeButton) {
    removeListing(removeButton.dataset.removeListing);
    return;
  }

  const removeFavoriteButton = event.target.closest('[data-remove-favorite]');
  if (removeFavoriteButton) {
    removeFavorite(removeFavoriteButton.dataset.removeFavorite);
    return;
  }

  const withdrawButton = event.target.closest('[data-withdraw-offer]');
  if (withdrawButton) {
    withdrawOffer(withdrawButton.dataset.withdrawOffer);
    return;
  }

  const priceButton = event.target.closest('[data-edit-price]');
  if (priceButton) {
    openPriceDialog(priceButton.dataset.editPrice);
    return;
  }

  const viewButton = event.target.closest('[data-view-product]');
  if (viewButton) {
    const productId = viewButton.dataset.viewProduct;
    closeDialog(els.tradesDialog);
    window.setTimeout(() => openProduct(productId), 120);
    return;
  }

  if (event.target.closest('[data-browse-empty]')) {
    closeDialog(els.tradesDialog);
    window.setTimeout(scrollToCatalog, 120);
    return;
  }

  if (event.target.closest('[data-open-listing]')) {
    openListingFromTrades();
  }
});

els.productDialogContent.addEventListener('click', (event) => {
  const favoriteButton = event.target.closest('[data-favorite-id]');
  if (favoriteButton) {
    toggleFavorite(favoriteButton.dataset.favoriteId);
    return;
  }

  const buyButton = event.target.closest('[data-buy-id]');
  if (buyButton) {
    const productId = buyButton.dataset.buyId;
    closeDialog(els.productDialog);
    openCheckout(productId);
    return;
  }

  const offerButton = event.target.closest('[data-offer-id]');
  if (offerButton) {
    openOfferDialog(offerButton.dataset.offerId);
    return;
  }

  const withdrawButton = event.target.closest('[data-withdraw-offer]');
  if (withdrawButton) {
    withdrawOffer(withdrawButton.dataset.withdrawOffer);
    return;
  }

  const priceButton = event.target.closest('[data-edit-price]');
  if (priceButton) {
    openPriceDialog(priceButton.dataset.editPrice);
    return;
  }

  const removeButton = event.target.closest('[data-remove-listing]');
  if (removeButton) {
    removeListing(removeButton.dataset.removeListing);
  }
});

els.checkoutDialogContent.addEventListener('click', (event) => {
  if (event.target.closest('[data-confirm-purchase]')) {
    purchaseProduct(state.checkoutId);
  }
});

els.offerDialogContent.addEventListener('submit', (event) => {
  if (event.target.id === 'offerForm') submitOffer(event);
});

els.priceDialogContent.addEventListener('submit', (event) => {
  if (event.target.id === 'priceForm') submitPriceChange(event);
});

els.notificationsContent.addEventListener('click', (event) => {
  if (event.target.closest('[data-clear-notifications]')) {
    const user = getCurrentUser();
    state.notifications = user
      ? state.notifications.filter((notification) => notification.userId !== user.id)
      : state.notifications;
    persist();
    renderNotifications();
    updateSummary();
    return;
  }

  const notification = event.target.closest('[data-notification-product]');
  if (notification) {
    const productId = notification.dataset.notificationProduct;
    closeDialog(els.notificationsDialog);
    window.setTimeout(() => openProduct(productId), 120);
  }
});

els.listingImage.addEventListener('change', async (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('請選擇圖片檔案。');
    event.target.value = '';
    return;
  }

  if (file.size > MAX_IMAGE_BYTES) {
    showToast('圖片大小請小於 1.5 MB。');
    event.target.value = '';
    return;
  }

  try {
    const dataUrl = await readFileAsDataUrl(file);
    state.pendingImage = dataUrl;
    els.imagePreview.src = dataUrl;
    els.imageFileName.textContent = file.name;
    els.uploadEmpty.hidden = true;
    els.uploadPreview.hidden = false;
  } catch (error) {
    console.warn('圖片讀取失敗。', error);
    showToast('圖片讀取失敗，請換一張試試。');
  }
});

els.listingDescription.addEventListener('input', () => {
  els.descCount.textContent = String(els.listingDescription.value.length);
});

els.listingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const user = getCurrentUser();
  if (!user) {
    showListingError('請先登入後再刊登商品。');
    return;
  }
  const formData = new FormData(els.listingForm);
  const title = String(formData.get('title') || '').trim();
  const price = Number(formData.get('price'));
  const originalPrice = Number(formData.get('originalPrice'));
  const category = String(formData.get('category') || '');
  const condition = String(formData.get('condition') || '');
  const location = String(formData.get('location') || '').trim();
  const description = String(formData.get('description') || '').trim();

  if (title.length < 2) {
    showListingError('請輸入至少 2 個字的商品名稱。');
    return;
  }
  if (!Number.isFinite(price) || price <= 0) {
    showListingError('請輸入大於 0 的售價。');
    return;
  }
  if (originalPrice > 0 && originalPrice < price) {
    showListingError('原價不可低於售價。');
    return;
  }
  if (!location) {
    showListingError('請填寫面交地點。');
    return;
  }
  if (description.length < 5) {
    showListingError('請至少用 5 個字描述商品狀況。');
    return;
  }

  const product = {
    id: `listing-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    price: Math.round(price),
    originalPrice: originalPrice > 0 ? Math.round(originalPrice) : null,
    category,
    condition,
    location,
    seller: user.name,
    description,
    image: state.pendingImage || CATEGORY_IMAGES[category] || 'assets/placeholder.svg',
    createdAt: new Date().toISOString(),
    sold: false,
    ownerId: user.id,
  };

  state.products.unshift(product);
  state.category = '全部';
  state.search = '';
  state.sort = 'newest';
  els.searchInput.value = '';
  els.sortSelect.value = 'newest';
  persist();
  closeDialog(els.listingDialog);
  renderAll();
  showToast('商品已刊登，期待它遇見下一位主人。');
  window.setTimeout(scrollToCatalog, 180);
});

document.addEventListener('click', (event) => {
  const closeTrigger = event.target.closest('[data-close-dialog]');
  if (!closeTrigger) return;
  const dialog = closeTrigger.closest('dialog');
  closeDialog(dialog);
});

document.querySelectorAll('dialog.modal').forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
});

els.listingDialog.addEventListener('close', resetListingForm);
els.checkoutDialog.addEventListener('close', () => {
  state.checkoutId = null;
});
els.offerDialog.addEventListener('close', () => {
  state.offerProductId = null;
});
els.priceDialog.addEventListener('close', () => {
  state.priceEditId = null;
});
els.notificationsDialog.addEventListener('close', markNotificationsRead);

window.addEventListener('scroll', () => {
  els.header.classList.toggle('is-scrolled', window.scrollY > 8);
}, { passive: true });

els.currentYear.textContent = String(new Date().getFullYear());
renderAll();
