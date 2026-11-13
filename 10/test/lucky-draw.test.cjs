"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  DEMO_NAMES,
  uniqueNames,
  parseNames,
  sample,
  wonNameSet,
  availableNames,
  draw,
} = require("../lib/index.cjs");

test("uniqueNames trims, collapses spaces and removes duplicates", () => {
  assert.deepEqual(uniqueNames(["  林小美 ", "林小美", "陳  阿宏", "", null]), [
    "林小美",
    "陳 阿宏",
  ]);
});

test("parseNames accepts line breaks, commas and Chinese punctuation", () => {
  assert.deepEqual(parseNames("A\nB,B、C，D;E；F|G"), [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
  ]);
});

test("sample returns the requested number of unique entries", () => {
  const winners = sample(DEMO_NAMES, 5);
  assert.equal(winners.length, 5);
  assert.equal(new Set(winners).size, 5);
  winners.forEach((name) => assert.ok(DEMO_NAMES.includes(name)));
});

test("sample clamps when asked for more entries than exist", () => {
  assert.equal(sample(["A", "B"], 10).length, 2);
  assert.deepEqual(sample(["A", "B"], 0), []);
});

test("draw avoids names that already won", () => {
  const names = ["A", "B", "C"];
  const history = [{ winners: ["A"] }];
  const result = draw({ names, count: 2, history });

  assert.equal(result.poolSize, 2);
  assert.deepEqual(result.available, ["B", "C"]);
  assert.deepEqual(result.winners.slice().sort(), ["B", "C"]);
});

test("draw allows repeat winners when enabled", () => {
  const names = ["A", "B"];
  const history = [{ winners: ["A", "B"] }];
  const result = draw({ names, count: 2, history, allowRepeat: true });

  assert.equal(result.poolSize, 2);
  assert.equal(result.winners.length, 2);
});

test("draw clamps the requested count to the available pool", () => {
  const result = draw({ names: ["A", "B", "C"], count: 99 });
  assert.equal(result.count, 3);
  assert.equal(result.winners.length, 3);
});

test("draw supports a custom maxCount", () => {
  const result = draw({ names: ["A", "B", "C", "D"], count: 4, maxCount: 2 });
  assert.equal(result.count, 2);
  assert.equal(result.winners.length, 2);
});

test("draw throws EMPTY_POOL for an empty name list", () => {
  assert.throws(
    () => draw({ names: [] }),
    (error) => error.code === "EMPTY_POOL",
  );
});

test("draw throws NO_AVAILABLE_NAMES when everyone already won", () => {
  assert.throws(
    () => draw({ names: ["A"], history: [{ winners: ["A"] }] }),
    (error) => error.code === "NO_AVAILABLE_NAMES",
  );
});

test("wonNameSet and availableNames ignore malformed history entries", () => {
  const history = [{ winners: ["A"] }, null, {}, { winners: "B" }];
  assert.deepEqual(Array.from(wonNameSet(history)), ["A"]);
  assert.deepEqual(availableNames(["A", "B", "C"], history, false), ["B", "C"]);
});
