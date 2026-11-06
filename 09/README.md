# 抽籤所 Lucky Draw

線上網站：<https://wuulu-hw9.yulu96413.workers.dev/>

以 Cloudflare Workers 部署的線上抽籤網站。純前端、免後端，資料自動存在瀏覽器的 `localStorage`。

## 功能

- **多人名單**：每行一個名字，或用逗號、頓號分隔；重複名字自動合併。
- **一次抽出多位**：可設定 1 到 50 位得主。
- **不重複中獎**：預設關閉重複中獎，抽過的人不會再被抽到；也可開啟允許重複。
- **抽籤動畫**：名字快速輪播、得主卡片進場與彩帶效果。
- **公平抽取**：使用瀏覽器 `crypto.getRandomValues` 搭配 Fisher-Yates 洗牌。
- **歷史紀錄**：保留最近 50 次結果，可撤回上一次或清除全部。
- **CSV 匯出**：將中獎紀錄匯出成 Excel 可直接開啟的 UTF-8 CSV。
- **自動儲存**：名單、設定與紀錄都存在此裝置的瀏覽器。
- **響應式版面**：手機與桌機皆可使用。
- **快捷鍵**：`Ctrl + Enter`（macOS 為 `Cmd + Enter`）開始抽籤。

## 本機預覽

需要 Node.js（僅用於本機靜態伺服器，沒有外部套件）。

```bash
npm start
```

開啟 <http://localhost:3000>。若要換 port：

```bash
$env:PORT=8080; npm start   # Windows PowerShell
PORT=8080 npm start         # macOS / Linux
```

也可以直接開啟 `public/index.html`，但建議用本機伺服器以確保瀏覽器儲存行為一致。

## 部署到 Cloudflare Pages

### 方式一：連結 Git 儲存庫（推薦）

1. 進入 Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**。
2. 選擇此儲存庫。
3. 設定：
   - **Root directory**：`09`
   - **Build command**：留空
   - **Build output directory**：`public`
4. 按下 **Save and Deploy**。之後每次 push 都會自動重新部署。

### 方式二：直接上傳資料夾

在 Cloudflare Pages 選擇 **Upload assets**，將 `public/` 資料夾中的檔案上傳即可。`index.html` 必須位於上傳內容的最上層。

### 方式三：使用 Wrangler 部署為 Worker（靜態資源）

已在 `wrangler.jsonc` 設定 `assets.directory` 為 `./public`。

```bash
npx wrangler login
npx wrangler deploy
```

部署完成後會得到一個 `*.workers.dev` 網址。

## 專案結構

```
09/
├─ public/
│  ├─ index.html    # 頁面結構
│  ├─ style.css     # 視覺樣式、動畫與響應式版面
│  └─ app.js        # 抽籤邏輯、儲存、歷史紀錄、彩帶效果
├─ server.js        # 本機預覽用靜態伺服器
├─ wrangler.jsonc   # Cloudflare Workers 靜態資源設定
├─ package.json
└─ README.md
```

## 資料儲存

資料保存在瀏覽器 `localStorage` 的 `lucky-draw-v1` 鍵值中：

```json
{
  "names": ["林小美", "陳阿宏"],
  "history": [
    {
      "id": "uuid",
      "at": 1760000000000,
      "winners": ["林小美"],
      "poolSize": 2
    }
  ],
  "allowRepeat": false,
  "drawCount": 1
}
```

因為沒有後端，換裝置或清除瀏覽器資料後不會同步；名單與紀錄也不需登入即可使用。

## 開發檢查

```bash
npm run check
```

使用 `node --check` 檢查 JavaScript 語法。
