"use strict";

const DEFAULT_MAX_COUNT = 50;

const DEMO_NAMES = Object.freeze([
  "林小美",
  "陳阿宏",
  "張怡君",
  "李冠宇",
  "王雅婷",
  "黃柏翰",
  "吳品妤",
  "劉子維",
  "蔡雨潔",
  "許志豪",
  "鄭家豪",
  "周欣怡",
]);

const NAME_SEPARATOR = /[\n\r,，、;；|]+/;

function uniqueNames(list) {
  const seen = new Set();
  const result = [];
  Array.from(list || []).forEach((raw) => {
    if (raw === null || raw === undefined) return;
    const name = String(raw).trim().replace(/\s+/g, " ");
    if (name && !seen.has(name)) {
      seen.add(name);
      result.push(name);
    }
  });
  return result;
}

function parseNames(text) {
  if (typeof text !== "string") return [];
  return uniqueNames(text.split(NAME_SEPARATOR));
}

function getCrypto(source) {
  if (source && typeof source.getRandomValues === "function") return source;
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    typeof globalThis.crypto.getRandomValues === "function"
  ) {
    return globalThis.crypto;
  }
  return null;
}

function randomInt(max, cryptoSource) {
  const limit = Math.trunc(Number(max));
  if (!Number.isFinite(limit) || limit <= 0) return 0;

  const cryptoObject = getCrypto(cryptoSource);
  if (cryptoObject) {
    const values = new Uint32Array(1);
    const range = 0x100000000;
    const cutoff = Math.floor(range / limit) * limit;
    do {
      cryptoObject.getRandomValues(values);
    } while (values[0] >= cutoff);
    return values[0] % limit;
  }

  return Math.floor(Math.random() * limit);
}

function shuffle(list, cryptoSource) {
  const pool = Array.from(list || []);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1, cryptoSource);
    const temp = pool[i];
    pool[i] = pool[j];
    pool[j] = temp;
  }
  return pool;
}

function sample(list, count, cryptoSource) {
  const pool = Array.from(list || []);
  const requested = Math.trunc(Number(count));
  const size = Math.max(
    0,
    Math.min(pool.length, Number.isFinite(requested) ? requested : 0),
  );
  return shuffle(pool, cryptoSource).slice(0, size);
}

function wonNameSet(history) {
  const set = new Set();
  Array.from(history || []).forEach((entry) => {
    if (entry && Array.isArray(entry.winners)) {
      entry.winners.forEach((name) => set.add(String(name)));
    }
  });
  return set;
}

function availableNames(names, history, allowRepeat) {
  const pool = uniqueNames(names);
  if (allowRepeat) return pool;
  const won = wonNameSet(history);
  return pool.filter((name) => !won.has(name));
}

function draw(options) {
  const settings = options || {};
  const names = uniqueNames(settings.names || []);

  if (!names.length) {
    const error = new Error("The name pool is empty.");
    error.code = "EMPTY_POOL";
    throw error;
  }

  const history = Array.isArray(settings.history) ? settings.history : [];
  const allowRepeat = Boolean(settings.allowRepeat);
  const maxCount =
    Number.isInteger(settings.maxCount) && settings.maxCount > 0
      ? settings.maxCount
      : DEFAULT_MAX_COUNT;

  const available = availableNames(names, history, allowRepeat);
  if (!available.length) {
    const error = new Error(
      "Everyone has already won. Enable allowRepeat or clear the history.",
    );
    error.code = "NO_AVAILABLE_NAMES";
    throw error;
  }

  const requested = Math.trunc(Number(settings.count));
  const count = Math.min(
    Number.isFinite(requested) && requested > 0 ? requested : 1,
    available.length,
    maxCount,
  );

  return {
    winners: sample(available, count, settings.crypto),
    count,
    available,
    poolSize: available.length,
    allowRepeat,
  };
}

module.exports = {
  DEFAULT_MAX_COUNT,
  DEMO_NAMES,
  uniqueNames,
  parseNames,
  randomInt,
  shuffle,
  sample,
  wonNameSet,
  availableNames,
  draw,
};
