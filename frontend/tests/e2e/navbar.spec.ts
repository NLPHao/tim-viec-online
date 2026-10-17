import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("navbar keyword and location submit the existing job query contract", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/jobs?page=2");
  const search = page.getByRole("search", { name: "Tìm việc nhanh" });
  await search
    .getByLabel("Việc làm, công ty hoặc kỹ năng", { exact: true })
    .fill("React");
  await search.getByLabel("Địa điểm tìm nhanh").selectOption("Hà Nội");
  await search.getByRole("button", { name: "Tìm việc nhanh" }).click();
  await expect(page).toHaveURL(/keyword=React/);
  const url = new URL(page.url());
  expect(url.searchParams.get("city")).toBe("Hà Nội");
  expect(url.searchParams.has("page")).toBe(false);
  await expect(
    page.getByLabel("Công việc bạn đang tìm", { exact: true }),
  ).toHaveValue("React");
  await expect(page.getByLabel("Địa điểm", { exact: true })).toHaveValue(
    "Hà Nội",
  );
});

test("navbar menus dismiss, restore focus and navigate without fake account data", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/jobs");
  const categories = page.getByRole("button", {
    name: "Tất cả danh mục",
    exact: true,
  });
  await categories.click();
  const mega = page.getByRole("dialog", {
    name: "Tất cả danh mục",
    exact: true,
  });
  await expect(mega).toBeVisible();
  expect((await mega.boundingBox())!.y).toBeGreaterThanOrEqual(69);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(categories).toBeFocused();
  await categories.click();
  await page
    .getByRole("heading", { name: "18 việc làm phù hợp", exact: true })
    .click();
  await expect(mega).toBeHidden();
  await categories.click();
  await mega.getByRole("link", { name: "IT Jobs", exact: true }).click();
  await expect(page).toHaveURL(/category_ids=1/);
  await expect(mega).toBeHidden();
  const account = page.getByRole("button", {
    name: "Tài khoản cá nhân",
    exact: true,
  });
  await account.click();
  await expect(
    page.getByRole("menuitem", { name: "Đăng nhập", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(account).toBeFocused();
  const bell = page.getByRole("button", {
    name: "Trung tâm thông báo",
    exact: true,
  });
  await bell.click();
  const notifications = page.getByRole("dialog", {
    name: "Thông báo",
    exact: true,
  });
  await expect(notifications).toContainText("Đăng nhập để xem thông báo");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(bell).toBeFocused();
});
