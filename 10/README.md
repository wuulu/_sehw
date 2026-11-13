# wuuluhw10 · 抽籤所 Lucky Draw

線上抽籤網站 + 可重複使用的抽籤 API，包含在瀏覽器執行的完整網站與一個 CLI。

- 線上網站：<https://wuulu-hw9.yulu96413.workers.dev/>
- npm：<https://www.npmjs.com/package/wuuluhw10>

## 快速開始

直接啟動網站（不需要 clone 專案）：

```bash
npx wuuluhw10
```

開啟 <http://localhost:3000> 即可使用。換連接埠：

```bash
npx wuuluhw10 --port 8080
```

也可以安裝後用 `start`：

```bash
npm install wuuluhw10
npx wuuluhw10
```

## 抽籤 API

套件同時提供 CommonJS 與 ES Modules 兩種載入方式。

### ES Modules

```js
import { draw, parseNames } from "wuuluhw10";

const names = parseNames("林小美\n陳阿宏,張怡君");
const result = draw({ names, count: 2 });

console.log(result.winners); // 例如 [ '陳阿宏', '張怡君' ]
```

### CommonJS

```js
const { draw } = require("wuuluhw10");

const result = draw({
  names: ["林小美", "陳阿宏", "張怡君"],
  count: 1,
});

console.log(result.winners);
```

### `draw(options)`

| 選項 | 型別 | 預設 | 說明 |
| --- | --- | --- | --- |
| `names` | `string[]` | `[]` | 籤筒名單，會自動去重與去除多餘空白 |
| `count` | `number` | `1` | 要抽出的人數，超過可抽人數時自動縮小 |
| `allowRepeat` | `boolean` | `false` | 是否允許已中獎的人再次中獎 |
| `history` | `{ winners: string[] }[]` | `[]` | 歷史紀錄，用於排除已中獎者 |
| `maxCount` | `number` | `50` | 單次抽籤人數上限 |
| `crypto` | `Crypto` | 全域 crypto | 自訂亂數來源（方便測試） |

回傳值：

```js
{
  winners: ["陳阿宏", "張怡君"], // 本次得主
  count: 2,                      // 實際抽出人數
  available: ["林小美", "陳阿宏", "張怡君"], // 本次可抽名單
  poolSize: 3,                   // 可抽人數
  allowRepeat: false
}
```

抽籤使用 Fisher-Yates 洗牌，並優先使用 `crypto.getRandomValues`；若執行環境沒有 Web Crypto 才退回 `Math.random`。

### 其他匯出函式

```js
import {
  uniqueNames,     // 去除空白與重複
  parseNames,      // 解析以換行、逗號、頓號等分隔的名單
  randomInt,       // 取得 [0, max) 的整數
  shuffle,         // Fisher-Yates 洗牌
  sample,          // 隨機取出 n 個不重複項目
  wonNameSet,      // 由歷史紀錄建立已中獎名單
  availableNames,  // 取得尚未中獎的名單
  draw,            // 完整抽籤流程
  DEMO_NAMES,      // 示範名單
  DEFAULT_MAX_COUNT,
} from "wuuluhw10";
```

## CLI 選項

```
wuuluhw10 [選項]

  -p, --port <port>   監聽的連接埠（預設 3000，也可用環境變數 PORT）
      --host <host>   監聽的位址（預設全部介面）
  -h, --help          顯示說明
  -v, --version       顯示版本號
```

## 網站功能

- 多人名單：每行一個名字，或用逗號、頓號分隔；重複名字自動合併。
- 一次抽出多位：可設定 1 到 50 位得主。
- 不重複中獎：抽過的人不會再被抽到；也可開啟允許重複。
- 抽籤動畫、彩帶效果與得主卡片進場。
- 歷史紀錄：保留最近 50 次結果，可撤回上一次或清除全部。
- CSV 匯出：可匯出成 Excel 可直接開啟的 UTF-8 CSV。
- 自動儲存：名單、設定與紀錄存在瀏覽器的 `localStorage`。
- 響應式版面與 `Ctrl + Enter` 快捷鍵。

## 開發

```bash
npm install
npm test      # 執行單元測試
npm run check # 檢查 JavaScript 語法
npm start     # 啟動本機網站
```

## 專案結構

```
10/
├─ bin/cli.cjs          # CLI：啟動靜態網站
├─ lib/index.cjs        # 抽籤 API（CommonJS）
├─ lib/index.mjs        # 抽籤 API（ES Modules 包裝）
├─ public/              # 網站（index.html、style.css、app.js）
├─ test/                # node:test 單元測試
├─ package.json
├─ README.md
└─ LICENSE
```

## 授權

MIT
