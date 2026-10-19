import assert from "node:assert/strict";
import test from "node:test";
import { safeJobReturnPath } from "../src/lib/return-path";

test("auth handoff only permits internal job routes", () => {
  assert.equal(safeJobReturnPath("/jobs/1"), "/jobs/1");
  assert.equal(
    safeJobReturnPath("/jobs?keyword=Laravel"),
    "/jobs?keyword=Laravel",
  );
  for (const value of [
    undefined,
    ["/jobs/1"],
    "https://example.com",
    "//example.com",
    "/jobs/../admin",
    "/jobs\\example.com",
    "javascript:alert(1)",
    "/jobs#example",
    "/jobs?" + "a".repeat(1000),
  ])
    assert.equal(safeJobReturnPath(value), "/jobs");
});
