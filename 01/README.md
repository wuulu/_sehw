# minicurl

一個用 Node.js 標準函式庫實作的簡易 curl 工具。不需要安裝任何第三方套件，適合用來傳送 HTTP/HTTPS 請求、檢查回應標頭或下載內容。

## 功能

- 支援 `http` 與 `https`
- 自訂 HTTP 方法（GET、POST、PUT、DELETE 等）
- 自訂請求標頭
- 送出請求 body
- 跟隨 3xx 重新導向
- 輸出或儲存回應內容
- 顯示回應標頭
- 略過 TLS 憑證驗證（自簽憑證測試用）
- 自動處理 `Content-Length`、`Transfer-Encoding: chunked` 與壓縮以外的常見 HTTP 行為

## 環境需求

- Node.js 18 以上
- 無外部依賴

確認版本：

```powershell
node --version
```

## 使用方式

```powershell
node minicurl.js [options] URL
```

若省略 `http://` 或 `https://`，會預設使用 `http://`。

## 選項

| 選項 | 說明 |
| --- | --- |
| `-X, --request METHOD` | 指定 HTTP 方法，預設為 `GET`；有 `-d` 時預設為 `POST` |
| `-H, --header HEADER` | 新增請求標頭，可重複使用，例如 `-H "Accept: application/json"` |
| `-d, --data DATA` | 請求 body；未指定 `-X` 時自動使用 `POST` |
| `-o, --output FILE` | 將結果寫入檔案 |
| `-i, --include` | 輸出中包含回應標頭 |
| `-I, --head` | 送出 `HEAD` 請求，只顯示回應標頭 |
| `-L, --location` | 跟隨重新導向（最多 10 次） |
| `-k, --insecure` | 略過 TLS 憑證驗證 |
| `-s, --silent` | 不顯示錯誤訊息 |
| `-v, --verbose` | 在 stderr 顯示每次回應的狀態碼 |
| `-h, --help` | 顯示說明 |

## 範例

### 基本 GET

```powershell
node minicurl.js https://example.com
```

### 只看回應標頭

```powershell
node minicurl.js -I https://example.com
```

### 送出 POST 表單

```powershell
node minicurl.js -d "name=test&value=123" https://example.com/api
```

`-d` 未指定 `Content-Type` 時會預設為 `application/x-www-form-urlencoded`。

### 送出 JSON

```powershell
node minicurl.js -X POST -H "Content-Type: application/json" -d '{"name":"test"}' https://example.com/api
```

### 自訂方法與標頭

```powershell
node minicurl.js -X PUT -H "Authorization: Bearer TOKEN" -d "hello" https://example.com/items/1
```

### 跟隨重新導向並顯示標頭

```powershell
node minicurl.js -L -i https://example.com/redirect
```

### 下載檔案

```powershell
node minicurl.js -o page.html https://example.com
```

### 測試自簽憑證

```powershell
node minicurl.js -k https://localhost:8443
```

### 顯示重新導向過程

```powershell
node minicurl.js -L -v https://example.com
```

## 行為說明

- 預設送出 `User-Agent: minicurl/1.0`、`Accept: */*`、`Connection: close`。
- 有 body 且未指定 `Content-Length` 時會自動計算。
- 有 body 且未指定 `Content-Type` 時會使用 `application/x-www-form-urlencoded`。
- 遇到 `301`、`302`、`303` 且原本方法不是 `GET`/`HEAD` 時，重新導向後會改用 `GET` 並移除 body，與常見瀏覽器行為一致。
- `-I` 會強制使用 `HEAD` 並忽略 body。
- `-o` 搭配 `-i` 或 `-I` 時，標頭也會一併寫入檔案。

## 專案結構

```text
01/
└── minicurl.js   主程式
```

## 限制

- 不支援 multipart/form-data 上傳（`-F`）。
- 不支援 cookie jar、proxy、HTTP/2 或壓縮內容自動解壓。
- 沒有進度列與續傳功能。
- 重新導向最多跟隨 10 次。
