import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("sorting resets pagination and survives pagination, reload and browser history", async ({
  page,
}) => {
  await page.goto("/jobs?page=3");
  const sort = page.getByRole("combobox", {
    name: "Sắp xếp theo:",
    exact: true,
  });
  await sort.click();
  await expect(page.getByRole("option")).toHaveCount(4);
  await page
    .getByRole("option", { name: "Lương (cao - thấp)", exact: true })
    .click();
  await expect(page).toHaveURL(/\/jobs\?sort=salary_desc$/);
  await expect(sort).toHaveText("Lương (cao - thấp)");
  await expect(
    page.getByRole("link", { name: "Trang 1", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page
      .getByRole("navigation", { name: "Phân trang việc làm" })
      .getByLabel("Trang đầu", { exact: true }),
  ).toHaveAttribute("aria-disabled", "true");
  await page.getByRole("link", { name: "Trang 2", exact: true }).click();
  await expect(page).toHaveURL(/page=2&sort=salary_desc$/);
  await expect(sort).toHaveText("Lương (cao - thấp)");
  await page.reload();
  await expect(sort).toHaveText("Lương (cao - thấp)");
  await sort.click();
  await page
    .getByRole("option", { name: "Ngày đăng (mới nhất)", exact: true })
    .click();
  await expect(page).toHaveURL(/\/jobs\?sort=newest$/);
  await expect(sort).toHaveText("Ngày đăng (mới nhất)");
  await page.goBack();
  await expect(page).toHaveURL(/page=2&sort=salary_desc$/);
  await expect(sort).toHaveText("Lương (cao - thấp)");
  await sort.click();
  await page.getByRole("option", { name: "Mặc định", exact: true }).click();
  await expect(page).toHaveURL(/\/jobs$/);
  await expect(sort).toHaveText("Mặc định");
});

test("sort, filters and navbar search retain one another", async ({ page }) => {
  await page.goto("/jobs?category_ids=1&category_ids=4&sort=salary_desc");
  await page
    .getByRole("combobox", { name: "Hình thức làm việc", exact: true })
    .click();
  await page.getByRole("option", { name: "Từ xa", exact: true }).click();
  await expect(page).toHaveURL(
    /category_ids=1&category_ids=4&job_type=remote&sort=salary_desc$/,
  );
  await expect(
    page.getByRole("combobox", { name: "Hình thức làm việc", exact: true }),
  ).toHaveText("Từ xa");
  await page.getByLabel("Việc làm, công ty hoặc kỹ năng").fill("React");
  await page
    .getByRole("button", { name: "Tìm việc nhanh", exact: true })
    .click();
  await expect(page).toHaveURL(/keyword=React/);
  const params = new URL(page.url()).searchParams;
  expect(params.getAll("category_ids")).toEqual(["1", "4"]);
  expect(params.get("job_type")).toBe("remote");
  expect(params.get("sort")).toBe("salary_desc");
  await page
    .getByRole("combobox", { name: "Sắp xếp theo:", exact: true })
    .click();
  await page
    .getByRole("option", { name: "Liên quan nhất", exact: true })
    .click();
  await expect(page).toHaveURL(/sort=relevance$/);
  expect(new URL(page.url()).searchParams.get("keyword")).toBe("React");
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Sắp xếp theo:", exact: true }),
  ).toHaveText("Liên quan nhất");
  await page
    .getByRole("button", { name: "Tất cả danh mục", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Việc làm mới nhất", exact: true })
    .click();
  await expect(page).toHaveURL(/\/jobs\?sort=newest$/);
  await expect(
    page.getByRole("combobox", { name: "Sắp xếp theo:", exact: true }),
  ).toHaveText("Ngày đăng (mới nhất)");
});

for (const width of [360, 1440]) {
  test(`sorting is keyboard accessible and pagination fits at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/jobs");
    const sort = page.getByRole("combobox", {
      name: "Sắp xếp theo:",
      exact: true,
    });
    await sort.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("listbox")).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath("sort-menu.png"),
      fullPage: false,
    });
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/sort=newest$/);
    await expect(sort).toBeFocused();
    await expect(
      page.getByRole("navigation", { name: "Phân trang việc làm" }),
    ).toBeVisible();
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
      path: testInfo.outputPath("jobs-pagination.png"),
      fullPage: true,
    });
  });
}
