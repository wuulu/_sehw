(function () {
  'use strict';

  const STORAGE_KEY = 'xiaoman-ledger-v1';
  const CURRENCY = 'NT$';

  const svg = (inner) => `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">${inner}</svg>`;

  const ICONS = {
    overview: svg('<rect x="3.5" y="3.5" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.7"/><rect x="13.5" y="3.5" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.7"/><rect x="3.5" y="13.5" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.7"/><rect x="13.5" y="13.5" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.7"/>'),
    transactions: svg('<path d="M7 4v16M7 20l-3-3M7 20l3-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 20V4M17 4l-3 3M17 4l3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
    budget: svg('<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M16 11.5h4v4h-4a2 2 0 1 1 0-4Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'),
    analytics: svg('<path d="M5 20V10M12 20V4M19 20v-7" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>'),
    accounts: svg('<rect x="3" y="6" width="18" height="13" rx="3" stroke="currentColor" stroke-width="1.7"/><path d="M3 10.5h18" stroke="currentColor" stroke-width="1.7"/><circle cx="17" cy="15" r="1.2" fill="currentColor"/>'),
    settings: svg('<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7"/><path d="M19.4 13.2a7.6 7.6 0 0 0 0-2.4l2-1.5-2-3.5-2.3 1a7.6 7.6 0 0 0-2.1-1.2L14.6 3h-4l-.4 2.6a7.6 7.6 0 0 0-2.1 1.2l-2.3-1-2 3.5 2 1.5a7.6 7.6 0 0 0 0 2.4l-2 1.5 2 3.5 2.3-1a7.6 7.6 0 0 0 2.1 1.2l.4 2.6h4l.4-2.6a7.6 7.6 0 0 0 2.1-1.2l2.3 1 2-3.5-2-1.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>'),
    plus: svg('<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
    check: svg('<path d="m5 12 4 4 10-10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'),
    edit: svg('<path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m13.5 6.5 3 3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'),
    trash: svg('<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.5 11v5M13.5 11v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'),
    search: svg('<circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="m16 16 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
    download: svg('<path d="M12 4v11M8 11l4 4 4-4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 20h14" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>'),
    upload: svg('<path d="M12 20V9M8 13l4-4 4 4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 4h14" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>'),
    reset: svg('<path d="M4.5 11a7.5 7.5 0 1 1 2.2 6.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 5.5V11h5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
    sun: svg('<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'),
    moon: svg('<path d="M20 14.5A8 8 0 0 1 9.5 4a8.2 8.2 0 1 0 10.5 10.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'),
    arrowRight: svg('<path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
    spark: svg('<ellipse cx="12" cy="6.5" rx="7" ry="3" stroke="currentColor" stroke-width="1.6"/><path d="M5 6.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" stroke="currentColor" stroke-width="1.6"/><path d="M5 11.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" stroke="currentColor" stroke-width="1.6"/>'),
    food: svg('<path d="M6 3v6M9 3v6M7.5 9v12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M6 9h3" stroke="currentColor" stroke-width="1.7"/><path d="M16.5 3c-1.4 0-2.5 1.6-2.5 4s1.1 4 2.5 4V21" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'),
    transport: svg('<rect x="5" y="4" width="14" height="13" rx="3" stroke="currentColor" stroke-width="1.7"/><path d="M5 11h14" stroke="currentColor" stroke-width="1.7"/><path d="M9 17v2M15 17v2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="9" cy="14" r="1" fill="currentColor"/><circle cx="15" cy="14" r="1" fill="currentColor"/>'),
    shopping: svg('<path d="M6 8h12l1 11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L6 8Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'),
    home: svg('<path d="m4 11 8-7 8 7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 10v10h12V10" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M10 20v-5h4v5" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'),
    fun: svg('<rect x="3" y="7" width="18" height="10" rx="5" stroke="currentColor" stroke-width="1.7"/><path d="M8 10v4M6 12h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="16" cy="11" r="1" fill="currentColor"/><circle cx="18" cy="13" r="1" fill="currentColor"/>'),
    health: svg('<path d="M12 20s-7-4.4-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'),
    study: svg('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5V5.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" stroke="currentColor" stroke-width="1.7"/>'),
    other: svg('<circle cx="6" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="18" cy="12" r="1.4" fill="currentColor"/>'),
    salary: svg('<rect x="3" y="7" width="18" height="13" rx="3" stroke="currentColor" stroke-width="1.7"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="1.7"/><path d="M3 12h18" stroke="currentColor" stroke-width="1.7"/>'),
    bonus: svg('<rect x="4" y="9" width="16" height="11" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M4 13h16M12 9v11" stroke="currentColor" stroke-width="1.7"/><path d="M12 9C10 9 8 8 8 6.5A2 2 0 0 1 11 5c1.5.8 1 4 1 4ZM12 9c2 0 4-1 4-2.5A2 2 0 0 0 13 5c-1.5.8-1 4-1 4Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>'),
    invest: svg('<path d="M4 16.5 9 11l3.5 3.5L20 7" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 7h5v5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>'),
    freelance: svg('<rect x="4" y="5" width="16" height="10" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M2.5 19h19" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>'),
    bank: svg('<path d="m3 9 9-5 9 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 9v8M9 9v8M15 9v8M19 9v8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M3 20h18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'),
    cash: svg('<rect x="3" y="6" width="18" height="12" rx="2.5" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="2.6" stroke="currentColor" stroke-width="1.7"/>'),
    credit: svg('<rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" stroke-width="1.7"/><path d="M3 10h18" stroke="currentColor" stroke-width="1.7"/><path d="M7 15h3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'),
    wallet: svg('<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M16 11.5h4v4h-4a2 2 0 1 1 0-4Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'),
  };

  const icon = (name) => ICONS[name] || ICONS.other;

  const EXPENSE_CATEGORIES = [
    { name: '餐飲', color: '#e2603f', icon: 'food' },
    { name: '交通', color: '#3f7ae0', icon: 'transport' },
    { name: '購物', color: '#b45fd6', icon: 'shopping' },
    { name: '居住', color: '#c98f2e', icon: 'home' },
    { name: '娛樂', color: '#e05a86', icon: 'fun' },
    { name: '健康', color: '#25a37a', icon: 'health' },
    { name: '學習', color: '#4f6bd8', icon: 'study' },
    { name: '其他', color: '#7c8a82', icon: 'other' },
  ];

  const INCOME_CATEGORIES = [
    { name: '薪水', color: '#1c8a5b', icon: 'salary' },
    { name: '獎金', color: '#d6a02f', icon: 'bonus' },
    { name: '投資', color: '#2f8fb3', icon: 'invest' },
    { name: '接案', color: '#8a63d2', icon: 'freelance' },
    { name: '其他收入', color: '#7c8a82', icon: 'other' },
  ];

  const CATEGORY_MAP = {};
  [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].forEach((category) => {
    CATEGORY_MAP[category.name] = category;
  });

  const ACCOUNT_TYPES = {
    bank: { label: '銀行帳戶', color: '#2f7cf6', icon: 'bank' },
    cash: { label: '現金', color: '#e5a13a', icon: 'cash' },
    credit: { label: '信用卡', color: '#8b5cf6', icon: 'credit' },
    ewallet: { label: '電子錢包', color: '#1c8a5b', icon: 'wallet' },
  };

  const NAV_ITEMS = [
    { view: 'overview', label: '總覽', icon: 'overview' },
    { view: 'transactions', label: '交易', icon: 'transactions' },
    { view: 'budgets', label: '預算', icon: 'budget' },
    { view: 'analytics', label: '分析', icon: 'analytics' },
    { view: 'accounts', label: '帳戶', icon: 'accounts' },
    { view: 'settings', label: '設定', icon: 'settings' },
  ];

  const VIEW_META = {
    overview: { title: '總覽', eyebrow: '你的財務儀表板', showMonth: true },
    transactions: { title: '交易明細', eyebrow: '每一筆都清清楚楚', showMonth: false },
    budgets: { title: '預算規劃', eyebrow: '把錢花在重要的事', showMonth: true },
    analytics: { title: '財務分析', eyebrow: '看懂你的消費習慣', showMonth: true },
    accounts: { title: '帳戶管理', eyebrow: '所有資產一目了然', showMonth: false },
    settings: { title: '設定', eyebrow: '打造適合你的記帳方式', showMonth: false },
  };

  const numberFormatter = new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 0 });
  const WEEKDAYS = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

  const state = {
    view: 'overview',
    month: currentMonth(),
    data: loadData(),
    txFilters: { search: '', type: 'all', category: 'all', month: currentMonth() },
    txDraft: { type: 'expense', category: '餐飲' },
    editingId: null,
  };

  let toastTimer = null;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function isoDate(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function monthKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
  }

  function currentMonth() {
    return monthKey(new Date());
  }

  function shiftMonth(key, delta) {
    const [year, month] = key.split('-').map(Number);
    return monthKey(new Date(year, month - 1 + delta, 1));
  }

  function monthLabelText(key) {
    const [year, month] = key.split('-').map(Number);
    return `${year} 年 ${month} 月`;
  }

  function shortMonth(key) {
    return `${Number(key.slice(5, 7))}月`;
  }

  function formatDateShort(date) {
    const parts = date.split('-').map(Number);
    return `${parts[1]}/${parts[2]}`;
  }

  function formatDateLong(date) {
    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return date;
    return `${parsed.getMonth() + 1} 月 ${parsed.getDate()} 日 ${WEEKDAYS[parsed.getDay()]}`;
  }

  function money(value) {
    const amount = Math.round(Number(value) || 0);
    const sign = amount < 0 ? '-' : '';
    return `${sign}${CURRENCY} ${numberFormatter.format(Math.abs(amount))}`;
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function categoryMeta(name) {
    return CATEGORY_MAP[name] || { name, color: '#7c8a82', icon: 'other' };
  }

  function createDemoData() {
    const now = new Date();
    const accounts = [
      { id: 'acc-cash', name: '現金錢包', type: 'cash', initial: 4200 },
      { id: 'acc-bank', name: '玉山銀行', type: 'bank', initial: 128000 },
      { id: 'acc-credit', name: '國泰信用卡', type: 'credit', initial: -8600 },
    ];
    const transactions = [];
    const thisMonth = monthKey(now);

    for (let offset = 4; offset >= 0; offset -= 1) {
      const base = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const key = monthKey(base);
      const maxDay = key === thisMonth
        ? now.getDate()
        : new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();

      const add = (day, type, category, amount, accountId, note) => {
        if (day > maxDay) return;
        const date = `${key}-${pad(day)}`;
        transactions.push({
          id: uid(),
          type,
          category,
          amount,
          accountId,
          date,
          note,
          createdAt: new Date(`${date}T09:00:00`).getTime() + transactions.length,
        });
      };

      add(2, 'expense', '餐飲', 240 + offset * 18, 'acc-cash', '早餐與咖啡');
      add(3, 'expense', '交通', 1280, 'acc-bank', '悠遊卡加值');
      add(5, 'income', '薪水', 55000, 'acc-bank', '月薪入帳');
      add(6, 'expense', '居住', 18000, 'acc-bank', '房租');
      add(9, 'expense', '購物', 1680 + offset * 120, 'acc-credit', '生活用品');
      add(12, 'expense', '餐飲', 1450 + offset * 60, 'acc-credit', '朋友聚餐');
      add(15, 'expense', '娛樂', 650, 'acc-cash', '串流與電影');
      add(18, 'expense', '健康', 900, 'acc-bank', '健身房月費');
      add(21, 'expense', '學習', 1280, 'acc-credit', '線上課程');
      add(24, 'expense', '餐飲', 380 + offset * 25, 'acc-cash', '晚餐');
      add(26, 'expense', '交通', 320, 'acc-cash', '捷運與公車');
      if (offset === 2) add(20, 'income', '獎金', 12000, 'acc-bank', '季度獎金');
      if (offset !== 4 && offset !== 0) add(25, 'income', '接案', 6000 + offset * 500, 'acc-bank', '設計接案');
    }

    return {
      version: 1,
      transactions,
      accounts,
      budgets: { 餐飲: 9000, 交通: 3000, 購物: 5000, 居住: 18000, 娛樂: 2500, 健康: 2000, 學習: 2000 },
      settings: { theme: 'light' },
      waitlist: [],
    };
  }

  function createEmptyData() {
    return {
      version: 1,
      transactions: [],
      accounts: [
        { id: 'acc-cash', name: '現金錢包', type: 'cash', initial: 0 },
        { id: 'acc-bank', name: '銀行帳戶', type: 'bank', initial: 0 },
        { id: 'acc-credit', name: '信用卡', type: 'credit', initial: 0 },
      ],
      budgets: {},
      settings: { theme: state.data.settings.theme === 'dark' ? 'dark' : 'light' },
      waitlist: [],
    };
  }

  function normalizeData(raw) {
    const transactions = (Array.isArray(raw.transactions) ? raw.transactions : [])
      .filter((item) => item && item.date && Number.isFinite(Number(item.amount)))
      .map((item) => ({
        id: String(item.id || uid()),
        type: item.type === 'income' ? 'income' : 'expense',
        category: String(item.category || '其他'),
        amount: Math.abs(Number(item.amount) || 0),
        accountId: String(item.accountId || ''),
        date: String(item.date).slice(0, 10),
        note: String(item.note || ''),
        createdAt: Number(item.createdAt) || 0,
      }));

    const accounts = (Array.isArray(raw.accounts) ? raw.accounts : []).map((item) => ({
      id: String(item.id || `acc-${uid()}`),
      name: String(item.name || '帳戶'),
      type: ACCOUNT_TYPES[item.type] ? item.type : 'bank',
      initial: Number(item.initial) || 0,
    }));

    const budgets = {};
    if (raw.budgets && typeof raw.budgets === 'object') {
      Object.entries(raw.budgets).forEach(([name, value]) => {
        budgets[name] = Math.max(0, Math.round(Number(value) || 0));
      });
    }

    return {
      version: 1,
      transactions,
      accounts,
      budgets,
      settings: { theme: raw.settings && raw.settings.theme === 'dark' ? 'dark' : 'light' },
      waitlist: Array.isArray(raw.waitlist) ? raw.waitlist.filter((item) => typeof item === 'string') : [],
    };
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.transactions) && Array.isArray(parsed.accounts)) {
          return normalizeData(parsed);
        }
      }
    } catch (error) {
      console.warn('無法讀取本機資料，將以範例資料啟動。', error);
    }

    const demo = createDemoData();
    persistData(demo);
    return demo;
  }

  function persistData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data || state.data));
    } catch (error) {
      console.warn('資料儲存失敗。', error);
    }
  }

  function transactionsForMonth(key) {
    return state.data.transactions.filter((item) => item.date.slice(0, 7) === key);
  }

  function sumByType(list, type) {
    return list
      .filter((item) => item.type === type)
      .reduce((total, item) => total + Number(item.amount || 0), 0);
  }

  function monthSummary(key) {
    const list = transactionsForMonth(key);
    return { income: sumByType(list, 'income'), expense: sumByType(list, 'expense'), count: list.length };
  }

  function accountById(id) {
    return state.data.accounts.find((account) => account.id === id) || null;
  }

  function accountBalance(account) {
    return state.data.transactions.reduce((total, item) => {
      if (item.accountId !== account.id) return total;
      return total + (item.type === 'income' ? Number(item.amount) : -Number(item.amount));
    }, Number(account.initial) || 0);
  }

  function totalBalance() {
    return state.data.accounts.reduce((total, account) => total + accountBalance(account), 0);
  }

  function monthAccountFlow(accountId, type, key) {
    return transactionsForMonth(key)
      .filter((item) => item.accountId === accountId && item.type === type)
      .reduce((total, item) => total + Number(item.amount), 0);
  }

  function expenseBreakdown(key) {
    const map = new Map();
    transactionsForMonth(key)
      .filter((item) => item.type === 'expense')
      .forEach((item) => {
        const meta = categoryMeta(item.category);
        const entry = map.get(item.category) || { name: item.category, value: 0, color: meta.color, icon: meta.icon };
        entry.value += Number(item.amount);
        map.set(item.category, entry);
      });
    return [...map.values()].filter((entry) => entry.value > 0).sort((a, b) => b.value - a.value);
  }

  function budgetRows(key) {
    const spentMap = new Map();
    transactionsForMonth(key)
      .filter((item) => item.type === 'expense')
      .forEach((item) => {
        spentMap.set(item.category, (spentMap.get(item.category) || 0) + Number(item.amount));
      });

    const names = EXPENSE_CATEGORIES.map((category) => category.name);
    spentMap.forEach((value, name) => {
      if (!names.includes(name)) names.push(name);
    });

    return names.map((name) => {
      const meta = categoryMeta(name);
      const spent = spentMap.get(name) || 0;
      const budget = Number(state.data.budgets[name] || 0);
      return { name, color: meta.color, icon: meta.icon, spent, budget, ratio: budget > 0 ? spent / budget : 0 };
    });
  }

  function uniqueCategories() {
    const set = new Set([
      ...EXPENSE_CATEGORIES.map((category) => category.name),
      ...INCOME_CATEGORIES.map((category) => category.name),
      ...state.data.transactions.map((item) => item.category),
    ]);
    return [...set];
  }

  function transactionMonths() {
    const set = new Set(state.data.transactions.map((item) => item.date.slice(0, 7)));
    set.add(currentMonth());
    return [...set].sort().reverse();
  }

  function sortTransactions(a, b) {
    return b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0);
  }

  function lastMonths(endKey, count) {
    const months = [];
    for (let index = count - 1; index >= 0; index -= 1) {
      const key = shiftMonth(endKey, -index);
      months.push({ key, label: shortMonth(key), summary: monthSummary(key) });
    }
    return months;
  }

  function niceCeil(value) {
    if (!value || value <= 0) return 1;
    const power = Math.pow(10, Math.floor(Math.log10(value)));
    const fraction = value / power;
    const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
    return nice * power;
  }

  function cashflowChart(months) {
    const width = 560;
    const height = 252;
    const padding = { top: 18, right: 10, bottom: 34, left: 10 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const baseY = padding.top + plotHeight;
    const maxValue = niceCeil(Math.max(1, ...months.flatMap((month) => [month.summary.income, month.summary.expense])));
    const groupWidth = plotWidth / months.length;
    const barWidth = Math.min(20, Math.max(8, groupWidth * 0.22));
    const gap = 6;
    const parts = [];

    for (let line = 1; line <= 3; line += 1) {
      const y = padding.top + plotHeight * (line / 3);
      parts.push(`<line class="grid-line" x1="${padding.left}" x2="${width - padding.right}" y1="${y}" y2="${y}"/>`);
    }

    months.forEach((month, index) => {
      const centerX = padding.left + groupWidth * (index + 0.5);
      const incomeHeight = (month.summary.income / maxValue) * plotHeight;
      const expenseHeight = (month.summary.expense / maxValue) * plotHeight;
      const leftX = centerX - barWidth - gap / 2;
      const rightX = centerX + gap / 2;

      parts.push(`<rect class="bar-income" x="${leftX}" y="${baseY - incomeHeight}" width="${barWidth}" height="${Math.max(2, incomeHeight)}" rx="5"><title>${month.label} 收入 ${money(month.summary.income)}</title></rect>`);
      parts.push(`<rect class="bar-expense" x="${rightX}" y="${baseY - expenseHeight}" width="${barWidth}" height="${Math.max(2, expenseHeight)}" rx="5"><title>${month.label} 支出 ${money(month.summary.expense)}</title></rect>`);
      parts.push(`<text class="axis-label ${month.key === state.month ? 'current' : ''}" x="${centerX}" y="${baseY + 21}" text-anchor="middle">${month.label}</text>`);
    });

    return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="近六個月收支長條圖">${parts.join('')}</svg>`;
  }

  function donutBlock(entries, total) {
    if (!entries.length || total <= 0) {
      return `<div class="empty">
        <span class="empty-icon">${icon('analytics')}</span>
        <strong>這個月還沒有支出</strong>
        <p>記下第一筆支出後，就能看見分類佔比。</p>
      </div>`;
    }

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    const segments = entries.map((entry) => {
      const length = (entry.value / total) * circumference;
      const segment = `<circle class="donut-segment" cx="100" cy="100" r="${radius}" stroke="${entry.color}" stroke-dasharray="${length.toFixed(2)} ${circumference.toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}"/>`;
      offset += length;
      return segment;
    });

    return `<div class="donut-layout">
      <div class="donut-wrap">
        <svg class="donut" viewBox="0 0 200 200" role="img" aria-label="支出分類圓餅圖">
          <circle class="donut-track" cx="100" cy="100" r="${radius}"/>
          ${segments.join('')}
        </svg>
        <div class="donut-center"><small>支出總額</small><strong>${money(total)}</strong></div>
      </div>
      <div class="donut-legend">
        ${entries.map((entry) => `<div class="legend-item">
          <i style="background:${entry.color}"></i>
          <span class="name">${esc(entry.name)}</span>
          <span class="value">${money(entry.value)}</span>
          <span class="percent">${Math.round((entry.value / total) * 100)}%</span>
        </div>`).join('')}
      </div>
    </div>`;
  }

  function changeBadge(current, previous, positiveIsGood) {
    if (!previous) {
      return '<span class="delta neutral">— 無上月資料</span>';
    }
    const change = ((current - previous) / Math.abs(previous)) * 100;
    const isUp = change >= 0;
    const isGood = positiveIsGood ? isUp : !isUp;
    return `<span class="delta ${isGood ? 'good' : 'bad'}">${isUp ? '↑' : '↓'} ${Math.abs(change).toFixed(0)}%<em>較上月</em></span>`;
  }

  function txRow(item, withActions) {
    const meta = categoryMeta(item.category);
    const account = accountById(item.accountId);
    const sign = item.type === 'income' ? '+' : '-';
    return `<div class="tx-row">
      <span class="tx-icon" style="--cat:${meta.color}">${icon(meta.icon)}</span>
      <div class="tx-main">
        <strong>${esc(item.note || item.category)}</strong>
        <small>${esc(item.category)} · ${esc(account ? account.name : '未指定帳戶')}</small>
      </div>
      <div class="tx-meta">
        <time>${formatDateShort(item.date)}</time>
        <span class="tx-amount ${item.type}">${sign}${money(item.amount)}</span>
      </div>
      ${withActions ? `<div class="tx-actions">
        <button class="icon-btn" type="button" data-action="edit-tx" data-id="${esc(item.id)}" aria-label="編輯這筆交易">${icon('edit')}</button>
        <button class="icon-btn danger" type="button" data-action="delete-tx" data-id="${esc(item.id)}" aria-label="刪除這筆交易">${icon('trash')}</button>
      </div>` : '<span></span>'}
    </div>`;
  }

  function emptyState(title, text, actionLabel, action) {
    return `<div class="empty">
      <span class="empty-icon">${icon('spark')}</span>
      <strong>${title}</strong>
      <p>${text}</p>
      ${actionLabel ? `<button class="btn btn-ghost btn-small" type="button" data-action="${action}">${actionLabel}</button>` : ''}
    </div>`;
  }

  function render() {
    const meta = VIEW_META[state.view] || VIEW_META.overview;
    document.getElementById('pageTitle').textContent = meta.title;
    document.getElementById('pageEyebrow').textContent = meta.eyebrow;
    document.getElementById('monthNav').hidden = !meta.showMonth;
    document.getElementById('monthLabel').textContent = monthLabelText(state.month);
    document.querySelectorAll('.nav-btn[data-view]').forEach((button) => {
      button.classList.toggle('active', button.dataset.view === state.view);
    });

    applyTheme();

    const host = document.getElementById('viewHost');
    switch (state.view) {
      case 'transactions':
        host.innerHTML = renderTransactionsView();
        break;
      case 'budgets':
        host.innerHTML = renderBudgetsView();
        break;
      case 'analytics':
        host.innerHTML = renderAnalyticsView();
        break;
      case 'accounts':
        host.innerHTML = renderAccountsView();
        break;
      case 'settings':
        host.innerHTML = renderSettingsView();
        break;
      default:
        host.innerHTML = renderOverview();
        break;
    }

    host.classList.remove('view-enter');
    void host.offsetWidth;
    host.classList.add('view-enter');

    if (state.view === 'transactions') updateTransactionList();
  }

  function renderOverview() {
    const summary = monthSummary(state.month);
    const previous = monthSummary(shiftMonth(state.month, -1));
    const total = totalBalance();
    const net = summary.income - summary.expense;
    const savingsRate = summary.income > 0 ? Math.round((net / summary.income) * 100) : 0;
    const months = lastMonths(state.month, 6);
    const breakdown = expenseBreakdown(state.month);
    const expenseTotal = breakdown.reduce((sum, entry) => sum + entry.value, 0);
    const budgetSnapshot = budgetRows(state.month)
      .filter((row) => row.budget > 0)
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 4);
    const recent = [...state.data.transactions].sort(sortTransactions).slice(0, 6);

    return `<section aria-label="財務總覽">
      <div class="summary-grid">
        <article class="stat-card stat-balance">
          <div class="stat-label"><i></i>總資產</div>
          <div class="stat-value">${money(total)}</div>
          <div class="stat-foot">本月淨流入 <strong>${net >= 0 ? '+' : ''}${money(net)}</strong></div>
        </article>
        <article class="stat-card">
          <div class="stat-label"><i class="income"></i>本月收入</div>
          <div class="stat-value">${money(summary.income)}</div>
          <div class="stat-foot">${changeBadge(summary.income, previous.income, true)}</div>
        </article>
        <article class="stat-card">
          <div class="stat-label"><i class="expense"></i>本月支出</div>
          <div class="stat-value">${money(summary.expense)}</div>
          <div class="stat-foot">${changeBadge(summary.expense, previous.expense, false)}</div>
        </article>
        <article class="stat-card">
          <div class="stat-label"><i class="rate"></i>儲蓄率</div>
          <div class="stat-value">${savingsRate}%</div>
          <div class="stat-foot"><span class="delta neutral">結餘 ${money(net)}</span></div>
        </article>
      </div>

      <div class="dash-grid">
        <article class="panel">
          <div class="panel-head">
            <div class="panel-title"><h2>收支趨勢</h2><p>近六個月每月收入與支出</p></div>
            <div class="legend"><span><i class="income"></i>收入</span><span><i class="expense"></i>支出</span></div>
          </div>
          ${cashflowChart(months)}
        </article>
        <article class="panel">
          <div class="panel-head">
            <div class="panel-title"><h2>支出分類</h2><p>${monthLabelText(state.month)}</p></div>
            <button class="panel-link" type="button" data-view="analytics">完整分析${icon('arrowRight')}</button>
          </div>
          ${donutBlock(breakdown, expenseTotal)}
        </article>
      </div>

      <div class="dash-grid bottom">
        <article class="panel">
          <div class="panel-head">
            <div class="panel-title"><h2>預算進度</h2><p>本月已使用比例</p></div>
            <button class="panel-link" type="button" data-view="budgets">管理預算${icon('arrowRight')}</button>
          </div>
          ${budgetSnapshot.length ? `<div class="budget-list">${budgetSnapshot.map(budgetSnapshotRow).join('')}</div>` : `<div class="empty">
            <span class="empty-icon">${icon('budget')}</span>
            <strong>還沒設定預算</strong>
            <p>替常花的分類設一個上限，月底就不會心驚。</p>
            <button class="btn btn-ghost btn-small" type="button" data-view="budgets">開始設定</button>
          </div>`}
        </article>
        <article class="panel">
          <div class="panel-head">
            <div class="panel-title"><h2>最近交易</h2><p>掌握每一筆流動</p></div>
            <button class="panel-link" type="button" data-view="transactions">查看全部${icon('arrowRight')}</button>
          </div>
          ${recent.length ? `<div class="mini-list">${recent.map((item) => txRow(item, true)).join('')}</div>` : emptyState('還沒有任何交易', '記下第一筆，讓小滿開始替你整理財務。', '新增交易', 'add-tx')}
        </article>
      </div>
    </section>`;
  }

  function budgetSnapshotRow(row) {
    const percent = Math.min(100, Math.round(row.ratio * 100));
    const barClass = row.ratio > 1 ? 'over' : row.ratio >= 0.8 ? 'warn' : '';
    const remaining = row.budget - row.spent;
    return `<div class="budget-row">
      <span class="tx-icon" style="--cat:${row.color}">${icon(row.icon)}</span>
      <div class="budget-info">
        <div class="budget-info-top"><strong>${esc(row.name)}</strong><span><b>${money(row.spent)}</b> / ${money(row.budget)}</span></div>
        <div class="progress"><i class="${barClass}" style="width:${percent}%"></i></div>
        <div class="budget-left">${remaining >= 0 ? `還能用 <b>${money(remaining)}</b>` : `已超出 <b class="negative">${money(-remaining)}</b>`}</div>
      </div>
      <div style="text-align:right"><span class="delta ${row.ratio > 1 ? 'bad' : 'good'}">${Math.round(row.ratio * 100)}%</span></div>
    </div>`;
  }

  function renderTransactionsView() {
    const filters = state.txFilters;
    const typeOptions = [
      option('all', '全部收支', filters.type),
      option('expense', '支出', filters.type),
      option('income', '收入', filters.type),
    ].join('');
    const categoryOptions = [option('all', '全部分類', filters.category)]
      .concat(uniqueCategories().map((name) => option(name, name, filters.category)))
      .join('');
    const monthOptions = [option('all', '全部月份', filters.month)]
      .concat(transactionMonths().map((key) => option(key, monthLabelText(key), filters.month)))
      .join('');

    return `<section aria-label="交易明細">
      <div class="panel toolbar-panel">
        <div class="toolbar">
          <label class="search-field">
            ${icon('search')}
            <input id="txSearch" type="search" placeholder="搜尋備註、分類或帳戶" value="${esc(filters.search)}" autocomplete="off" aria-label="搜尋交易">
          </label>
          <select id="txTypeFilter" aria-label="收支類型">${typeOptions}</select>
          <select id="txCategoryFilter" aria-label="分類">${categoryOptions}</select>
          <select id="txMonthFilter" aria-label="月份">${monthOptions}</select>
        </div>
        <div class="toolbar-foot">
          <span id="txCount">—</span>
          <button class="btn btn-ghost btn-small" type="button" data-action="export-csv">${icon('download')}匯出 CSV</button>
        </div>
      </div>
      <div class="panel tx-list-panel" id="txList"></div>
    </section>`;
  }

  function option(value, label, selected) {
    return `<option value="${esc(value)}"${value === selected ? ' selected' : ''}>${esc(label)}</option>`;
  }

  function updateTransactionList() {
    const list = document.getElementById('txList');
    if (!list) return;

    const filters = state.txFilters;
    const filtered = state.data.transactions
      .filter((item) => {
        if (filters.type !== 'all' && item.type !== filters.type) return false;
        if (filters.category !== 'all' && item.category !== filters.category) return false;
        if (filters.month !== 'all' && item.date.slice(0, 7) !== filters.month) return false;
        if (filters.search) {
          const account = accountById(item.accountId);
          const haystack = `${item.note} ${item.category} ${account ? account.name : ''}`.toLowerCase();
          if (!haystack.includes(filters.search.toLowerCase())) return false;
        }
        return true;
      })
      .sort(sortTransactions);

    const count = document.getElementById('txCount');
    if (count) {
      const income = sumByType(filtered, 'income');
      const expense = sumByType(filtered, 'expense');
      count.textContent = filtered.length
        ? `共 ${filtered.length} 筆 · 收入 ${money(income)} · 支出 ${money(expense)}`
        : '沒有符合條件的交易';
    }

    if (!filtered.length) {
      list.innerHTML = emptyState('找不到符合條件的交易', '換個關鍵字、分類或月份試試看。', '新增交易', 'add-tx');
      return;
    }

    const groups = new Map();
    filtered.forEach((item) => {
      if (!groups.has(item.date)) groups.set(item.date, []);
      groups.get(item.date).push(item);
    });

    list.innerHTML = [...groups.entries()].map(([date, items]) => `<div class="tx-group">
      <div class="tx-date"><strong>${formatDateLong(date)}</strong><span>${items.length} 筆</span></div>
      ${items.map((item) => txRow(item, true)).join('')}
    </div>`).join('');
  }

  function renderBudgetsView() {
    const rows = budgetRows(state.month);
    const budgeted = rows.filter((row) => row.budget > 0);
    const totalBudget = budgeted.reduce((sum, row) => sum + row.budget, 0);
    const totalSpent = budgeted.reduce((sum, row) => sum + row.spent, 0);
    const remaining = totalBudget - totalSpent;
    const percent = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;
    const over = totalBudget > 0 && totalSpent > totalBudget;

    return `<section aria-label="預算規劃">
      <div class="budget-hero">
        <div>
          <p class="eyebrow">${monthLabelText(state.month)}</p>
          <h2>把錢，留給真正重要的事。</h2>
          <p>替每個分類設定上限，花錢時就多一分篤定。</p>
          <div class="budget-total-line" id="budgetHeroLine">
            <span>總預算 <strong>${money(totalBudget)}</strong></span>
            <span>已支出 <strong>${money(totalSpent)}</strong></span>
            <span>${remaining >= 0 ? '還能用' : '超出'} <strong>${money(Math.abs(remaining))}</strong></span>
          </div>
        </div>
        <div class="budget-hero-figures">
          <small id="budgetHeroLabel">${remaining >= 0 ? '本月剩餘' : '本月超出'}</small>
          <strong id="budgetHeroRemain">${money(Math.abs(remaining))}</strong>
          <span id="budgetHeroPct">${percent}% 已使用</span>
        </div>
        <div class="budget-hero-progress"><i id="budgetHeroBar" style="width:${percent}%;${over ? 'background:var(--expense);' : ''}"></i></div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <div class="panel-title"><h2>分類預算</h2><p>輸入每月上限，重新整理後仍會保留</p></div>
        </div>
        <div class="budget-list">${rows.map(budgetEditRow).join('')}</div>
      </div>
    </section>`;
  }

  function budgetEditRow(row) {
    const percent = row.budget > 0 ? Math.round(row.ratio * 100) : 0;
    const barClass = row.ratio > 1 ? 'over' : row.ratio >= 0.8 ? 'warn' : '';
    const remaining = row.budget - row.spent;
    const status = row.budget > 0
      ? `${remaining >= 0 ? '還能用' : '已超出'} <b class="${remaining < 0 ? 'negative' : ''}">${money(Math.abs(remaining))}</b> · ${percent}%`
      : '尚未設定預算，先從右側輸入';

    return `<div class="budget-row" data-budget-row="${esc(row.name)}">
      <span class="tx-icon" style="--cat:${row.color}">${icon(row.icon)}</span>
      <div class="budget-info">
        <div class="budget-info-top"><strong>${esc(row.name)}</strong><span><b>${money(row.spent)}</b> / ${row.budget > 0 ? money(row.budget) : '未設定'}</span></div>
        <div class="progress"><i class="${barClass}" data-budget-bar style="width:${Math.min(100, percent)}%"></i></div>
        <div class="budget-left" data-budget-left>${status}</div>
      </div>
      <label class="budget-input">
        <i>NT$</i>
        <input type="number" min="0" step="100" value="${row.budget > 0 ? row.budget : ''}" placeholder="0" data-budget-input="${esc(row.name)}" aria-label="${esc(row.name)}每月預算">
      </label>
    </div>`;
  }

  function refreshBudgetSummary() {
    const rows = budgetRows(state.month);
    const rowMap = new Map(rows.map((row) => [row.name, row]));

    document.querySelectorAll('[data-budget-row]').forEach((element) => {
      const row = rowMap.get(element.dataset.budgetRow);
      if (!row) return;
      const percent = row.budget > 0 ? Math.round(row.ratio * 100) : 0;
      const bar = element.querySelector('[data-budget-bar]');
      const label = element.querySelector('[data-budget-left]');
      const top = element.querySelector('.budget-info-top span');
      const remaining = row.budget - row.spent;

      if (bar) {
        bar.style.width = `${Math.min(100, percent)}%`;
        bar.className = row.ratio > 1 ? 'over' : row.ratio >= 0.8 ? 'warn' : '';
      }
      if (top) {
        top.innerHTML = `<b>${money(row.spent)}</b> / ${row.budget > 0 ? money(row.budget) : '未設定'}`;
      }
      if (label) {
        label.innerHTML = row.budget > 0
          ? `${remaining >= 0 ? '還能用' : '已超出'} <b class="${remaining < 0 ? 'negative' : ''}">${money(Math.abs(remaining))}</b> · ${percent}%`
          : '尚未設定預算，先從右側輸入';
      }
    });

    const budgeted = rows.filter((row) => row.budget > 0);
    const totalBudget = budgeted.reduce((sum, row) => sum + row.budget, 0);
    const totalSpent = budgeted.reduce((sum, row) => sum + row.spent, 0);
    const remaining = totalBudget - totalSpent;
    const percent = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;
    const over = totalBudget > 0 && totalSpent > totalBudget;

    const remainEl = document.getElementById('budgetHeroRemain');
    const labelEl = document.getElementById('budgetHeroLabel');
    const pctEl = document.getElementById('budgetHeroPct');
    const barEl = document.getElementById('budgetHeroBar');
    const lineEl = document.getElementById('budgetHeroLine');

    if (remainEl) remainEl.textContent = money(Math.abs(remaining));
    if (labelEl) labelEl.textContent = remaining >= 0 ? '本月剩餘' : '本月超出';
    if (pctEl) pctEl.textContent = `${percent}% 已使用`;
    if (barEl) {
      barEl.style.width = `${percent}%`;
      barEl.style.background = over ? 'var(--expense)' : '';
    }
    if (lineEl) {
      lineEl.innerHTML = `<span>總預算 <strong>${money(totalBudget)}</strong></span><span>已支出 <strong>${money(totalSpent)}</strong></span><span>${remaining >= 0 ? '還能用' : '超出'} <strong>${money(Math.abs(remaining))}</strong></span>`;
    }
  }

  function renderAnalyticsView() {
    const months = lastMonths(state.month, 6);
    const breakdown = expenseBreakdown(state.month);
    const expenseTotal = breakdown.reduce((sum, entry) => sum + entry.value, 0);
    const accounts = state.data.accounts.map((account) => {
      const meta = ACCOUNT_TYPES[account.type] || ACCOUNT_TYPES.bank;
      return {
        ...account,
        meta,
        balance: accountBalance(account),
        income: monthAccountFlow(account.id, 'income', state.month),
        expense: monthAccountFlow(account.id, 'expense', state.month),
      };
    });
    const maxBalance = Math.max(1, ...accounts.map((account) => Math.abs(account.balance)));
    const topBreakdown = breakdown.slice(0, 6);

    return `<section aria-label="財務分析">
      <div class="analytics-top">
        <article class="panel">
          <div class="panel-head">
            <div class="panel-title"><h2>收支趨勢</h2><p>近六個月每月收入與支出</p></div>
            <div class="legend"><span><i class="income"></i>收入</span><span><i class="expense"></i>支出</span></div>
          </div>
          ${cashflowChart(months)}
        </article>
        <article class="panel">
          <div class="panel-head">
            <div class="panel-title"><h2>支出分類</h2><p>${monthLabelText(state.month)}</p></div>
          </div>
          ${donutBlock(breakdown, expenseTotal)}
        </article>
      </div>

      <div class="analytics-bottom">
        <article class="panel">
          <div class="panel-head">
            <div class="panel-title"><h2>支出排行</h2><p>這個月把錢花在哪裡</p></div>
          </div>
          ${topBreakdown.length ? `<div class="rank-list">${topBreakdown.map((entry) => {
            const percent = Math.round((entry.value / expenseTotal) * 100);
            return `<div class="rank-item">
              <span class="tx-icon" style="--cat:${entry.color}">${icon(entry.icon)}</span>
              <div class="rank-body">
                <div class="rank-body-top"><span>${esc(entry.name)}</span><b>${percent}%</b></div>
                <div class="progress"><i style="width:${percent}%;background:${entry.color}"></i></div>
              </div>
              <span class="rank-amount">${money(entry.value)}</span>
            </div>`;
          }).join('')}</div>` : `<div class="empty">
            <span class="empty-icon">${icon('analytics')}</span>
            <strong>還沒有支出資料</strong>
            <p>記下幾筆支出，排行就會出現在這裡。</p>
          </div>`}
        </article>

        <article class="panel">
          <div class="panel-head">
            <div class="panel-title"><h2>帳戶分佈</h2><p>目前各帳戶的資產比重</p></div>
          </div>
          ${accounts.length ? `<div class="account-bars">${accounts.map((account) => {
            const percent = Math.round((Math.abs(account.balance) / maxBalance) * 100);
            return `<div class="account-bar-row">
              <div class="account-bar-top"><span>${esc(account.name)}</span><b>${money(account.balance)}</b></div>
              <div class="progress"><i style="width:${percent}%;background:${account.meta.color}"></i></div>
            </div>`;
          }).join('')}</div>` : `<div class="empty">
            <span class="empty-icon">${icon('accounts')}</span>
            <strong>還沒有帳戶</strong>
            <p>建立帳戶後，就能看到資產分佈。</p>
          </div>`}
        </article>
      </div>
    </section>`;
  }

  function renderAccountsView() {
    const total = totalBalance();
    const accounts = state.data.accounts;

    return `<section aria-label="帳戶管理">
      <div class="assets-hero">
        <div>
          <p class="eyebrow">所有帳戶</p>
          <h2>${money(total)}</h2>
          <p>共 ${accounts.length} 個帳戶 · 資料即時更新</p>
        </div>
        <button class="btn" type="button" data-action="add-account">${icon('plus')}新增帳戶</button>
      </div>
      <div class="account-grid">
        ${accounts.map(accountCard).join('')}
        <button class="add-account-card" type="button" data-action="add-account">
          <span>${icon('plus')}</span>
          新增帳戶
        </button>
      </div>
    </section>`;
  }

  function accountCard(account) {
    const meta = ACCOUNT_TYPES[account.type] || ACCOUNT_TYPES.bank;
    const balance = accountBalance(account);
    const income = monthAccountFlow(account.id, 'income', state.month);
    const expense = monthAccountFlow(account.id, 'expense', state.month);

    return `<article class="account-card" style="--acct-color:${meta.color}">
      <div class="account-card-top">
        <span class="tx-icon">${icon(meta.icon)}</span>
        <div style="display:flex;align-items:center;gap:6px">
          <span class="account-type">${meta.label}</span>
          <button class="icon-btn danger" type="button" data-action="delete-account" data-id="${esc(account.id)}" aria-label="刪除 ${esc(account.name)}">${icon('trash')}</button>
        </div>
      </div>
      <h3>${esc(account.name)}</h3>
      <div class="account-balance"${balance < 0 ? ' style="color:var(--expense)"' : ''}>${money(balance)}</div>
      <div class="account-flow">
        <span class="in">本月收入 <b>${money(income)}</b></span>
        <span class="out">本月支出 <b>${money(expense)}</b></span>
      </div>
    </article>`;
  }

  function renderSettingsView() {
    const theme = state.data.settings.theme === 'dark' ? 'dark' : 'light';

    return `<section aria-label="設定">
      <div class="settings-grid">
        <article class="panel">
          <div class="panel-head">
            <div class="panel-title"><h2>外觀</h2><p>選擇喜歡的閱讀節奏</p></div>
          </div>
          <div class="setting-row">
            <div class="setting-info">
              <strong>主題模式</strong>
              <small>淺色適合白天，深色適合夜裡整理帳目。</small>
            </div>
            <div class="segmented">
              <button class="${theme === 'light' ? 'active' : ''}" type="button" data-theme-choice="light">${icon('sun')}淺色</button>
              <button class="${theme === 'dark' ? 'active' : ''}" type="button" data-theme-choice="dark">${icon('moon')}深色</button>
            </div>
          </div>
        </article>

        <article class="panel">
          <div class="panel-head">
            <div class="panel-title"><h2>方案</h2><p>免費版已包含完整記帳功能</p></div>
          </div>
          <div class="plan-summary">
            <div><small>目前使用</small><strong>小滿免費版</strong></div>
            <button class="pro-button" type="button" data-action="open-pro">升級 Pro ${icon('arrowRight')}</button>
          </div>
        </article>

        <article class="panel span-2">
          <div class="panel-head">
            <div class="panel-title"><h2>資料管理</h2><p>你的資料只存在這台裝置的瀏覽器中</p></div>
          </div>
          <div class="setting-row">
            <div class="setting-info">
              <strong>匯出備份</strong>
              <small>下載 JSON 檔案，可在其他裝置或瀏覽器還原。</small>
            </div>
            <div class="setting-actions">
              <button class="btn btn-ghost btn-small" type="button" data-action="export-json">${icon('download')}匯出 JSON</button>
              <button class="btn btn-ghost btn-small" type="button" data-action="export-csv">${icon('download')}匯出 CSV</button>
            </div>
          </div>
          <div class="setting-row">
            <div class="setting-info">
              <strong>匯入備份</strong>
              <small>選擇先前匯出的 JSON 檔案，將取代目前所有資料。</small>
            </div>
            <button class="btn btn-ghost btn-small" type="button" data-action="import-json">${icon('upload')}選擇檔案</button>
          </div>
          <div class="setting-row">
            <div class="setting-info">
              <strong>重新載入範例資料</strong>
              <small>用一組完整的示範帳目，快速看看小滿能做什麼。</small>
            </div>
            <button class="btn btn-ghost btn-small" type="button" data-action="load-demo">${icon('reset')}載入範例</button>
          </div>
          <div class="setting-row">
            <div class="setting-info">
              <strong>清除所有資料</strong>
              <small>刪除交易、預算與帳戶，此動作無法復原。</small>
            </div>
            <button class="btn btn-danger btn-small" type="button" data-action="clear-data">${icon('trash')}清除資料</button>
          </div>
        </article>

        <article class="panel span-2">
          <div class="panel-head">
            <div class="panel-title"><h2>關於小滿</h2></div>
          </div>
          <p class="about-text"><b>小滿記帳</b> 是一個以「剛剛好的富足」為起點的個人財務工具。我們相信記帳不是限制，而是把選擇權拿回自己手上。所有資料預設留在你的瀏覽器，不上傳、不追蹤。<br>版本 1.0.0 · 以 HTML、CSS 與 JavaScript 打造。</p>
        </article>
      </div>
    </section>`;
  }

  function applyTheme() {
    document.documentElement.dataset.theme = state.data.settings.theme === 'dark' ? 'dark' : 'light';
  }

  function renderNav() {
    const markup = NAV_ITEMS.map((item) => `<button class="nav-btn" type="button" data-view="${item.view}">
      ${icon(item.icon)}
      <span>${item.label}</span>
    </button>`).join('');
    document.getElementById('sidebarNav').innerHTML = markup;
    document.getElementById('mobileNav').innerHTML = markup;
  }

  function navigate(view) {
    if (!VIEW_META[view]) return;
    state.view = view;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showTxError(message) {
    const error = document.getElementById('txError');
    error.textContent = message;
    error.hidden = false;
  }

  function setTxType(type) {
    if (state.txDraft.type !== type) {
      state.txDraft.type = type;
      const list = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
      state.txDraft.category = list[0].name;
    }
    renderCategoryGrid();
  }

  function renderCategoryGrid() {
    const list = state.txDraft.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    if (!list.some((category) => category.name === state.txDraft.category)) {
      state.txDraft.category = list[0].name;
    }

    document.getElementById('txCategories').innerHTML = list.map((category) => `<button class="cat-choice ${state.txDraft.category === category.name ? 'selected' : ''}" type="button" data-cat="${esc(category.name)}" style="--cat:${category.color}">
      ${icon(category.icon)}
      <span>${category.name}</span>
    </button>`).join('');

    document.querySelectorAll('[data-tx-type]').forEach((button) => {
      button.classList.toggle('active', button.dataset.txType === state.txDraft.type);
    });
  }

  function populateAccountSelect(selectedId) {
    const select = document.getElementById('txAccount');
    if (!state.data.accounts.length) {
      select.innerHTML = '<option value="">請先新增帳戶</option>';
      return;
    }
    select.innerHTML = state.data.accounts.map((account) => `<option value="${esc(account.id)}"${account.id === selectedId ? ' selected' : ''}>${esc(account.name)}</option>`).join('');
  }

  function openTxDialog(id) {
    const transaction = id ? state.data.transactions.find((item) => item.id === id) : null;
    state.editingId = transaction ? transaction.id : null;

    const type = transaction ? transaction.type : 'expense';
    const defaultCategory = transaction
      ? transaction.category
      : (type === 'expense' ? EXPENSE_CATEGORIES[0].name : INCOME_CATEGORIES[0].name);
    state.txDraft = { type, category: defaultCategory };

    const form = document.getElementById('txForm');
    form.reset();
    document.getElementById('txAmount').value = transaction ? transaction.amount : '';
    document.getElementById('txDate').value = transaction ? transaction.date : isoDate(new Date());
    document.getElementById('txNote').value = transaction ? transaction.note : '';
    document.getElementById('txError').hidden = true;
    document.getElementById('txDialogTitle').textContent = transaction ? '編輯交易' : '新增交易';
    document.getElementById('txDialogEyebrow').textContent = transaction ? '調整這一筆' : '記下這一筆';
    document.getElementById('txSubmit').textContent = transaction ? '儲存變更' : '儲存交易';

    renderCategoryGrid();
    populateAccountSelect(transaction ? transaction.accountId : (state.data.accounts[0] ? state.data.accounts[0].id : ''));

    const dialog = document.getElementById('txDialog');
    if (!dialog.open) dialog.showModal();
    setTimeout(() => document.getElementById('txAmount').focus(), 80);
  }

  function handleTxSubmit(event) {
    event.preventDefault();

    const amount = Math.round(Number(document.getElementById('txAmount').value));
    const date = document.getElementById('txDate').value;
    const accountId = document.getElementById('txAccount').value;
    const note = document.getElementById('txNote').value.trim();
    const category = state.txDraft.category;

    if (!Number.isFinite(amount) || amount <= 0) {
      showTxError('請輸入大於 0 的金額。');
      return;
    }
    if (!date) {
      showTxError('請選擇交易日期。');
      return;
    }
    if (!accountId) {
      showTxError('請先建立至少一個帳戶。');
      return;
    }
    if (!category) {
      showTxError('請選擇一個分類。');
      return;
    }

    const payload = { type: state.txDraft.type, category, amount, accountId, date, note };

    if (state.editingId) {
      const transaction = state.data.transactions.find((item) => item.id === state.editingId);
      if (transaction) {
        Object.assign(transaction, payload);
      } else {
        state.data.transactions.unshift({ id: uid(), createdAt: Date.now(), ...payload });
      }
      toast('交易已更新');
    } else {
      state.data.transactions.unshift({ id: uid(), createdAt: Date.now(), ...payload });
      toast('已記下這一筆');
    }

    state.month = date.slice(0, 7);
    persistData();
    document.getElementById('txDialog').close();
    render();
  }

  function deleteTransaction(id) {
    const transaction = state.data.transactions.find((item) => item.id === id);
    if (!transaction) return;
    if (!window.confirm(`確定刪除「${transaction.note || transaction.category}」這筆交易嗎？`)) return;
    state.data.transactions = state.data.transactions.filter((item) => item.id !== id);
    persistData();
    render();
    toast('交易已刪除');
  }

  function showAccountError(message) {
    const error = document.getElementById('accountError');
    error.textContent = message;
    error.hidden = false;
  }

  function openAccountDialog() {
    const form = document.getElementById('accountForm');
    form.reset();
    document.getElementById('accountError').hidden = true;
    const dialog = document.getElementById('accountDialog');
    if (!dialog.open) dialog.showModal();
    setTimeout(() => form.elements.name.focus(), 80);
  }

  function handleAccountSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const type = ACCOUNT_TYPES[data.get('type')] ? data.get('type') : 'bank';
    const initial = Math.round(Number(data.get('initial')) || 0);

    if (!name) {
      showAccountError('請輸入帳戶名稱。');
      return;
    }
    if (state.data.accounts.some((account) => account.name === name)) {
      showAccountError('已經有同名帳戶，請換一個名稱。');
      return;
    }

    state.data.accounts.push({ id: `acc-${uid()}`, name, type, initial });
    persistData();
    document.getElementById('accountDialog').close();
    render();
    toast('已新增帳戶');
  }

  function deleteAccount(id) {
    const account = state.data.accounts.find((item) => item.id === id);
    if (!account) return;
    if (state.data.transactions.some((item) => item.accountId === id)) {
      toast('此帳戶仍有交易紀錄，請先刪除相關交易');
      return;
    }
    if (!window.confirm(`確定刪除「${account.name}」嗎？`)) return;
    state.data.accounts = state.data.accounts.filter((item) => item.id !== id);
    persistData();
    render();
    toast('帳戶已刪除');
  }

  function csvCell(value) {
    const text = String(value == null ? '' : value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportJSON() {
    downloadFile(
      `xiaoman-ledger-${isoDate(new Date())}.json`,
      JSON.stringify(state.data, null, 2),
      'application/json;charset=utf-8',
    );
    toast('JSON 備份已匯出');
  }

  function exportCSV() {
    const header = ['日期', '類型', '分類', '帳戶', '金額', '備註'];
    const rows = [...state.data.transactions]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item) => {
        const account = accountById(item.accountId);
        return [
          item.date,
          item.type === 'income' ? '收入' : '支出',
          item.category,
          account ? account.name : '',
          item.amount,
          item.note || '',
        ];
      });
    const csv = `\ufeff${[header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
    downloadFile(`xiaoman-ledger-${isoDate(new Date())}.csv`, csv, 'text/csv;charset=utf-8');
    toast('CSV 已匯出');
  }

  function handleImportFile(event) {
    const input = event.target;
    const file = input.files && input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || !Array.isArray(parsed.transactions) || !Array.isArray(parsed.accounts)) {
          throw new Error('invalid');
        }
        if (!window.confirm('匯入後會取代目前所有資料，確定要繼續嗎？')) {
          input.value = '';
          return;
        }
        state.data = normalizeData(parsed);
        state.month = currentMonth();
        state.txFilters.month = currentMonth();
        persistData();
        render();
        toast('資料已匯入');
      } catch (error) {
        window.alert('匯入失敗：檔案格式不正確，請選擇小滿匯出的 JSON 備份。');
      } finally {
        input.value = '';
      }
    };
    reader.onerror = () => {
      window.alert('讀取檔案失敗，請再試一次。');
      input.value = '';
    };
    reader.readAsText(file, 'utf-8');
  }

  function loadDemo() {
    if (!window.confirm('載入範例資料會覆蓋目前所有內容，確定嗎？')) return;
    state.data = createDemoData();
    state.month = currentMonth();
    state.txFilters = { search: '', type: 'all', category: 'all', month: currentMonth() };
    persistData();
    render();
    toast('已載入範例資料');
  }

  function clearData() {
    if (!window.confirm('確定清除所有交易、預算與帳戶嗎？此動作無法復原。')) return;
    state.data = createEmptyData();
    state.month = currentMonth();
    state.txFilters = { search: '', type: 'all', category: 'all', month: currentMonth() };
    persistData();
    render();
    toast('所有資料已清除');
  }

  function setTheme(theme) {
    state.data.settings.theme = theme === 'dark' ? 'dark' : 'light';
    persistData();
    render();
  }

  function toast(message) {
    const element = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    element.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove('show'), 2600);
  }

  function handleWaitlist(event) {
    event.preventDefault();
    const input = document.getElementById('waitlistEmail');
    const message = document.getElementById('waitlistMessage');
    const email = input.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.textContent = '請輸入有效的 Email。';
      message.style.color = 'var(--expense)';
      return;
    }
    if (!state.data.waitlist.includes(email)) {
      state.data.waitlist.push(email);
      persistData();
    }
    message.textContent = '已加入名單！Pro 推出時會第一時間通知你。';
    message.style.color = 'var(--brand)';
    input.value = '';
  }

  function runAction(action, element) {
    switch (action) {
      case 'prev-month':
        state.month = shiftMonth(state.month, -1);
        render();
        break;
      case 'next-month':
        state.month = shiftMonth(state.month, 1);
        render();
        break;
      case 'add-tx':
        openTxDialog();
        break;
      case 'edit-tx':
        openTxDialog(element.dataset.id);
        break;
      case 'delete-tx':
        deleteTransaction(element.dataset.id);
        break;
      case 'add-account':
        openAccountDialog();
        break;
      case 'delete-account':
        deleteAccount(element.dataset.id);
        break;
      case 'open-pro': {
        const dialog = document.getElementById('proDialog');
        if (!dialog.open) dialog.showModal();
        break;
      }
      case 'export-json':
        exportJSON();
        break;
      case 'export-csv':
        exportCSV();
        break;
      case 'import-json':
        document.getElementById('importFile').click();
        break;
      case 'load-demo':
        loadDemo();
        break;
      case 'clear-data':
        clearData();
        break;
      default:
        break;
    }
  }

  function handleClick(event) {
    const viewElement = event.target.closest('[data-view]');
    if (viewElement) {
      event.preventDefault();
      navigate(viewElement.dataset.view);
      return;
    }

    const closeElement = event.target.closest('[data-close-dialog]');
    if (closeElement) {
      event.preventDefault();
      const dialog = closeElement.closest('dialog');
      if (dialog) dialog.close();
      return;
    }

    const actionElement = event.target.closest('[data-action]');
    if (actionElement) {
      event.preventDefault();
      runAction(actionElement.dataset.action, actionElement);
      return;
    }

    const typeElement = event.target.closest('[data-tx-type]');
    if (typeElement) {
      event.preventDefault();
      setTxType(typeElement.dataset.txType);
      return;
    }

    const categoryElement = event.target.closest('[data-cat]');
    if (categoryElement) {
      event.preventDefault();
      state.txDraft.category = categoryElement.dataset.cat;
      renderCategoryGrid();
      return;
    }

    const themeElement = event.target.closest('[data-theme-choice]');
    if (themeElement) {
      event.preventDefault();
      setTheme(themeElement.dataset.themeChoice);
    }
  }

  function handleChange(event) {
    const target = event.target;

    if (target.id === 'txTypeFilter') {
      state.txFilters.type = target.value;
      updateTransactionList();
      return;
    }
    if (target.id === 'txCategoryFilter') {
      state.txFilters.category = target.value;
      updateTransactionList();
      return;
    }
    if (target.id === 'txMonthFilter') {
      state.txFilters.month = target.value;
      updateTransactionList();
      return;
    }
    if (target.matches('[data-budget-input]')) {
      const name = target.dataset.budgetInput;
      state.data.budgets[name] = Math.max(0, Math.round(Number(target.value) || 0));
      persistData();
      refreshBudgetSummary();
    }
  }

  function handleInput(event) {
    if (event.target.id === 'txSearch') {
      state.txFilters.search = event.target.value;
      updateTransactionList();
    }
  }

  function bindEvents() {
    document.addEventListener('click', handleClick);
    document.addEventListener('change', handleChange);
    document.addEventListener('input', handleInput);
    document.getElementById('txForm').addEventListener('submit', handleTxSubmit);
    document.getElementById('accountForm').addEventListener('submit', handleAccountSubmit);
    document.getElementById('waitlistForm').addEventListener('submit', handleWaitlist);
    document.getElementById('importFile').addEventListener('change', handleImportFile);

    document.querySelectorAll('dialog.modal').forEach((dialog) => {
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) dialog.close();
      });
    });
  }

  function init() {
    renderNav();
    applyTheme();
    bindEvents();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
