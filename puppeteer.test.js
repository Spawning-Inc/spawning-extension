const puppeteer = require("puppeteer");
const path = require("path");

const extensionPath = path.join(__dirname, "dist", "chrome"); // path to the extension
let browser;
let page;

describe("Extension Loading", () => {
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false, // extension are allowed only in head-full mode
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });

    page = await browser.newPage();
  });

  afterAll(() => {
    if (browser) {
      browser.close();
    }
  });

  test("Iris Luckhaus | Illustration & Design Portfolio | Wuppertal & Berlin", async () => {
    await page.goto("https://www.irisluckhaus.de/en/start/");
    const title = await page.title();
    expect(title).toBe(
      "Iris Luckhaus | Illustration & Design Portfolio | Wuppertal & Berlin"
    );
  });
});
