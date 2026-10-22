import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateTrendPoints,
  formatDateVN,
  formatNumber,
  getInitials,
  getInitialDatabase,
} from "../src/features/admin/mock-data";

test("admin mock database initial data integrity", () => {
  const db = getInitialDatabase();
  assert.equal(db.users.length, 12);
  assert.equal(db.jobs.length, 10);
  assert.equal(db.categories.length, 8);
  assert.equal(db.skills.length, 14);

  // Check reported jobs
  const reportedJobs = db.jobs.filter((j) => j.is_reported);
  assert.equal(reportedJobs.length, 3);

  // Check applications count consistency
  for (const job of db.jobs) {
    const apps = db.applications.filter((a) => a.job_id === job.id);
    assert.equal(job.applications_count, apps.length);
  }
});

test("admin helper functions format correctly", () => {
  assert.equal(formatDateVN("2026-10-16"), "16/10/2026");
  assert.equal(formatNumber(1250000), "1.250.000");
  assert.equal(getInitials("Quản Trị Viên"), "QV");
  assert.equal(getInitials("Admin"), "AD");
});

test("calculateTrendPoints returns correct points for 7 and 14 days", () => {
  const db = getInitialDatabase();
  const points7 = calculateTrendPoints(db.jobs, db.applications, 7);
  assert.equal(points7.length, 7);
  assert.equal(points7[points7.length - 1].date, "2026-10-16");

  const points14 = calculateTrendPoints(db.jobs, db.applications, 14);
  assert.equal(points14.length, 14);
});

