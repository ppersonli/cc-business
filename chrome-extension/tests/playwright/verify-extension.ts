/**
 * Playwright verification script for ScreenMind Chrome extension.
 * Launches Chrome with the extension loaded and verifies key UI elements.
 */
import { chromium } from 'playwright';
import path from 'path';

const EXTENSION_PATH = path.resolve(__dirname, '../../.output/chrome-mv3');

async function main() {
  console.log('Launching Chrome with ScreenMind extension...');

  const context = await chromium.launchPersistentContext(
    path.join(__dirname, '../../.test-chrome-profile'),
    {
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        '--no-first-run',
        '--no-default-browser-check',
      ],
      viewport: { width: 800, height: 600 },
    }
  );

  // Wait for extension to load
  await new Promise(r => setTimeout(r, 2000));

  // Find the extension's service worker
  const serviceWorker = context.serviceWorkers().find(sw =>
    sw.url().includes('chrome-extension://')
  );

  if (!serviceWorker) {
    console.error('Extension service worker not found');
    await context.close();
    process.exit(1);
  }

  console.log('Extension service worker loaded:', serviceWorker.url());

  // Open a test page
  const page = await context.newPage();
  await page.setContent('<h1>Test Page for ScreenMind</h1><p>This is a test page.</p>');

  // Open the popup
  const popupUrl = `chrome-extension://${serviceWorker.url().split('/')[2]}/popup.html`;
  console.log('\nOpening popup:', popupUrl);

  const popupPage = await context.newPage();
  await popupPage.goto(popupUrl);
  await popupPage.waitForLoadState('networkidle');

  await popupPage.screenshot({ path: path.join(__dirname, '../../.test-popup.png') });
  console.log('Popup screenshot saved');

  // Check popup UI elements
  const header = await popupPage.textContent('header h1');
  console.log('Header text:', header);

  const captureBtn = await popupPage.$('button:has-text("Capture Screenshot")');
  if (captureBtn) {
    console.log('Capture Screenshot button found');
  } else {
    console.log('Capture Screenshot button NOT found');
  }

  const settingsBtn = await popupPage.$('button[title="Settings"]');
  if (settingsBtn) {
    console.log('Settings button found');
  } else {
    console.log('Settings button NOT found');
  }

  // Open side panel
  const sidePanelUrl = `chrome-extension://${serviceWorker.url().split('/')[2]}/sidepanel.html`;
  console.log('\nOpening side panel:', sidePanelUrl);

  const sidePanelPage = await context.newPage();
  await sidePanelPage.goto(sidePanelUrl);
  await sidePanelPage.waitForLoadState('networkidle');

  await sidePanelPage.screenshot({ path: path.join(__dirname, '../../.test-sidepanel.png') });
  console.log('Side panel screenshot saved');

  const sideHeader = await sidePanelPage.textContent('header h1');
  console.log('Side panel header:', sideHeader);

  const tabs = await sidePanelPage.$$('.tabs button');
  console.log(`Nav tabs count: ${tabs.length}`);

  // Open options page
  const optionsUrl = `chrome-extension://${serviceWorker.url().split('/')[2]}/options.html`;
  console.log('\nOpening options page:', optionsUrl);

  const optionsPage = await context.newPage();
  await optionsPage.goto(optionsUrl);
  await optionsPage.waitForLoadState('networkidle');

  await optionsPage.screenshot({ path: path.join(__dirname, '../../.test-options.png') });
  console.log('Options screenshot saved');

  const optionsHeader = await optionsPage.textContent('header h1');
  console.log('Options header:', optionsHeader);

  const openaiRadio = await optionsPage.$('input[value="openai"]');
  const claudeRadio = await optionsPage.$('input[value="claude"]');
  if (openaiRadio && claudeRadio) {
    console.log('Provider selection (OpenAI + Claude) found');
  }

  const modelSelect = await optionsPage.$('select');
  if (modelSelect) {
    console.log('Model selector found');
  }

  const apiKeyInput = await optionsPage.$('input[type="password"]');
  if (apiKeyInput) {
    console.log('API key input found');
  }

  console.log('\nAll UI verification checks completed!');

  await context.close();
}

main().catch(console.error);
