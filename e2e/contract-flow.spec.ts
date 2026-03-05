import { test, expect } from "@playwright/test";

test.describe("Contract Manager E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('input[type="email"]', "demo@contract-manager.app");
    await page.fill('input[type="password"]', "Demo1234!");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard");
  });

  test("should show dashboard with stats", async ({ page }) => {
    await expect(page.getByText("Willkommen")).toBeVisible();
    await expect(page.getByText("Gesamt")).toBeVisible();
    await expect(page.getByText("Aktiv")).toBeVisible();
  });

  test("should list contracts", async ({ page }) => {
    await page.click('a[href="/contracts"]');
    await page.waitForURL("**/contracts");
    await expect(page.getByText("Verträge")).toBeVisible();
    await expect(page.getByText("Büromietvertrag Hamburg")).toBeVisible();
  });

  test("should create a new contract", async ({ page }) => {
    await page.goto("/contracts/new");
    await page.fill("#title", "E2E Test Vertrag");
    await page.fill("#counterparty", "Test GmbH");
    await page.click('button[type="submit"]');

    // Should redirect to contract detail
    await expect(page.getByText("E2E Test Vertrag")).toBeVisible();
    await expect(page.getByText("Test GmbH")).toBeVisible();
  });

  test("should filter contracts by status", async ({ page }) => {
    await page.goto("/contracts");
    // Open status filter
    await page.click("text=Alle Status");
    await page.click("text=Entwurf");
    // Should show only draft contracts
    await expect(page.getByText("Arbeitsvertrag Entwickler")).toBeVisible();
  });

  test("should navigate to contract detail", async ({ page }) => {
    await page.goto("/contracts");
    await page.click("text=Büromietvertrag Hamburg");
    await expect(page.getByText("Alster Immobilien GmbH")).toBeVisible();
    await expect(page.getByText("Details")).toBeVisible();
  });

  test("should generate PDF from template", async ({ page }) => {
    await page.goto("/contracts");
    await page.click("text=Büromietvertrag Hamburg");

    // Click PDF erstellen
    await page.click("text=PDF erstellen");
    await expect(page.getByText("Dokument aus Vorlage erstellen")).toBeVisible();

    // Select template
    await page.click("text=Vorlage wählen...");
    await page.click("text=Mietvertrag Standard");

    // Fill required fields
    await page.fill('input >> nth=0', "Test Mieter");
    await page.fill('input >> nth=1', "Musterstraße 1");
    await page.fill('input >> nth=2', "Test Vermieter");
    await page.fill('input >> nth=3', "Bürostraße 5");

    // Click generate (downloads PDF)
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click("text=PDF generieren"),
    ]);

    expect(download.suggestedFilename()).toContain(".pdf");
  });

  test("should export contracts as CSV", async ({ page }) => {
    await page.goto("/contracts");

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click("text=CSV Export"),
    ]);

    expect(download.suggestedFilename()).toContain(".csv");
  });

  test("should toggle dark mode", async ({ page }) => {
    // Click theme toggle
    await page.click('button:has-text("Design wechseln")');
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);
  });
});
