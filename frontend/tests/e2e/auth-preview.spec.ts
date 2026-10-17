import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("preview validates registration, preserves fields and sends no credentials", async ({
  page,
  context,
}) => {
  const submissions: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") submissions.push(request.url());
  });
  await page.goto("/register?role=employer");
  await expect(
    page.getByRole("radio", { name: /Nhà tuyển dụng/ }),
  ).toBeChecked();
  await page
    .getByRole("button", { name: "Tạo tài khoản", exact: true })
    .click();
  await expect(
    page.getByLabel("Họ và tên người liên hệ", { exact: true }),
  ).toBeFocused();
  await page
    .getByLabel("Họ và tên người liên hệ", { exact: true })
    .fill("Nguyễn Minh Anh");
  await page.getByLabel("Email", { exact: true }).fill("preview@example.test");
  await page.getByLabel(/^Ngày sinh/).fill("2000-05-20");
  await page.getByLabel("Mật khẩu", { exact: true }).fill("PreviewPass1!");
  await page
    .getByLabel("Xác nhận mật khẩu", { exact: true })
    .fill("DifferentPass2!");
  await page
    .getByRole("button", { name: "Tạo tài khoản", exact: true })
    .click();
  await expect(
    page.getByText("Mật khẩu xác nhận chưa khớp.", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Xác nhận mật khẩu", { exact: true })
    .fill("PreviewPass1!");
  await page
    .getByRole("button", { name: "Tạo tài khoản", exact: true })
    .click();
  await expect(
    page.getByText("Chức năng này đang được chuẩn bị.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue(
    "preview@example.test",
  );
  expect(submissions).toEqual([]);
  expect(
    (await context.cookies()).some(
      (cookie) => cookie.name === "timviec_session",
    ),
  ).toBe(false);
  const storage = await page.evaluate(() =>
    JSON.stringify({
      local: { ...localStorage },
      session: { ...sessionStorage },
    }),
  );
  expect(storage).not.toMatch(/PreviewPass1!|preview@example.test/);
});

test("preview login supports password visibility and does not create a session", async ({
  page,
  context,
}) => {
  await page.goto("/login?returnTo=%2Fjobs%2F1");
  const password = page.getByLabel("Mật khẩu", { exact: true });
  await page.getByLabel("Email", { exact: true }).fill("preview@example.test");
  await password.fill("Legacy");
  await page
    .getByRole("button", { name: "Hiện mật khẩu", exact: true })
    .click();
  await expect(password).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Ẩn mật khẩu", exact: true }).click();
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(
    page.getByText("Chức năng này đang được chuẩn bị.", { exact: false }),
  ).toBeVisible();
  expect(
    (await context.cookies()).some(
      (cookie) => cookie.name === "timviec_session",
    ),
  ).toBe(false);
  await page
    .getByRole("link", { name: "Quay lại xem việc làm", exact: true })
    .click();
  await expect(page).toHaveURL(/\/jobs\/1$/);
});

test("malformed reset links can request a fresh link", async ({ page }) => {
  for (const suffix of ["", "?email=invalid&token=x"]) {
    await page.goto(`/reset-password${suffix}`);
    await expect(page.locator(".auth-status[role='alert']")).toContainText(
      "Liên kết xác thực đã hết hạn hoặc không hợp lệ",
    );
    await expect(
      page.getByRole("link", { name: "Yêu cầu liên kết mới" }),
    ).toBeVisible();
    await expect(page.getByLabel("Mật khẩu mới", { exact: true })).toHaveCount(
      0,
    );
  }
});

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`auth preview responsive at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password?email=preview%40example.test&token=sample-token",
    ]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator(".auth-form")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(1);
      if (width === 1440 || width === 360) {
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({
          path: testInfo.outputPath(`${path.split("?")[0].slice(1)}.png`),
          fullPage: true,
        });
      }
    }
    if (width === 360) {
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
  });
}
