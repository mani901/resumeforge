import puppeteer, { type Browser } from "puppeteer";

const globalForPdf = globalThis as unknown as { pdfBrowser?: Promise<Browser> };

export function getBrowser(): Promise<Browser> {
  if (!globalForPdf.pdfBrowser) {
    globalForPdf.pdfBrowser = puppeteer.launch({ headless: true });
  }
  return globalForPdf.pdfBrowser;
}

export async function renderPageToPdf(url: string): Promise<Uint8Array> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30_000 });
    await page.evaluate(() => document.fonts.ready);
    return await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
  } finally {
    await page.close();
  }
}
