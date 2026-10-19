import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [360, 1440]) {
  test(`home and navbar share all province options at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page
      .getByRole("combobox", { name: "Địa điểm tìm việc", exact: true })
      .click();
    const homeOptions = await page.getByRole("option").allTextContents();
    expect(homeOptions).toHaveLength(35); // 34 provinces + the all-locations choice.
    expect(homeOptions).toContain("An Giang");
    expect(homeOptions).toContain("Vĩnh Long");
    expect(homeOptions).not.toContain("Bình Dương");
    await page.getByRole("option", { name: "Vĩnh Long", exact: true }).click();
    await page
      .getByLabel("Việc làm, công ty hoặc kỹ năng", { exact: true })
      .fill("");
    await page.getByRole("button", { name: "Tìm kiếm", exact: true }).click();
    await expect(page).toHaveURL(/city=/);
    expect(new URL(page.url()).searchParams.get("city")).toBe("Vĩnh Long");
    await expect(
      page.getByRole("heading", {
        name: "Không tìm thấy việc làm phù hợp với tiêu chí tìm kiếm",
      }),
    ).toBeVisible();
    const city = page.getByRole("combobox", {
      name: "Địa điểm tìm nhanh",
      exact: true,
    });
    await expect(city).toHaveText("Vĩnh Long");
    await city.click();
    expect(await page.getByRole("option").allTextContents()).toEqual(
      homeOptions,
    );
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.keyboard.press("Home");
    await page.keyboard.press("End");
    await expect(
      page.getByRole("option", { name: "Vĩnh Long", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(city).toBeFocused();
    await page.reload();
    await expect(city).toHaveText("Vĩnh Long");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
  });
}
