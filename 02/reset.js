const fs = require('node:fs');
const path = require('node:path');

const dbFile = path.join(__dirname, 'data', 'db.json');
fs.rmSync(dbFile, { force: true });
console.log('已清除 data/db.json。重新執行 npm start 後會建立預設示範帳號與資料。');
