const puppeteer = require("puppeteer");
const path = require("path");

const extensionPath = path.join(__dirname, "dist", "chrome"); // path to the extension
let browser;
let appPage;
let extPage;
let optUrl;

describe("Extension Loading", () => {
  beforeAll(async () => {
    const {
      devtools = false,
      slowMo = false,
      appUrl,
    } = { appUrl: "https://www.irisluckhaus.de/en/start/" };
    browser = await puppeteer.launch({
      headless: false,
      devtools,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
      ...(slowMo && { slowMo }),
    });

    appPage = await browser.newPage();
    await appPage.goto(appUrl, { waitUntil: "load" });

    const targets = await browser.targets();
    const extensionTarget = targets.find(
      (target) => target.type() === "service_worker"
    );
    const partialExtensionUrl = extensionTarget.url() || "";
    const [, , extensionId] = partialExtensionUrl.split("/");

    extPage = await browser.newPage();
    const extensionUrl = `chrome-extension://${extensionId}/js/index.html`;
    optUrl = `chrome-extension://${extensionId}/js/options.html`;
    await extPage.goto(extensionUrl, { waitUntil: "load" });
  });

  afterAll(() => {
    if (browser) {
      browser.close();
    }
  });

  test("Click scrape button", async () => {
    // Bring extension page to the front
    extPage.bringToFront();

    // Find the button on the web page by its id
    const btn = await extPage.$("#start-scraping-button");

    // Make sure the button is not null before proceeding
    if (!btn) {
      throw new Error("Button not found");
    }

    // You can get the button text if necessary
    const btnText = await btn.evaluate((e) => e.innerText);
    expect(btnText).toEqual("Inspect");

    // Then click the button
    await btn.click();

    // Wait for the "searching-animation" element to appear on the page
    await extPage.waitForSelector("#searching-animation");

    // Find the "searching-animation" element on the web page by its id
    const animationElement = await extPage.$("#searching-animation");

    // Make sure the "searching-animation" element is not null
    if (!animationElement) {
      throw new Error("'searching-animation' element not found");
    }

    // Add further checks or actions if necessary
    console.log("'searching-animation' element found!");
  }, 10000); // This test has a 10 second timeout

  test("Click info button", async () => {
    // Bring extension page to the front
    extPage.bringToFront();

    // Find the button on the web page by its id
    const btn = await extPage.$("#info-button");

    // Make sure the button is not null before proceeding
    if (!btn) {
      throw new Error("Button not found");
    }

    // Create a promise for a new page to be opened
    const newPagePromise = new Promise((resolve) =>
      browser.once("targetcreated", (target) => resolve(target.page()))
    );

    // Click the button which opens a new page
    await btn.click();

    // Wait for the new page to open
    const newPage = await newPagePromise;

    // Get the current page URL
    const currentUrl = newPage.url();

    // Check if the current URL matches optUrl
    expect(currentUrl).toEqual(optUrl);
  }, 10000); // This test has a 10 second timeout
});
