# 大學校務系統

以 Node.js 原生 HTTP 模組打造的大學校務系統，提供教授、學生與管理員三種角色的校園資訊平台。前端為純 HTML/CSS/JavaScript，後端使用 JSON 檔案儲存資料，無需安裝任何第三方套件。

## 功能特色

### 管理員
- 檢視校務總覽與統計資料
- 管理使用者帳號（新增、編輯、刪除）
- 管理班級與課程
- 檢視所有課程成績與出缺席紀錄
- 發布與刪除公告
- 查看各課程選課人數

### 教授
- 檢視個人授課課程與選課學生名單
- 登錄、編輯與刪除成績
- 登錄學生出缺席
- 發布公告至授課班級
- 個人資料與密碼管理

### 學生
- 檢視個人修課、成績與出缺席紀錄
- **加退選課程**：可跨班加選與退選，並即時顯示已選學分與可加選課程
- 查看個人成績與出缺席統計
- 查看校園公告
- 個人資料與密碼管理

> 退選課程時，該課程的成績與出缺席紀錄會一併移除。

## 快速開始

### 環境需求
- Node.js 18 以上

### 安裝與啟動

```bash
npm start
```

啟動後開啟 <http://localhost:3000>。

若連接埠 3000 已被占用，可指定其他連接埠：

```powershell
$env:PORT=3001; npm start
```

### 重設示範資料

```bash
npm run reset
```

重新啟動伺服器後，會自動建立預設的示範帳號與資料。

### 語法檢查

```bash
npm run check
```

## 示範帳號

| 角色 | 帳號 | 密碼 |
| --- | --- | --- |
| 管理員 | `admin` | `admin123` |
| 教授 | `teacher1` | `teach123` |
| 教授 | `teacher2` | `teach123` |
| 教授 | `teacher3` | `teach123` |
| 學生 | `student1` ~ `student6` | `student123` |

## 專案結構

```text
.
├── data/
│   └── db.json          # 系統資料（使用者、班級、課程、選課、成績、出缺席、公告）
├── public/
│   ├── index.html       # 頁面入口
│   ├── app.js           # 前端應用程式與路由
│   └── style.css        # 樣式表
├── server.js            # HTTP 伺服器與 API
├── reset.js             # 清除資料檔
├── package.json
└── README.md
```

## 資料模型

系統以 `data/db.json` 儲存下列資料：

- `users`：使用者（管理員、教授、學生）
- `classes`：班級
- `courses`：課程
- `enrollments`：選課紀錄（學生與課程的多對多關聯）
- `grades`：成績紀錄
- `attendance`：出缺席紀錄
- `announcements`：公告

學生可選修的課程以 `enrollments` 為準；教授與管理員的學生名單、選課人數也由選課紀錄計算。

## API 一覽

所有 API 皆以 `/api` 為前綴，除登入與健康檢查外都需要 Bearer Token。

### 認證
- `POST /api/login`：登入
- `POST /api/logout`：登出
- `GET /api/health`：健康檢查
- `GET /api/bootstrap`：取得登入者可見的初始化資料
- `GET /api/me`：取得目前使用者
- `PUT /api/me/password`：變更密碼

### 使用者與班級
- `POST /api/users`：新增使用者（管理員）
- `PUT /api/users/:id`：編輯使用者（管理員）
- `DELETE /api/users/:id`：刪除使用者（管理員）
- `POST /api/classes`：新增班級（管理員）
- `PUT /api/classes/:id`：編輯班級（管理員）
- `DELETE /api/classes/:id`：刪除班級（管理員）

### 課程與加退選
- `POST /api/courses`：新增課程（管理員）
- `PUT /api/courses/:id`：編輯課程（管理員）
- `DELETE /api/courses/:id`：刪除課程（管理員）
- `POST /api/enrollments`：學生加選課程
- `DELETE /api/enrollments/:id`：學生退選課程

### 成績與出缺席
- `POST /api/grades`：新增成績（教授、管理員）
- `PUT /api/grades/:id`：編輯成績（教授、管理員）
- `DELETE /api/grades/:id`：刪除成績（教授、管理員）
- `POST /api/attendance`：登錄出缺席（教授、管理員）

### 公告
- `POST /api/announcements`：發布公告（教授、管理員）
- `DELETE /api/announcements/:id`：刪除公告（作者或管理員）

