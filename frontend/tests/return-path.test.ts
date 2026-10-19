import assert from "node:assert/strict";
import test from "node:test";
import { safeJobReturnPath } from "../src/lib/return-path";

test("auth handoff only permits known internal job and account routes", () => {
  assert.equal(safeJobReturnPath("/jobs/1"), "/jobs/1");
  assert.equal(
    safeJobReturnPath("/jobs?keyword=Laravel"),
    "/jobs?keyword=Laravel",
  );
  for (const path of [
    "/account/profile",
    "/account/jobs?tab=saved",
    "/account/security",
  ])
    assert.equal(safeJobReturnPath(path), path);
  for (const value of [
    undefined,
    ["/jobs/1"],
    "https://example.com",
    "//example.com",
    "/jobs/../admin",
    "/jobs\\example.com",
    "javascript:alert(1)",
    "/jobs#example",
    "/account/profile/../../admin",
    "/account/unknown",
    "/employer",
    "/admin",
    "/account/profile\n",
    "/jobs?" + "a".repeat(1000),
  ])
    assert.equal(safeJobReturnPath(value), "/jobs");
});
