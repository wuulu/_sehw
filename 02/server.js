const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = __dirname;
const publicDir = path.join(root, 'public');
const dataDir = path.join(root, 'data');
const dbFile = path.join(dataDir, 'db.json');
const port = Number(process.env.PORT) || 3000;

const SESSION_TTL = 1000 * 60 * 60 * 12;
const sessions = new Map();

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (typeof stored !== 'string' || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  try {
    const test = crypto.scryptSync(password, salt, 64).toString('hex');
    const a = Buffer.from(hash, 'hex');
    const b = Buffer.from(test, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function isoDate(offset = 0) {
  const now = new Date();
  now.setDate(now.getDate() + offset);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function isoTime(offsetDays = 0) {
  return new Date(Date.now() + offsetDays * 86400000).toISOString();
}

function seedDb() {
  const id = () => crypto.randomUUID();
  const classes = [
    { id: id(), name: '資工一A', grade: 1 },
    { id: id(), name: '資工一B', grade: 1 },
    { id: id(), name: '資管二A', grade: 2 },
  ];
  const [c101, c102, c201] = classes;

  const makeUser = (data) => ({
    id: id(),
    email: '',
    subject: '',
    classId: null,
    ...data,
    password: hashPassword(data.password),
  });

  const admin = makeUser({ username: 'admin', password: 'admin123', name: '王大明', role: 'admin', email: 'admin@university.edu.tw', subject: '教務處' });
  const t1 = makeUser({ username: 'teacher1', password: 'teach123', name: '陳美玲', role: 'teacher', subject: '資訊工程學系', email: 'meiling@university.edu.tw' });
  const t2 = makeUser({ username: 'teacher2', password: 'teach123', name: '林志豪', role: 'teacher', subject: '應用數學系', email: 'zhihao@university.edu.tw' });
  const t3 = makeUser({ username: 'teacher3', password: 'teach123', name: '王雅婷', role: 'teacher', subject: '外國語文學系', email: 'yating@university.edu.tw' });

  const studentSeeds = [
    ['student1', '李冠廷', c101.id],
    ['student2', '張雅涵', c101.id],
    ['student3', '陳柏宇', c102.id],
    ['student4', '林品妍', c102.id],
    ['student5', '黃子軒', c201.id],
    ['student6', '吳采潔', c201.id],
  ];
  const students = studentSeeds.map(([username, name, classId]) =>
    makeUser({ username, password: 'student123', name, role: 'student', classId })
  );

  const makeCourse = (code, name, teacherId, classId, credits, schedule, room, description) => ({
    id: id(), code, name, teacherId, classId, credits, schedule, room, description,
  });
  const courses = [
    makeCourse('CS101', '計算機概論', t1.id, c101.id, 3, '週一 1-2 節', 'E101', '計算機科學與程式設計基礎'),
    makeCourse('MA101', '微積分（一）', t2.id, c101.id, 4, '週二 3-4 節', 'E101', '極限、微分與積分'),
    makeCourse('EN101', '大學英文', t3.id, c101.id, 2, '週三 1-2 節', 'E101', '學術英文閱讀與溝通'),
    makeCourse('CS102', '程式設計', t1.id, c102.id, 3, '週一 3-4 節', 'E102', '程式邏輯與實作'),
    makeCourse('MA102', '微積分（二）', t2.id, c102.id, 4, '週二 1-2 節', 'E102', '積分技巧與數列'),
    makeCourse('CS201', '資料結構', t1.id, c201.id, 3, '週四 1-2 節', 'E201', '樹狀結構、圖形與演算法'),
  ];

  const enrollments = [];
  courses.forEach((course) => {
    students
      .filter((student) => student.classId === course.classId)
      .forEach((student) => {
        enrollments.push({
          id: id(),
          studentId: student.id,
          courseId: course.id,
          createdAt: isoTime(-30),
        });
      });
  });

  const grades = [];
  const titles = ['小考', '期中考', '期末考'];
  courses.forEach((course, ci) => {
    const roster = students.filter((s) => s.classId === course.classId);
    roster.forEach((student, si) => {
      titles.forEach((title, ti) => {
        grades.push({
          id: id(),
          courseId: course.id,
          studentId: student.id,
          title,
          score: 65 + ((si * 7 + ti * 5 + ci * 3) % 30),
          maxScore: 100,
          date: isoDate(-20 + ti * 7),
        });
      });
    });
  });

  const attendance = [];
  const dates = [isoDate(-9), isoDate(-7), isoDate(-3), isoDate(-1)];
  courses.forEach((course, ci) => {
    const roster = students.filter((s) => s.classId === course.classId);
    dates.forEach((date, di) => {
      roster.forEach((student, si) => {
        let status = 'present';
        if ((si + ci + di) % 11 === 0) status = 'absent';
        else if ((si + ci + di) % 7 === 0) status = 'late';
        else if ((si + ci + di) % 13 === 0) status = 'leave';
        attendance.push({ id: id(), courseId: course.id, studentId: student.id, date, status, note: '' });
      });
    });
  });

  const announcements = [
    { id: id(), title: '期末考週注意事項', content: '本學期期末考將於下週舉行，請同學依教務處公告之考程準時應考，並攜帶學生證。', authorId: admin.id, audience: 'all', createdAt: isoTime(-2) },
    { id: id(), title: '系學會幹部遴選結果', content: '各系系學會幹部已於期初大會完成遴選，請新任幹部於本週五至學生事務處報到。', authorId: t1.id, audience: c101.id, createdAt: isoTime(-1) },
    { id: id(), title: '校內專題競賽報名開跑', content: '校內專題競賽即日起開放報名至月底，歡迎同學組隊參加，優秀作品將代表學校參加全國賽。', authorId: t3.id, audience: 'all', createdAt: isoTime(-0.2) },
  ];

  return {
    users: [admin, t1, t2, t3, ...students],
    classes,
    courses,
    enrollments,
    grades,
    attendance,
    announcements,
  };
}

function loadDb() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (fs.existsSync(dbFile)) {
    try {
      return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    } catch (err) {
      console.error('資料檔損毀，改用種子資料重建：', err.message);
    }
  }
  const db = seedDb();
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf8');
  return db;
}

let db = loadDb();

function saveDb() {
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf8');
}

const DEMO_CLASSES = [
  { name: '資工一A', grade: 1 },
  { name: '資工一B', grade: 1 },
  { name: '資管二A', grade: 2 },
];

const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'admin123', name: '王大明', role: 'admin', email: 'admin@university.edu.tw', subject: '教務處' },
  { username: 'teacher1', password: 'teach123', name: '陳美玲', role: 'teacher', subject: '資訊工程學系', email: 'meiling@university.edu.tw' },
  { username: 'teacher2', password: 'teach123', name: '林志豪', role: 'teacher', subject: '應用數學系', email: 'zhihao@university.edu.tw' },
  { username: 'teacher3', password: 'teach123', name: '王雅婷', role: 'teacher', subject: '外國語文學系', email: 'yating@university.edu.tw' },
  { username: 'student1', password: 'student123', name: '李冠廷', role: 'student', className: '資工一A' },
  { username: 'student2', password: 'student123', name: '張雅涵', role: 'student', className: '資工一A' },
  { username: 'student3', password: 'student123', name: '陳柏宇', role: 'student', className: '資工一B' },
  { username: 'student4', password: 'student123', name: '林品妍', role: 'student', className: '資工一B' },
  { username: 'student5', password: 'student123', name: '黃子軒', role: 'student', className: '資管二A' },
  { username: 'student6', password: 'student123', name: '吳采潔', role: 'student', className: '資管二A' },
];

function ensureEnrollments() {
  if (Array.isArray(db.enrollments)) return;
  db.enrollments = [];
  for (const course of db.courses) {
    const roster = db.users.filter((u) => u.role === 'student' && u.classId === course.classId);
    for (const student of roster) {
      db.enrollments.push({
        id: crypto.randomUUID(),
        studentId: student.id,
        courseId: course.id,
        createdAt: new Date().toISOString(),
      });
    }
  }
  saveDb();
  console.log(`已建立 ${db.enrollments.length} 筆選課紀錄。`);
}

function ensureDemoAccounts() {
  let changed = false;
  if (!Array.isArray(db.enrollments)) db.enrollments = [];
  const classByName = new Map(db.classes.map((c) => [c.name, c]));

  for (const seed of DEMO_CLASSES) {
    if (!classByName.has(seed.name)) {
      const cls = { id: crypto.randomUUID(), name: seed.name, grade: seed.grade };
      db.classes.push(cls);
      classByName.set(cls.name, cls);
      changed = true;
    }
  }

  const usernames = new Set(db.users.map((u) => u.username));
  let added = 0;
  for (const seed of DEMO_ACCOUNTS) {
    if (usernames.has(seed.username)) continue;
    const cls = seed.className ? classByName.get(seed.className) : null;
    const newUser = {
      id: crypto.randomUUID(),
      username: seed.username,
      password: hashPassword(seed.password),
      name: seed.name,
      role: seed.role,
      email: seed.email || '',
      subject: seed.subject || '',
      classId: cls ? cls.id : null,
    };
    db.users.push(newUser);
    if (newUser.role === 'student' && cls) {
      for (const course of db.courses.filter((c) => c.classId === cls.id)) {
        db.enrollments.push({
          id: crypto.randomUUID(),
          studentId: newUser.id,
          courseId: course.id,
          createdAt: new Date().toISOString(),
        });
      }
    }
    usernames.add(seed.username);
    added += 1;
    changed = true;
  }

  if (changed) saveDb();
  if (added) console.log(`已補回 ${added} 個遺失的示範帳號。`);
}

ensureEnrollments();
ensureDemoAccounts();

function fail(status, message) {
  const err = new Error(message);
  err.status = status;
  throw err;
}

function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(fail(413, '請求內容過大'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(fail(400, 'JSON 格式錯誤'));
      }
    });
    req.on('error', (err) => reject(err));
  });
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    email: user.email || '',
    subject: user.subject || '',
    classId: user.classId || null,
  };
}

function currentUser(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() - session.createdAt > SESSION_TTL) {
    sessions.delete(token);
    return null;
  }
  return db.users.find((u) => u.id === session.userId) || null;
}

function requireRole(user, role) {
  if (user.role !== role) fail(403, '權限不足');
}

function requireStaff(user) {
  if (user.role !== 'admin' && user.role !== 'teacher') fail(403, '權限不足');
}

function bootstrapFor(user) {
  const allUsers = db.users.map(publicUser);
  const globalUserMap = new Map(allUsers.map((u) => [u.id, u]));
  const classMap = new Map(db.classes.map((c) => [c.id, c]));
  const courseMap = new Map(db.courses.map((c) => [c.id, c]));
  const enrollmentCounts = new Map();
  for (const enrollment of db.enrollments) {
    enrollmentCounts.set(enrollment.courseId, (enrollmentCounts.get(enrollment.courseId) || 0) + 1);
  }

  let courses = db.courses;
  let classes = db.classes;
  let users = allUsers;
  let enrollments = db.enrollments;
  let grades = db.grades;
  let attendance = db.attendance;
  let announcements = db.announcements;

  if (user.role === 'teacher') {
    courses = db.courses.filter((c) => c.teacherId === user.id);
    const classIds = new Set(courses.map((c) => c.classId));
    const courseIds = new Set(courses.map((c) => c.id));
    enrollments = db.enrollments.filter((e) => courseIds.has(e.courseId));
    const studentIds = new Set(enrollments.map((e) => e.studentId));
    classes = db.classes.filter((c) => classIds.has(c.id));
    users = allUsers.filter((u) => u.id === user.id || (u.role === 'student' && studentIds.has(u.id)));
    grades = db.grades.filter((g) => courseIds.has(g.courseId));
    attendance = db.attendance.filter((a) => courseIds.has(a.courseId));
  } else if (user.role === 'student') {
    enrollments = db.enrollments.filter((e) => e.studentId === user.id);
    const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
    courses = db.courses.filter((c) => enrolledCourseIds.has(c.id));
    classes = db.classes.filter((c) => c.id === user.classId);
    const teacherIds = new Set(courses.map((c) => c.teacherId));
    const enrolledClassIds = new Set(courses.map((c) => c.classId));
    users = allUsers.filter((u) => u.id === user.id || teacherIds.has(u.id));
    grades = db.grades.filter((g) => g.studentId === user.id);
    attendance = db.attendance.filter((a) => a.studentId === user.id);
    announcements = db.announcements.filter(
      (a) => a.audience === 'all' || a.audience === user.classId || enrolledClassIds.has(a.audience)
    );
  }

  const courseName = (courseId) => courseMap.get(courseId)?.name || '—';
  const className = (classId) => classMap.get(classId)?.name || '—';
  const userName = (userId) => globalUserMap.get(userId)?.name || '—';
  const courseView = (course) => ({
    ...course,
    teacherName: userName(course.teacherId),
    className: className(course.classId),
    enrolledCount: enrollmentCounts.get(course.id) || 0,
  });

  return {
    user: publicUser(user),
    users,
    classes: classes.map((c) => ({
      ...c,
      studentCount: db.users.filter((u) => u.role === 'student' && u.classId === c.id).length,
      courseCount: db.courses.filter((co) => co.classId === c.id).length,
    })),
    courses: courses.map(courseView),
    catalog: user.role === 'student'
      ? db.courses.map(courseView).sort((a, b) => String(a.code).localeCompare(String(b.code)))
      : [],
    enrollments,
    grades: grades
      .map((g) => ({
        ...g,
        courseName: courseName(g.courseId),
        studentName: userName(g.studentId),
        className: className(courseMap.get(g.courseId)?.classId),
      }))
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || String(a.title).localeCompare(String(b.title))),
    attendance: attendance
      .map((a) => ({
        ...a,
        courseName: courseName(a.courseId),
        studentName: userName(a.studentId),
      }))
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))),
    announcements: announcements
      .map((a) => ({
        ...a,
        authorName: userName(a.authorId),
        audienceName: a.audience === 'all' ? '全體師生' : className(a.audience),
      }))
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))),
  };
}

async function handleApi(req, res, url) {
  const { method } = req;
  const p = url.pathname;

  try {
    if (p === '/api/health' && method === 'GET') {
      return json(res, 200, { ok: true, time: new Date().toISOString() });
    }

    if (p === '/api/login' && method === 'POST') {
      const body = await readJson(req);
      const username = String(body.username || '').trim();
      const password = String(body.password || '');
      const user = db.users.find((u) => u.username === username);
      if (!user || !verifyPassword(password, user.password)) {
        return json(res, 401, { error: '帳號或密碼錯誤' });
      }
      const token = crypto.randomBytes(24).toString('hex');
      sessions.set(token, { userId: user.id, createdAt: Date.now() });
      return json(res, 200, { token, user: publicUser(user) });
    }

    const user = currentUser(req);
    if (!user) return json(res, 401, { error: '請先登入' });

    if (p === '/api/logout' && method === 'POST') {
      const header = req.headers.authorization || '';
      if (header.startsWith('Bearer ')) sessions.delete(header.slice(7));
      return json(res, 200, { ok: true });
    }

    if (p === '/api/bootstrap' && method === 'GET') {
      return json(res, 200, bootstrapFor(user));
    }

    if (p === '/api/me' && method === 'GET') {
      return json(res, 200, { user: publicUser(user) });
    }

    if (p === '/api/me/password' && method === 'PUT') {
      const body = await readJson(req);
      const current = String(body.currentPassword || '');
      const next = String(body.newPassword || '');
      if (!verifyPassword(current, user.password)) fail(400, '目前密碼不正確');
      if (next.length < 6) fail(400, '新密碼至少 6 個字元');
      user.password = hashPassword(next);
      saveDb();
      return json(res, 200, { ok: true });
    }

    if (p === '/api/enrollments' && method === 'POST') {
      requireRole(user, 'student');
      const body = await readJson(req);
      const course = db.courses.find((c) => c.id === body.courseId);
      if (!course) fail(404, '找不到課程');
      if (db.enrollments.some((e) => e.studentId === user.id && e.courseId === course.id)) {
        fail(409, '您已選修此課程');
      }
      const enrollment = {
        id: crypto.randomUUID(),
        studentId: user.id,
        courseId: course.id,
        createdAt: new Date().toISOString(),
      };
      db.enrollments.push(enrollment);
      saveDb();
      return json(res, 201, { enrollment });
    }

    const enrollmentMatch = p.match(/^\/api\/enrollments\/([^/]+)$/);
    if (enrollmentMatch && method === 'DELETE') {
      requireRole(user, 'student');
      const target = db.enrollments.find((e) => e.id === enrollmentMatch[1]);
      if (!target) fail(404, '找不到選課紀錄');
      if (target.studentId !== user.id) fail(403, '只能退選自己的課程');
      db.enrollments = db.enrollments.filter((e) => e.id !== target.id);
      db.grades = db.grades.filter((g) => !(g.courseId === target.courseId && g.studentId === user.id));
      db.attendance = db.attendance.filter((a) => !(a.courseId === target.courseId && a.studentId === user.id));
      saveDb();
      return json(res, 200, { ok: true });
    }

    if (p === '/api/users' && method === 'POST') {
      requireRole(user, 'admin');
      const body = await readJson(req);
      const username = String(body.username || '').trim();
      const name = String(body.name || '').trim();
      const role = String(body.role || '');
      const password = String(body.password || '');
      if (!username || !name) fail(400, '請填寫姓名與帳號');
      if (!['admin', 'teacher', 'student'].includes(role)) fail(400, '角色不正確');
      if (password.length < 6) fail(400, '密碼至少 6 個字元');
      if (db.users.some((u) => u.username === username)) fail(409, '帳號已存在');
      const classId = role === 'student' ? String(body.classId || '') : null;
      if (role === 'student' && !db.classes.some((c) => c.id === classId)) fail(400, '請選擇班級');
      const newUser = {
        id: crypto.randomUUID(),
        username,
        password: hashPassword(password),
        name,
        role,
        email: String(body.email || '').trim(),
        subject: String(body.subject || '').trim(),
        classId,
      };
      db.users.push(newUser);
      saveDb();
      return json(res, 201, { user: publicUser(newUser) });
    }

    let match = p.match(/^\/api\/users\/([^/]+)$/);
    if (match) {
      requireRole(user, 'admin');
      const target = db.users.find((u) => u.id === match[1]);
      if (!target) fail(404, '找不到使用者');

      if (method === 'PUT') {
        const body = await readJson(req);
        if (body.username && body.username !== target.username) {
          if (db.users.some((u) => u.username === body.username && u.id !== target.id)) fail(409, '帳號已存在');
          target.username = String(body.username).trim();
        }
        if (body.name !== undefined) target.name = String(body.name).trim();
        if (body.email !== undefined) target.email = String(body.email).trim();
        if (body.role && body.role !== target.role) {
          if (target.id === user.id) fail(400, '不可變更自己的角色');
          if (!['admin', 'teacher', 'student'].includes(body.role)) fail(400, '角色不正確');
          target.role = body.role;
        }
        if (body.subject !== undefined) target.subject = String(body.subject).trim();
        if (body.classId !== undefined) target.classId = body.classId || null;
        if (target.role === 'student' && !db.classes.some((c) => c.id === target.classId)) fail(400, '請選擇班級');
        if (target.role !== 'student') target.classId = null;
        if (body.password) {
          if (String(body.password).length < 6) fail(400, '密碼至少 6 個字元');
          target.password = hashPassword(String(body.password));
        }
        saveDb();
        return json(res, 200, { user: publicUser(target) });
      }

      if (method === 'DELETE') {
        if (target.id === user.id) fail(400, '不可刪除自己的帳號');
        if (db.courses.some((c) => c.teacherId === target.id)) fail(409, '此教授仍有授課課程，請先調整課程');
        db.grades = db.grades.filter((g) => g.studentId !== target.id);
        db.attendance = db.attendance.filter((a) => a.studentId !== target.id);
        db.enrollments = db.enrollments.filter((e) => e.studentId !== target.id);
        db.users = db.users.filter((u) => u.id !== target.id);
        saveDb();
        return json(res, 200, { ok: true });
      }
    }

    if (p === '/api/classes' && method === 'POST') {
      requireRole(user, 'admin');
      const body = await readJson(req);
      const name = String(body.name || '').trim();
      const grade = Number(body.grade) || 1;
      if (!name) fail(400, '請輸入班級名稱');
      if (db.classes.some((c) => c.name === name)) fail(409, '班級名稱已存在');
      const cls = { id: crypto.randomUUID(), name, grade };
      db.classes.push(cls);
      saveDb();
      return json(res, 201, { class: cls });
    }

    match = p.match(/^\/api\/classes\/([^/]+)$/);
    if (match) {
      requireRole(user, 'admin');
      const target = db.classes.find((c) => c.id === match[1]);
      if (!target) fail(404, '找不到班級');

      if (method === 'PUT') {
        const body = await readJson(req);
        const name = String(body.name || '').trim();
        if (!name) fail(400, '請輸入班級名稱');
        if (db.classes.some((c) => c.name === name && c.id !== target.id)) fail(409, '班級名稱已存在');
        target.name = name;
        target.grade = Number(body.grade) || target.grade;
        saveDb();
        return json(res, 200, { class: target });
      }

      if (method === 'DELETE') {
        if (db.users.some((u) => u.classId === target.id)) fail(409, '此班級仍有學生，請先調整學生班級');
        if (db.courses.some((c) => c.classId === target.id)) fail(409, '此班級仍有課程，請先刪除課程');
        db.classes = db.classes.filter((c) => c.id !== target.id);
        saveDb();
        return json(res, 200, { ok: true });
      }
    }

    if (p === '/api/courses' && method === 'POST') {
      requireRole(user, 'admin');
      const body = await readJson(req);
      const code = String(body.code || '').trim();
      const name = String(body.name || '').trim();
      const teacher = db.users.find((u) => u.id === body.teacherId && u.role === 'teacher');
      const cls = db.classes.find((c) => c.id === body.classId);
      if (!code || !name) fail(400, '請填寫課程代碼與名稱');
      if (!teacher) fail(400, '請選擇授課教授');
      if (!cls) fail(400, '請選擇班級');
      if (db.courses.some((c) => c.code === code)) fail(409, '課程代碼已存在');
      const course = {
        id: crypto.randomUUID(),
        code,
        name,
        teacherId: teacher.id,
        classId: cls.id,
        credits: Number(body.credits) || 0,
        schedule: String(body.schedule || '').trim(),
        room: String(body.room || '').trim(),
        description: String(body.description || '').trim(),
      };
      db.courses.push(course);
      saveDb();
      return json(res, 201, { course });
    }

    match = p.match(/^\/api\/courses\/([^/]+)$/);
    if (match) {
      requireRole(user, 'admin');
      const target = db.courses.find((c) => c.id === match[1]);
      if (!target) fail(404, '找不到課程');

      if (method === 'PUT') {
        const body = await readJson(req);
        const code = String(body.code || '').trim();
        const name = String(body.name || '').trim();
        const teacher = db.users.find((u) => u.id === body.teacherId && u.role === 'teacher');
        const cls = db.classes.find((c) => c.id === body.classId);
        if (!code || !name) fail(400, '請填寫課程代碼與名稱');
        if (!teacher) fail(400, '請選擇授課教授');
        if (!cls) fail(400, '請選擇班級');
        if (db.courses.some((c) => c.code === code && c.id !== target.id)) fail(409, '課程代碼已存在');
        Object.assign(target, {
          code,
          name,
          teacherId: teacher.id,
          classId: cls.id,
          credits: Number(body.credits) || 0,
          schedule: String(body.schedule || '').trim(),
          room: String(body.room || '').trim(),
          description: String(body.description || '').trim(),
        });
        saveDb();
        return json(res, 200, { course: target });
      }

      if (method === 'DELETE') {
        db.courses = db.courses.filter((c) => c.id !== target.id);
        db.enrollments = db.enrollments.filter((e) => e.courseId !== target.id);
        db.grades = db.grades.filter((g) => g.courseId !== target.id);
        db.attendance = db.attendance.filter((a) => a.courseId !== target.id);
        saveDb();
        return json(res, 200, { ok: true });
      }
    }

    if (p === '/api/grades' && method === 'POST') {
      requireStaff(user);
      const body = await readJson(req);
      const course = db.courses.find((c) => c.id === body.courseId);
      if (!course) fail(404, '找不到課程');
      if (user.role === 'teacher' && course.teacherId !== user.id) fail(403, '無法操作非授課課程');
      const student = db.users.find((u) => u.id === body.studentId && u.role === 'student');
      if (!student) fail(400, '請選擇學生');
      if (!db.enrollments.some((e) => e.courseId === course.id && e.studentId === student.id)) {
        fail(400, '學生尚未選修本課程');
      }
      const title = String(body.title || '').trim();
      if (!title) fail(400, '請輸入評量名稱');
      const score = Number(body.score);
      const maxScore = Number(body.maxScore) || 100;
      if (!Number.isFinite(score) || score < 0) fail(400, '分數不正確');
      if (!Number.isFinite(maxScore) || maxScore <= 0) fail(400, '滿分不正確');
      if (score > maxScore) fail(400, '分數不可超過滿分');
      const grade = {
        id: crypto.randomUUID(),
        courseId: course.id,
        studentId: student.id,
        title,
        score,
        maxScore,
        date: String(body.date || isoDate()),
      };
      db.grades.push(grade);
      saveDb();
      return json(res, 201, { grade });
    }

    match = p.match(/^\/api\/grades\/([^/]+)$/);
    if (match) {
      requireStaff(user);
      const target = db.grades.find((g) => g.id === match[1]);
      if (!target) fail(404, '找不到成績紀錄');
      const course = db.courses.find((c) => c.id === target.courseId);
      if (user.role === 'teacher' && course?.teacherId !== user.id) fail(403, '無法操作非授課課程');

      if (method === 'PUT') {
        const body = await readJson(req);
        if (body.title !== undefined) {
          const title = String(body.title).trim();
          if (!title) fail(400, '請輸入評量名稱');
          target.title = title;
        }
        const score = body.score !== undefined ? Number(body.score) : target.score;
        const maxScore = body.maxScore !== undefined ? Number(body.maxScore) : target.maxScore;
        if (!Number.isFinite(score) || score < 0) fail(400, '分數不正確');
        if (!Number.isFinite(maxScore) || maxScore <= 0) fail(400, '滿分不正確');
        if (score > maxScore) fail(400, '分數不可超過滿分');
        target.score = score;
        target.maxScore = maxScore;
        if (body.date) target.date = String(body.date);
        saveDb();
        return json(res, 200, { grade: target });
      }

      if (method === 'DELETE') {
        db.grades = db.grades.filter((g) => g.id !== target.id);
        saveDb();
        return json(res, 200, { ok: true });
      }
    }

    if (p === '/api/attendance' && method === 'POST') {
      requireStaff(user);
      const body = await readJson(req);
      const course = db.courses.find((c) => c.id === body.courseId);
      if (!course) fail(404, '找不到課程');
      if (user.role === 'teacher' && course.teacherId !== user.id) fail(403, '無法操作非授課課程');
      const date = String(body.date || '');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(400, '日期格式錯誤');
      const records = Array.isArray(body.records) ? body.records : [];
      const statuses = ['present', 'absent', 'late', 'leave'];
      for (const record of records) {
        const student = db.users.find((u) => u.id === record.studentId && u.role === 'student');
        if (!student) continue;
        if (!db.enrollments.some((e) => e.courseId === course.id && e.studentId === student.id)) continue;
        const status = statuses.includes(record.status) ? record.status : 'present';
        const note = String(record.note || '');
        const existing = db.attendance.find(
          (a) => a.courseId === course.id && a.studentId === student.id && a.date === date
        );
        if (existing) {
          existing.status = status;
          existing.note = note;
        } else {
          db.attendance.push({
            id: crypto.randomUUID(),
            courseId: course.id,
            studentId: student.id,
            date,
            status,
            note,
          });
        }
      }
      saveDb();
      return json(res, 200, { ok: true });
    }

    if (p === '/api/announcements' && method === 'POST') {
      requireStaff(user);
      const body = await readJson(req);
      const title = String(body.title || '').trim();
      const content = String(body.content || '').trim();
      const audience = String(body.audience || 'all');
      if (!title || !content) fail(400, '請填寫標題與內容');
      if (audience !== 'all') {
        if (!db.classes.some((c) => c.id === audience)) fail(400, '發布對象不正確');
        if (user.role === 'teacher' && !db.courses.some((c) => c.teacherId === user.id && c.classId === audience)) {
          fail(403, '只能發布公告到自己的授課班級');
        }
      }
      const announcement = {
        id: crypto.randomUUID(),
        title,
        content,
        audience,
        authorId: user.id,
        createdAt: new Date().toISOString(),
      };
      db.announcements.push(announcement);
      saveDb();
      return json(res, 201, { announcement });
    }

    match = p.match(/^\/api\/announcements\/([^/]+)$/);
    if (match && method === 'DELETE') {
      const target = db.announcements.find((a) => a.id === match[1]);
      if (!target) fail(404, '找不到公告');
      if (user.role !== 'admin' && target.authorId !== user.id) fail(403, '只能刪除自己發布的公告');
      db.announcements = db.announcements.filter((a) => a.id !== target.id);
      saveDb();
      return json(res, 200, { ok: true });
    }

    return json(res, 404, { error: '找不到 API' });
  } catch (err) {
    if (err.status) return json(res, err.status, { error: err.message });
    console.error(err);
    return json(res, 500, { error: '伺服器發生錯誤' });
  }
}

function serveStatic(req, res, url) {
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }

  const requested = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.normalize(path.join(publicDir, requested));

  if (filePath !== publicDir && !filePath.startsWith(publicDir + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const contentType = mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  let url;
  try {
    url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    handleApi(req, res, url);
  } else {
    serveStatic(req, res, url);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`連接埠 ${port} 已被其他程式占用，請關閉該程式或改用其他埠：`);
    console.error(`  PowerShell: $env:PORT=3001; npm start`);
    process.exit(1);
  }
  throw err;
});

server.listen(port, () => {
  console.log(`大學校務系統 running at http://localhost:${port}`);
  console.log('示範帳號：admin/admin123、teacher1/teach123、student1/student123');
});
