from playwright.sync_api import sync_playwright, expect, Page

def verify_daily_tips_integration(page: Page):
    """
    This script verifies that the 'Daily Tips' page is correctly integrated
    into the application's navigation and renders correctly.
    """
    try:
        # 1. Navigate to the application's home page.
        page.goto("http://localhost:5173", timeout=60000)

        # 2. Find and click the "Daily Tips" navigation link.
        # This uses a text selector that should be unique enough.
        daily_tips_link = page.get_by_role("link", name="Daily Tips")
        expect(daily_tips_link).to_be_visible(timeout=30000)
        daily_tips_link.click()

        # 3. Verify that the page has loaded by checking for its unique heading.
        heading = page.get_by_role("heading", name="Daily Farming Tips")
        expect(heading).to_be_visible()

        # 4. Take a screenshot for visual confirmation.
        page.screenshot(path="jules-scratch/verification/daily_tips_verification.png")

    except Exception as e:
        print(f"An error occurred during verification: {e}")
        page.screenshot(path="jules-scratch/verification/error_screenshot.png")
        raise

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_daily_tips_integration(page)
        browser.close()

if __name__ == "__main__":
    main()