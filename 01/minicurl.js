#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const http = require("node:http");
const https = require("node:https");

const USER_AGENT = "minicurl/1.0";
const REDIRECT_CODES = new Set([301, 302, 303, 307, 308]);
const MAX_REDIRECTS = 10;

function usage() {
  return [
    "Usage: minicurl [options] URL",
    "",
    "Options:",
    "  -X, --request METHOD   HTTP method (default: GET, or POST with -d)",
    "  -H, --header HEADER    Add request header, e.g. -H 'Accept: text/html'",
    "  -d, --data DATA        Request body",
    "  -o, --output FILE      Write output to FILE",
    "  -i, --include          Include response headers in output",
    "  -I, --head             Send HEAD request and show headers only",
    "  -L, --location         Follow redirects",
    "  -k, --insecure         Skip TLS certificate verification",
    "  -s, --silent           Suppress error messages",
    "  -v, --verbose          Print response status to stderr",
    "  -h, --help             Show this help",
  ].join("\n");
}

function parseArgs(argv) {
  const opts = {
    url: null,
    method: null,
    headers: [],
    data: null,
    output: null,
    include: false,
    head: false,
    location: false,
    insecure: false,
    silent: false,
    verbose: false,
  };

  const valueOpts = {
    "-X": "method",
    "--request": "method",
    "-H": "header",
    "--header": "header",
    "-d": "data",
    "--data": "data",
    "-o": "output",
    "--output": "output",
  };
  const flagOpts = {
    "-i": "include",
    "--include": "include",
    "-I": "head",
    "--head": "head",
    "-L": "location",
    "--location": "location",
    "-k": "insecure",
    "--insecure": "insecure",
    "-s": "silent",
    "--silent": "silent",
    "-v": "verbose",
    "--verbose": "verbose",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      opts.help = true;
      continue;
    }
    if (Object.hasOwn(valueOpts, arg)) {
      const key = valueOpts[arg];
      const value = argv[i + 1];
      if (value === undefined) {
        throw new Error(`option ${arg} requires a value`);
      }
      i += 1;
      if (key === "header") {
        opts.headers.push(value);
      } else {
        opts[key] = value;
      }
      continue;
    }
    if (Object.hasOwn(flagOpts, arg)) {
      opts[flagOpts[arg]] = true;
      continue;
    }
    if (arg.startsWith("-") && arg !== "-") {
      throw new Error(`unknown option: ${arg}`);
    }
    if (opts.url !== null) {
      throw new Error(`unexpected argument: ${arg}`);
    }
    opts.url = arg;
  }

  return opts;
}

function parseHeaders(rawHeaders) {
  const headers = {};
  for (const item of rawHeaders) {
    const index = item.indexOf(":");
    if (index <= 0) {
      throw new Error(`invalid header (expected 'Name: value'): ${item}`);
    }
    const name = item.slice(0, index).trim();
    const value = item.slice(index + 1).trim();
    const existingKey = Object.keys(headers).find((key) => key.toLowerCase() === name.toLowerCase());
    const key = existingKey || name;
    if (existingKey) {
      headers[key] = [].concat(headers[key], value);
    } else {
      headers[key] = value;
    }
  }
  return headers;
}

function hasHeader(headers, name) {
  return Object.keys(headers).some((key) => key.toLowerCase() === name.toLowerCase());
}

function requestOnce(method, url, headers, body, insecure) {
  return new Promise((resolve, reject) => {
    const transport = url.protocol === "https:" ? https : http;
    const options = {
      method,
      headers,
      timeout: 30000,
      rejectUnauthorized: !insecure,
    };

    const req = transport.request(url, options, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          reason: res.statusMessage || "",
          headers: res.headers,
          body: Buffer.concat(chunks),
        });
      });
      res.on("error", reject);
    });

    req.on("timeout", () => req.destroy(new Error("request timed out")));
    req.on("error", reject);
    if (body && body.length > 0) {
      req.write(body);
    }
    req.end();
  });
}

function formatHeaders(status, reason, headers) {
  let text = `HTTP/1.1 ${status} ${reason}`.trimEnd() + "\r\n";
  for (const [name, value] of Object.entries(headers)) {
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      text += `${name}: ${item}\r\n`;
    }
  }
  return Buffer.from(text + "\r\n", "latin1");
}

async function fetchWithRedirects(method, startUrl, headers, body, insecure, follow) {
  let url;
  try {
    url = new URL(startUrl.includes("://") ? startUrl : `http://${startUrl}`);
  } catch {
    throw new Error(`invalid URL: ${startUrl}`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`unsupported protocol: ${url.protocol}`);
  }

  const history = [];
  let currentMethod = method;
  let currentBody = body;
  let currentHeaders = { ...headers };

  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const response = await requestOnce(currentMethod, url, currentHeaders, currentBody, insecure);
    history.push(response);

    const location = response.headers.location;
    if (follow && REDIRECT_CODES.has(response.status) && location) {
      if (response.status === 303 || ((response.status === 301 || response.status === 302) && currentMethod !== "GET" && currentMethod !== "HEAD")) {
        currentMethod = "GET";
        currentBody = null;
        currentHeaders = Object.fromEntries(
          Object.entries(currentHeaders).filter(([key]) => key.toLowerCase() !== "content-length" && key.toLowerCase() !== "content-type")
        );
      }
      url = new URL(location, url);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error(`unsupported redirect protocol: ${url.protocol}`);
      }
      continue;
    }
    return { response, history };
  }

  throw new Error("too many redirects");
}

async function main(argv) {
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (error) {
    process.stderr.write(`minicurl: ${error.message}\n`);
    return 1;
  }

  if (opts.help) {
    process.stdout.write(usage() + "\n");
    return 0;
  }
  if (!opts.url) {
    process.stderr.write("minicurl: missing URL\n" + usage() + "\n");
    return 1;
  }

  const method = (opts.method || (opts.data !== null ? "POST" : "GET")).toUpperCase();
  const headers = parseHeaders(opts.headers);
  if (!hasHeader(headers, "user-agent")) headers["User-Agent"] = USER_AGENT;
  if (!hasHeader(headers, "accept")) headers["Accept"] = "*/*";
  if (!hasHeader(headers, "connection")) headers["Connection"] = "close";

  let body = opts.data !== null ? Buffer.from(opts.data, "utf8") : null;
  if (body && !hasHeader(headers, "content-type")) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  }
  if (body && !hasHeader(headers, "content-length")) {
    headers["Content-Length"] = String(body.length);
  }

  let finalMethod = method;
  if (opts.head) {
    finalMethod = "HEAD";
    body = null;
  }

  let result;
  try {
    result = await fetchWithRedirects(finalMethod, opts.url, headers, body, opts.insecure, opts.location);
  } catch (error) {
    if (!opts.silent) {
      process.stderr.write(`minicurl: ${error.message}\n`);
    }
    return 1;
  }

  if (opts.verbose) {
    for (const item of result.history) {
      process.stderr.write(`* ${item.status} ${item.reason}\n`);
    }
  }

  const { response } = result;
  const payload = [];
  if (opts.include || opts.head) {
    payload.push(formatHeaders(response.status, response.reason, response.headers));
  }
  if (!opts.head) {
    payload.push(response.body);
  }
  const output = Buffer.concat(payload);

  if (opts.output) {
    try {
      fs.writeFileSync(opts.output, output);
    } catch (error) {
      if (!opts.silent) {
        process.stderr.write(`minicurl: cannot write ${opts.output}: ${error.message}\n`);
      }
      return 1;
    }
  } else {
    process.stdout.write(output);
  }

  return 0;
}

main(process.argv.slice(2)).then((code) => {
  process.exitCode = code;
});
