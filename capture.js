const { chromium } = require('playwright-core');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function run() {
  // Start server
  const server = spawn('node', ['serve.ts', '--port', '8182']);
  await new Promise(resolve => setTimeout(resolve, 2000));

  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  try {
    await page.goto('http://127.0.0.1:8182/app/index.html', { timeout: 15000 });
    // Wait for content (heuristic check for trophy list container)
    await page.waitForSelector('.trophy-card, .trophy-item', { timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 1000)); // allow render
    await page.screenshot({ path: 'screenshots/1-list.jpg', type: 'jpeg', quality: 80 });

    // 2-detail.jpg: Filter by "platinum"
    await page.click('button:has-text("Platinum")', {timeout:10000});
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ path: 'screenshots/2-detail.jpg', type: 'jpeg', quality: 80 });

    // 3-progress.jpg: Check 2-3 checkboxes
    const checkboxes = await page.$$('input[type="checkbox"]');
    for (let i = 0; i < Math.min(checkboxes.length, 3); i++) {
        await page.evaluate((el) => {
            el.checked = true;
            el.dispatchEvent(new Event('change', { bubbles: true }));
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }, checkboxes[i]);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ path: 'screenshots/3-progress.jpg', type: 'jpeg', quality: 80 });

  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
    server.kill();
  }
}

run();
