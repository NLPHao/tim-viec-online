import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("profile identity is shared with candidate pages and application notifications open their record", async ({
  page,
}) => {
  await page.goto("/preview/profile");
  await page.getByLabel("Họ và tên", { exact: true }).fill("Nguyễn Thanh An");
  await page
    .getByRole("button", { name: "Áp dụng bản xem trước", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "Tài khoản ứng viên", exact: true })
    .getByRole("link", { name: "Quản lý tài khoản", exact: true })
    .click();
  await expect(page).toHaveURL(/\/preview\/settings$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Quản lý tài khoản",
  );
  await expect(
    page.getByRole("textbox", { name: "Họ và tên", exact: true }),
  ).toHaveValue("Nguyễn Thanh An");
  await expect(
    page.getByRole("complementary", {
      name: "Điều hướng tài khoản ứng viên",
      exact: true,
    }),
  ).toContainText("Nguyễn Thanh An");
  await page
    .getByRole("navigation", { name: "Tài khoản ứng viên", exact: true })
    .getByRole("link", { name: "Thông báo việc làm", exact: true })
    .click();
  await page
    .getByRole("link", { name: /Xem thông báo ứng tuyển & tin nhắn/ })
    .click();
  await page
    .locator(".cu-notification:visible")
    .filter({ hasText: "Hồ sơ của bạn đã được chấp nhận" })
    .getByRole("link", { name: "Theo dõi ứng tuyển", exact: true })
    .click();
  await expect(page).toHaveURL(/status=accepted#application-3$/);
  await expect(page.locator("#application-3:visible")).toContainText(
    "Trúng tuyển",
  );
});

test("my jobs supports shared pagination, SRS statuses, saved removal and browser history", async ({
  page,
}) => {
  await page.goto("/preview/jobs");
  await expect(
    page.getByRole("heading", { name: "9 hồ sơ ứng tuyển", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".cu-job:visible")).toHaveCount(6);
  await page
    .getByRole("combobox", { name: "Trạng thái ứng tuyển", exact: true })
    .click();
  await page.getByRole("option", { name: "Đang xem xét", exact: true }).click();
  await expect(page).toHaveURL(/status=waiting/);
  await expect(page.locator(".cu-status:visible")).toHaveCount(3);
  await expect(page.locator(".cu-status:visible").first()).toHaveText(
    "Đang xem xét",
  );
  await page
    .getByRole("navigation", { name: "Loại việc làm", exact: true })
    .getByRole("link", { name: /Việc đã lưu/ })
    .click();
  await page.getByRole("link", { name: "Trang 2", exact: true }).click();
  await expect(page.locator(".cu-job:visible")).toHaveCount(3);
  await page
    .getByRole("button", { name: /^Bỏ lưu / })
    .first()
    .click();
  const modal = page.getByRole("alertdialog");
  await expect(modal).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(modal).toHaveCount(0);
  await page
    .getByRole("button", { name: /^Bỏ lưu / })
    .first()
    .click();
  await modal.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "8 việc làm đã lưu", exact: true }),
  ).toBeVisible();
  await expect(page.locator("#my-jobs-heading:visible")).toBeFocused();
  await page
    .getByRole("navigation", { name: "Tài khoản ứng viên", exact: true })
    .getByRole("link", { name: "Quản lý tài khoản", exact: true })
    .click();
  await expect(page).toHaveURL(/\/preview\/settings$/);
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "8 việc làm đã lưu", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "9 việc làm đã lưu", exact: true }),
  ).toBeVisible();
});

test("chat preserves per-thread drafts, validates, renders text safely and does not send over the network", async ({
  page,
}) => {
  const writes: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") writes.push(request.url());
  });
  await page.goto("/preview/messages?conversation=1");
  await expect(
    page.getByText(/Tin đã đóng \/ hết hạn\. Bạn vẫn có thể/),
  ).toBeVisible();
  const composer = page.getByLabel("Tin nhắn của bạn", { exact: true });
  await composer.fill("   ");
  await page.getByRole("button", { name: "Gửi", exact: true }).click();
  await expect(
    page.getByText("Nhập nội dung tin nhắn trước khi gửi.", { exact: true }),
  ).toBeVisible();
  await expect(composer).toBeFocused();
  await composer.fill("Bản nháp FPT");
  await page.getByRole("button", { name: /Đồng Hành Media/ }).click();
  await expect(composer).toHaveValue("");
  await composer.fill("Bản nháp khác");
  await page.getByRole("button", { name: /FPT Software/ }).click();
  await expect(composer).toHaveValue("Bản nháp FPT");
  const payload = '<img src=x onerror="window.bad=true">';
  await composer.fill(payload);
  await composer.press("Control+Enter");
  await expect(page.locator(".cc-message:visible").last()).toContainText(
    payload,
  );
  await expect(page.locator(".cc-message:visible").last()).toContainText(
    "Chỉ trong bản xem trước",
  );
  await expect(page.locator(".cc-message:visible img")).toHaveCount(0);
  await expect(composer).toHaveValue("");
  await page
    .getByRole("navigation", { name: "Tài khoản ứng viên", exact: true })
    .getByRole("link", { name: "Thông báo việc làm", exact: true })
    .click();
  await expect(page).toHaveURL(/\/preview\/alerts$/);
  await page.goBack();
  await expect(page.locator(".cc-message:visible").last()).toContainText(
    payload,
  );
  expect(writes).toEqual([]);
  await page.goto("/preview/messages?conversation=999");
  await expect(
    page.getByRole("heading", {
      name: "Không tìm thấy hội thoại",
      exact: true,
    }),
  ).toBeVisible();
});

test("mobile chat list/detail keeps controls reachable and returns focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto("/preview/messages");
  await expect(
    page.getByLabel("Tin nhắn của bạn", { exact: true }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: /FPT Software/ }).click();
  await expect(
    page.getByRole("heading", { name: "FPT Software", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByLabel("Tin nhắn của bạn", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Danh sách hội thoại", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /FPT Software/ }),
  ).toBeFocused();
  await page.getByLabel("Tìm hội thoại", { exact: true }).fill("khongco");
  await expect(
    page.getByText("Không tìm thấy hội thoại phù hợp.", { exact: true }),
  ).toBeVisible();
});

test("job alert preview validates, searches cities, toggles, links to jobs and removes", async ({
  page,
}) => {
  await page.goto("/preview/alerts");
  await page
    .getByRole("button", { name: "Tạo thông báo mới", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Thêm vào bản xem trước", exact: true })
    .click();
  await expect(page.getByLabel("Tên thông báo", { exact: true })).toBeFocused();
  await page.getByLabel("Tên thông báo", { exact: true }).fill("Việc Laravel");
  await page.getByLabel("Từ khóa công việc", { exact: true }).fill("Laravel");
  await page
    .getByRole("combobox", { name: "Tỉnh / Thành phố", exact: true })
    .click();
  await page.getByLabel("Tìm tỉnh/thành phố", { exact: true }).fill("da nang");
  await page.getByRole("option", { name: "Đà Nẵng", exact: true }).click();
  await page
    .getByRole("button", { name: "Thêm vào bản xem trước", exact: true })
    .click();
  const alert = page.locator(".cu-alert:visible");
  await expect(alert).toContainText("Việc Laravel");
  await expect(alert).toContainText("Đà Nẵng");
  const enabled = page.getByRole("switch", {
    name: "Bật thông báo Việc Laravel",
    exact: true,
  });
  await expect(enabled).toBeChecked();
  await enabled.click();
  await expect(enabled).not.toBeChecked();
  const href = await alert
    .getByRole("link", { name: "Xem việc làm phù hợp", exact: true })
    .getAttribute("href");
  expect(new URL(href!, "http://localhost").searchParams.get("city")).toBe(
    "Đà Nẵng",
  );
  await page
    .getByRole("button", { name: "Xóa thông báo Việc Laravel", exact: true })
    .click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Xác nhận", exact: true })
    .click();
  await expect(alert).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      name: "Bạn chưa tạo thông báo việc làm nào",
      exact: true,
    }),
  ).toBeVisible();
});

test("notification read state and account preferences persist between preview pages only", async ({
  page,
}) => {
  await page.goto("/preview/notifications?read=unread");
  await expect(page.locator(".cu-notification:visible")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Đánh dấu đã đọc", exact: true })
    .first()
    .click();
  await expect(page.locator(".cu-notification:visible")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Đánh dấu tất cả đã đọc", exact: true })
    .click();
  await expect(page.locator(".cu-notification:visible")).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "Tài khoản ứng viên", exact: true })
    .getByRole("link", { name: "Quản lý tài khoản", exact: true })
    .click();
  const preference = page.getByRole("switch", { name: /Trạng thái ứng tuyển/ });
  await preference.click();
  await expect(preference).not.toBeChecked();
  await page
    .getByRole("navigation", { name: "Tài khoản ứng viên", exact: true })
    .getByRole("link", { name: "Thông báo việc làm", exact: true })
    .click();
  await expect(
    page.getByRole("link", {
      name: /Xem thông báo ứng tuyển & tin nhắn \(0 chưa đọc\)/,
    }),
  ).toBeVisible();
  await page.goBack();
  await expect(preference).not.toBeChecked();
  expect(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
    })),
  ).toEqual({ local: 0, session: 0 });
  await page.reload();
  await expect(preference).toBeChecked();
});

for (const width of [360, 768, 1440]) {
  test(`candidate workspace pages remain accessible at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "jobs",
      "messages?conversation=1",
      "alerts",
      "notifications",
      "settings",
    ]) {
      await page.goto(`/preview/${path}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(1);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.screenshot({
        path: testInfo.outputPath(`${path.split("?")[0]}.png`),
        fullPage: true,
        animations: "disabled",
      });
    }
  });
}
