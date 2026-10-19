import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("directory uses real pagination and preserves industry and search in URLs", async ({
  page,
}) => {
  await page.goto("/companies");
  await expect(page.getByTestId("company-card")).toHaveCount(6);
  await expect(page.locator(".company-filter-bar")).toContainText("17");
  await page
    .getByRole("link", { name: "Trang doanh nghiệp 2", exact: true })
    .click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByTestId("company-card").first()).toContainText(
    "Đồng Hành Media",
  );
  await page
    .getByRole("navigation", { name: "Lọc theo ngành doanh nghiệp" })
    .getByRole("link", { name: "Công nghệ thông tin (IT)", exact: true })
    .click();
  await expect(page).toHaveURL(/sector=technology$/);
  await page
    .getByRole("link", { name: "Trang doanh nghiệp 2", exact: true })
    .click();
  await expect(page).toHaveURL(/sector=technology&page=2/);
  await expect(page.getByTestId("company-card")).toHaveCount(1);
  await page.goBack();
  await expect(
    page.getByRole("link", { name: "Trang doanh nghiệp 1", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page
    .getByRole("navigation", { name: "Lọc theo ngành doanh nghiệp" })
    .getByRole("link", { name: "Ngân hàng / Tài chính", exact: true })
    .click();
  await expect(page).toHaveURL(/sector=finance$/);
  await expect(
    page.locator('.company-search input[name="sector"]'),
  ).toHaveValue("finance");
  await page
    .getByRole("searchbox", { name: "Tên doanh nghiệp", exact: true })
    .fill("ngan hang");
  await page.getByRole("button", { name: "Tìm công ty", exact: true }).click();
  await expect(page).toHaveURL(/keyword=ngan\+hang&sector=finance$/);
  expect(new URL(page.url()).searchParams.get("sector")).toBe("finance");
  await expect(page.getByTestId("company-card")).toHaveCount(1);
  await expect(page.getByTestId("company-card")).toContainText("Kỹ Thương");
  await page.reload();
  await expect(
    page.getByRole("searchbox", { name: "Tên doanh nghiệp", exact: true }),
  ).toHaveValue("ngan hang");
});

test("directory search has an honest empty state and resets filters", async ({
  page,
}) => {
  await page.goto("/companies?keyword=does-not-exist&sector=retail&page=999");
  await expect(
    page.getByRole("heading", { name: "Không tìm thấy doanh nghiệp phù hợp" }),
  ).toBeVisible();
  await expect(page.getByTestId("company-card")).toHaveCount(0);
  await page
    .getByRole("link", { name: "Xem tất cả doanh nghiệp", exact: true })
    .click();
  await expect(page).toHaveURL(/\/companies$/);
  await expect(page.getByTestId("company-card")).toHaveCount(6);
});

test("each featured company has its own profile and consistent open-job count", async ({
  page,
}) => {
  const companies = [
    { id: 1, name: "FPT Software", count: 3 },
    { id: 201, name: "Tập đoàn Viettel", count: 0 },
    { id: 202, name: "Vinamilk", count: 0 },
    { id: 203, name: "Techcombank", count: 0 },
    { id: 204, name: "Shopee Vietnam", count: 0 },
    { id: 205, name: "Vingroup", count: 0 },
  ];
  for (const company of companies) {
    await page.goto("/companies");
    await page
      .getByRole("link", { name: `Xem hồ sơ ${company.name}`, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`/companies/${company.id}$`));
    await expect(
      page.getByRole("heading", { level: 1, name: company.name, exact: true }),
    ).toBeVisible();
    await expect(page.getByTestId("company-job-card")).toHaveCount(
      company.count,
    );
    await expect(
      page.getByRole("link", {
        name: `Xem ${company.count} việc làm`,
        exact: true,
      }),
    ).toBeVisible();
    if (!company.count)
      await expect(
        page.getByRole("heading", {
          name: "Chưa có vị trí đang tuyển",
          exact: true,
        }),
      ).toBeVisible();
  }
});

test("company vacancies exclude closed jobs and link to the correct job and company", async ({
  page,
}) => {
  await page.goto("/companies/1");
  await expect(page.getByTestId("company-job-card")).toHaveCount(3);
  await expect(
    page.getByText("Đợt tuyển dụng đã đóng", { exact: false }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: /fptsoftware\.com/ }),
  ).toHaveAttribute("rel", "noopener noreferrer");
  await page
    .getByTestId("company-job-card")
    .first()
    .getByRole("link", { name: "Xem việc làm", exact: true })
    .click();
  await expect(page).toHaveURL(/\/jobs\/1$/);
  await page
    .locator(".detail-heading .company-name")
    .getByRole("link", { name: "FPT Software", exact: true })
    .click();
  await expect(page).toHaveURL(/\/companies\/1$/);
  await page
    .getByRole("button", { name: "Lưu việc làm", exact: true })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Lưu việc làm", exact: true }).first(),
  ).toBeFocused();
});

test("company directory is reachable from header and home, and sharing copies its URL", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Xem Tất Cả Doanh Nghiệp", exact: true })
    .click();
  await expect(page).toHaveURL(/\/companies$/);
  await page
    .getByRole("button", { name: "Tất cả danh mục", exact: true })
    .click();
  await page.getByRole("link", { name: "Tất cả công ty", exact: true }).click();
  await expect(page).toHaveURL(/\/companies$/);
  await page
    .getByRole("link", { name: "Xem hồ sơ FPT Software", exact: true })
    .click();
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page
    .getByRole("button", { name: "Chia sẻ hồ sơ", exact: true })
    .click();
  await expect(
    page.getByText("Đã sao chép liên kết hồ sơ công ty.", { exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    new URL("/companies/1", page.url()).href,
  );
});

test("missing or malformed company IDs show a useful not-found state", async ({
  page,
}) => {
  for (const id of ["invalid", "0", "01", "999999", "9007199254740993"]) {
    await page.goto(`/companies/${id}`);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Không tìm thấy doanh nghiệp",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: "Xem danh sách doanh nghiệp",
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
      "content",
      /noindex/,
    );
  }
});

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`company pages fit ${width}px and retain accessible structure`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const path of ["/companies", "/companies/1", "/companies/201"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(1);
      if (width === 360 || width === 1440) {
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
              .analyze()
          ).violations,
        ).toEqual([]);
        await page.screenshot({
          path: testInfo.outputPath(`${path.replaceAll("/", "-")}.png`),
          fullPage: true,
        });
      }
    }
  });
}
