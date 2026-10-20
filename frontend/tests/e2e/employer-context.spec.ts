import { test, expect } from "@playwright/test";
import { loginMock } from "./helpers/mock-auth";

const backendTitle = "Lập trình viên Backend Laravel (Middle)";
const frontendTitle = "Frontend Developer (React / Next.js)";

test("mobile applicants keep the list accessible behind a compact expandable filter", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 1000 });
  await loginMock(page, "employer", "/employer/candidates");
  const toggle = page.getByRole("button", { name: "Bộ lọc", exact: true });
  const jobFilter = page.getByRole("combobox", {
    name: "Lọc theo tin tuyển dụng",
    exact: true,
  });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(jobFilter).toBeHidden();
  await toggle.click();
  await expect(jobFilter).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await toggle.click();
  await expect(jobFilter).toBeHidden();
  await expect(page.locator(".ec-applied-job").first()).toBeVisible();
});

test("every applicant shows the applied job before opening and details follow the selected application", async ({
  page,
}) => {
  await loginMock(page, "employer", "/employer/candidates?application=1");
  const rows = page.locator(".ec-candidate");
  await expect(rows).toHaveCount(6);
  for (const row of await rows.all()) {
    await expect(
      row.locator(".ec-candidate-toggle .ec-applied-job"),
    ).toBeVisible();
    await expect(row.locator(".ec-person-meta")).toContainText(
      /Tin #\d+ · Hồ sơ #\d+/,
    );
  }
  const profile = page.locator("#candidate-profile");
  await expect(profile.locator(".ec-application-context")).toContainText(
    backendTitle,
  );
  await expect(profile.locator(".ec-application-context")).toContainText(
    "Tin #1",
  );
  await expect(profile.locator(".ec-status")).toHaveText("Đã ứng tuyển");
  await page.getByRole("button", { name: /Trần Thị Linh/ }).click();
  await expect(
    profile.getByRole("heading", { name: "Trần Thị Linh", exact: true }),
  ).toBeVisible();
  await expect(profile.locator(".ec-application-context")).toContainText(
    frontendTitle,
  );
  await expect(profile.locator(".ec-application-context")).toContainText(
    "Tin #2",
  );
  await expect(
    profile.getByRole("link", { name: "Xem / sửa tin", exact: true }),
  ).toHaveAttribute("href", "/employer/jobs/2/edit");
  await profile
    .getByRole("link", { name: "Hồ sơ cùng tin", exact: true })
    .click();
  await expect(page).toHaveURL(/job_id=2/);
  for (const row of await rows.all())
    await expect(row.locator(".ec-applied-job")).toContainText(frontendTitle);
  await expect(page.locator(".ec-filtered-title")).toHaveText(frontendTitle);
  await page.goBack();
  await expect(profile.locator(".ec-application-context")).toContainText(
    frontendTitle,
  );
});

test("notifications identify their job, open the matching sender conversation and share the unread badge", async ({
  page,
}) => {
  await loginMock(page, "employer", "/employer/notifications");
  await expect(page.locator(".ep-unread-count")).toHaveText("3");
  const notification = page
    .locator(".em-not-item")
    .filter({ hasText: "Lê Minh Hoàng đã gửi tin nhắn" });
  await expect(notification.locator(".em-not-job-context")).toContainText(
    backendTitle,
  );
  await expect(notification.locator(".em-not-job-context")).toContainText(
    "Hồ sơ #3",
  );
  await notification
    .getByRole("link", { name: "Xem tin nhắn", exact: true })
    .click();
  await expect(page).toHaveURL(/messages\?conversation=4/);
  await expect(page.locator(".em-chat-detail")).toContainText("Lê Minh Hoàng");
  await expect(page.locator(".em-chat-detail")).toContainText(backendTitle);
  await page
    .locator(".ep-sidebar")
    .getByRole("link", { name: "Thông báo", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Đánh dấu tất cả đã đọc", exact: true })
    .click();
  await expect(page.locator(".ep-unread-count")).toHaveCount(0);
});

test("job rows lead to applications and editing retains the same recruitment identity", async ({
  page,
}) => {
  await loginMock(page, "employer", "/employer/jobs");
  const row = page
    .locator(".ep-job-table tbody tr")
    .filter({ hasText: backendTitle });
  await row
    .getByRole("link", { name: `Xem hồ sơ cho ${backendTitle}`, exact: true })
    .click();
  await expect(page).toHaveURL(/candidates\?job_id=1/);
  await expect(page.locator(".ec-filtered-title")).toHaveText(backendTitle);
  await page
    .locator("#candidate-profile")
    .getByRole("link", { name: "Xem / sửa tin", exact: true })
    .click();
  await expect(page).toHaveURL(/jobs\/1\/edit$/);
  await expect(page.locator(".ep-edit-job-context")).toContainText("Mã tin #1");
  await expect(page.locator(".ep-edit-job-context")).toContainText(
    backendTitle,
  );
  await expect(page.locator(".ep-edit-job-context")).toContainText(
    "Đang tuyển",
  );
});
