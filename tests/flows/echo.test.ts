import { test, expect } from '@playwright/test'
import { completeFullIntake } from '../helpers/intake'

test.describe('Echo Page', () => {
  test('shows loading state then echo text on success', async ({ page }) => {
    await completeFullIntake(page)

    // Mock echo API — never hit real Claude API in tests
    await page.route('**/api/echo', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ echo: 'You showed up, and that changed everything.' }),
      })
    )

    await page.goto('/session/echo')

    // Loading state
    await expect(page.getByText('Listening...')).toBeVisible()

    // Echo text appears
    await expect(
      page.getByText('You showed up, and that changed everything.')
    ).toBeVisible({ timeout: 5000 })

    // Save button visible
    await expect(page.getByRole('button', { name: /save this session/i })).toBeVisible()
  })

  test('shows fallback message when echo API fails', async ({ page }) => {
    await completeFullIntake(page)

    await page.route('**/api/echo', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'fail' }) })
    )

    await page.goto('/session/echo')

    await expect(
      page.getByText('You showed up. That is the practice.')
    ).toBeVisible({ timeout: 5000 })
  })

  test('redirects to /intake when no session state exists', async ({ page }) => {
    // Navigate directly without going through intake
    await page.goto('/session/echo')
    await expect(page).toHaveURL('/intake', { timeout: 5000 })
  })
})
