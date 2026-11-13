#!/usr/bin/env node
"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const pkg = require("../package.json");

const ROOT = path.join(__dirname, "..", "public");
const DEFAULT_PORT = 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

function showHelp() {
  process.stdout.write(
    [
      "抽籤所 Lucky Draw " + pkg.version,
      "",
      "用法: wuuluhw10 [選項]",
      "",
      "選項:",
      "  -p, --port <port>   監聽的連接埠 (預設 3000，也可用環境變數 PORT)",
      "      --host <host>   監聽的位址 (預設全部介面)",
      "  -h, --help          顯示此說明",
      "  -v, --version       顯示版本號",
      "",
      "範例:",
      "  npx wuuluhw10",
      "  npx wuuluhw10 --port 8080",
      "",
      "啟動後開啟 http://localhost:<port> 即可使用抽籤網站。",
      "",
    ].join("\n"),
  );
}

function readOption(args, index, name) {
  const value = args[index];
  if (value === undefined || value.startsWith("-")) {
    throw new Error("選項 " + name + " 需要一個值。");
  }
  return value;
}

function parseArgs(argv) {
  const options = {
    port: Number(process.env.PORT) || DEFAULT_PORT,
    host: undefined,
    help: false,
    version: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else if (arg === "-v" || arg === "--version") {
      options.version = true;
    } else if (arg === "-p" || arg === "--port") {
      options.port = Number(readOption(argv, i + 1, arg));
      i += 1;
    } else if (arg.startsWith("--port=")) {
      options.port = Number(arg.slice("--port=".length));
    } else if (arg === "--host") {
      options.host = readOption(argv, i + 1, arg);
      i += 1;
    } else if (arg.startsWith("--host=")) {
      options.host = arg.slice("--host=".length);
    } else {
      throw new Error("未知的參數: " + arg);
    }
  }

  if (!Number.isInteger(options.port) || options.port < 0 || options.port > 65535) {
    throw new Error("連接埠必須是 0 到 65535 之間的整數。");
  }

  return options;
}

function resolveFilePath(requestUrl, hostHeader) {
  const pathname = decodeURIComponent(
    new URL(requestUrl, "http://" + (hostHeader || "localhost")).pathname,
  );
  const requestedPath =
    pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = path.normalize(path.join(ROOT, requestedPath));

  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    return null;
  }
  return filePath;
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(message);
}

function createServer() {
  return http.createServer((request, response) => {
    let filePath;
    try {
      filePath = resolveFilePath(request.url, request.headers.host);
    } catch (error) {
      sendText(response, 400, "Bad request");
      return;
    }

    if (!filePath) {
      sendText(response, 403, "Forbidden");
      return;
    }

    fs.stat(filePath, (statError, stats) => {
      if (statError || !stats.isFile()) {
        sendText(response, 404, "Not found");
        return;
      }

      const contentType =
        MIME_TYPES[path.extname(filePath).toLowerCase()] ||
        "application/octet-stream";
      response.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": "no-cache",
      });
      fs.createReadStream(filePath).pipe(response);
    });
  });
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(error.message + "\n\n");
    showHelp();
    process.exitCode = 1;
    return;
  }

  if (options.help) {
    showHelp();
    return;
  }

  if (options.version) {
    process.stdout.write(pkg.version + "\n");
    return;
  }

  const server = createServer();

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      process.stderr.write(
        "連接埠 " + options.port + " 已被使用，請用 --port 換一個。\n",
      );
    } else {
      process.stderr.write("啟動失敗: " + error.message + "\n");
    }
    process.exitCode = 1;
  });

  server.listen(options.port, options.host, () => {
    const address = server.address();
    const port = address && typeof address === "object" ? address.port : options.port;
    process.stdout.write(
      "抽籤所 Lucky Draw 已啟動：http://localhost:" + port + "\n",
    );
    process.stdout.write("按 Ctrl+C 可停止伺服器。\n");
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main();
