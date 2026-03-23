import { test, expect } from '@playwright/test'

const SEEDED_INTAKE = {
  name: 'Test',
  email: 'test@gmail.com',
  ageRange: '30-39',
  walkingInState: 'Maintaining',
  domain: 'Body',
  technique: 'Box Breathing',
  durationMinutes: 10,
}

test.describe('Echo Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to any page first to get a localStorage context, then clear persisted state
    await page.goto('/intake')
    await page.evaluate(() => localStorage.removeItem('tbb-session'))
  })

  test('shows loading state then echo text on success', async ({ page }) => {
    // Seed the Zustand persist store so the echo page has intake.technique set
    await page.evaluate((intake) => {
      localStorage.setItem('tbb-session', JSON.stringify({ state: { intake }, version: 0 }))
    }, SEEDED_INTAKE)

    // Mock echo API — delay simulates network so loading state is visible before response
    await page.route('**/api/echo', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 400))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ echo: 'You showed up, and that changed everything.' }),
      })
    })

    await page.goto('/session/echo')

    // Loading state
    await expect(page.getByText('Listening...')).toBeVisible()

    // Echo text appears (page wraps in curly quotes, getByText does substring match)
    await expect(
      page.getByText('You showed up, and that changed everything.')
    ).toBeVisible({ timeout: 5000 })

    // Save button visible
    await expect(page.getByRole('button', { name: /save this session/i })).toBeVisible()
  })

  test('shows fallback message when echo API fails', async ({ page }) => {
    await page.evaluate((intake) => {
      localStorage.setItem('tbb-session', JSON.stringify({ state: { intake }, version: 0 }))
    }, SEEDED_INTAKE)

    await page.route('**/api/echo', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'fail' }) })
    )

    await page.goto('/session/echo')

    await expect(
      page.getByText('You showed up. That is the practice.')
    ).toBeVisible({ timeout: 5000 })
  })

  test('redirects to /intake when no session state exists', async ({ page }) => {
    // localStorage cleared in beforeEach — store will hydrate to empty intake
    await page.goto('/session/echo')
    await expect(page).toHaveURL('/intake', { timeout: 5000 })
  })
})
