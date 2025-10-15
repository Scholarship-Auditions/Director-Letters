from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    context = browser.new_context()
    page = context.new_page()

    # 1. Verify "Add New Letter" is hidden for unauthenticated users
    page.goto("http://localhost:3100/letters")
    page.screenshot(path="jules-scratch/verification/letters_unauthenticated.png")

    # 2. Register a new user
    page.goto("http://localhost:3100/register")
    page.fill('input[name="username"]', "test@example.com")
    page.fill('input[name="password"]', "password")
    page.click('button[type="submit"]')
    page.wait_for_url("http://localhost:3100/adminhome")

    # 3. Verify "Add New Letter" is visible for authenticated users
    page.goto("http://localhost:3100/letters")
    page.screenshot(path="jules-scratch/verification/letters_authenticated.png")

    # 4. Verify "Edit" and "Delete" buttons are visible on letter detail page
    # First, get the URL of a letter to navigate to
    letter_link = page.query_selector('a.btn.btn-primary')
    if letter_link:
        letter_url = letter_link.get_attribute('href')
        page.goto(f"http://localhost:3100{letter_url}")
        page.screenshot(path="jules-scratch/verification/letter_index_authenticated.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)