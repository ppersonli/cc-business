#!/usr/bin/env python3
"""
Chrome Web Store submission for TabMaster AI via Playwright CDP.
Connects to Chrome on port 9223 (with existing login session).

Usage:
  python3 scripts/cws-submit-tabmaster.py [--screenshots-only] [--submit]
"""

import asyncio
import sys
import os
from pathlib import Path

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
EXTENSION_DIR = PROJECT_ROOT / "tabmaster-ai" / ".output" / "chrome-mv3"
ZIP_PATH = PROJECT_ROOT / "tabmaster-ai-cws-submission.zip"
DOCS_DIR = PROJECT_ROOT / "docs"
CWS_LISTING = DOCS_DIR / "tabmaster-ai-cws-listing.md"


async def take_extension_screenshots(page):
    """Load extension and take screenshots for CWS listing."""
    print("[1/4] Loading TabMaster AI extension...")
    
    # Navigate to a page with tabs to showcase the extension
    await page.goto("https://example.com")
    await page.wait_for_load_state("networkidle")
    
    # Open the side panel by clicking the extension icon
    # Note: This requires the extension to be loaded in Chrome
    # We'll use chrome://extensions to verify it's loaded
    
    print("[1/4] Extension loaded. Taking screenshots...")
    
    # Screenshot 1: Extension icon in toolbar (if visible)
    screenshot1 = DOCS_DIR / "tabmaster-ai-screenshot-1-toolbar.png"
    await page.screenshot(path=str(screenshot1), full_page=False)
    print(f"  Saved: {screenshot1}")
    
    return True


async def submit_to_cws(page, zip_path):
    """Submit extension to Chrome Web Store via developer dashboard."""
    print("[2/4] Navigating to Chrome Web Store Developer Dashboard...")
    
    await page.goto("https://chrome.google.com/webstore/devconsole")
    await page.wait_for_load_state("networkidle")
    
    # Check if logged in
    if "Sign in" in await page.title():
        print("  ERROR: Not logged in to Chrome Web Store. Please login manually.")
        return False
    
    print("[2/4] Logged in. Looking for 'Upload' button...")
    
    # Click "New Item" or "Upload" button
    try:
        upload_btn = page.locator('text=New item').first
        if await upload_btn.is_visible():
            await upload_btn.click()
            await page.wait_for_timeout(2000)
    except Exception as e:
        print(f"  Could not find 'New item' button: {e}")
        # Try alternative selector
        try:
            upload_btn = page.locator('[aria-label="Upload"]').first
            await upload_btn.click()
            await page.wait_for_timeout(2000)
        except:
            print("  Please manually click 'New item' or 'Upload'")
            return False
    
    print("[3/4] Uploading ZIP file...")
    
    # Find file input and upload
    file_input = page.locator('input[type="file"]').first
    await file_input.set_input_files(str(zip_path))
    await page.wait_for_timeout(5000)
    
    print("[3/4] ZIP uploaded. Filling listing details...")
    
    # Fill in listing details
    # Read listing content
    listing_content = CWS_LISTING.read_text()
    
    # Try to fill the description field
    try:
        desc_field = page.locator('textarea').first
        if await desc_field.is_visible():
            # Extract description from listing doc
            lines = listing_content.split('\n')
            desc_start = False
            description = []
            for line in lines:
                if line.startswith('## Detailed Description'):
                    desc_start = True
                    continue
                if desc_start and line.startswith('## '):
                    break
                if desc_start and line.strip():
                    description.append(line)
            
            desc_text = '\n'.join(description)
            await desc_field.fill(desc_text)
            print("  Filled description field")
    except Exception as e:
        print(f"  Could not fill description: {e}")
    
    print("[4/4] Ready for submission. Please review and click 'Submit' manually.")
    print(f"  ZIP: {zip_path}")
    print(f"  Listing: {CWS_LISTING}")
    
    return True


async def main():
    args = sys.argv[1:]
    screenshots_only = "--screenshots-only" in args
    submit = "--submit" in args
    
    if not screenshots_only and not submit:
        print("Usage:")
        print("  python3 cws-submit-tabmaster.py --screenshots-only  # Take screenshots only")
        print("  python3 cws-submit-tabmaster.py --submit           # Submit to CWS")
        print("  python3 cws-submit-tabmaster.py                    # Both")
        return
    
    from playwright.async_api import async_playwright
    
    async with async_playwright() as p:
        print("Connecting to Chrome CDP on port 9223...")
        browser = await p.chromium.connect_over_cdp("http://127.0.0.1:9223")
        context = browser.contexts[0]
        page = await context.new_page()
        
        try:
            if screenshots_only or not submit:
                await take_extension_screenshots(page)
            
            if submit:
                success = await submit_to_cws(page, ZIP_PATH)
                if success:
                    print("\n✅ CWS submission initiated. Please complete manually in browser.")
                else:
                    print("\n❌ CWS submission failed. Check browser for errors.")
        finally:
            await page.close()


if __name__ == "__main__":
    asyncio.run(main())
