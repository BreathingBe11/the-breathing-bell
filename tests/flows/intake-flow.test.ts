import { test, expect } from '@playwright/test'
import { fillStep1 } from '../helpers/intake'

test.describe('Intake Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/validate-email', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true }) })
    )
  })

  test('step 1 shows Who\'s arriving heading', async ({ page }) => {
    await page.goto('/intake')
    await expect(page.getByText(/Who.s arriving/i)).toBeVisible()
  })

  test('advances through all 4 steps and reaches breathe page', async ({ page }) => {
    await page.goto('/intake')

    // Step 1
    await fillStep1(page, { name: 'Omi', email: 'omi@gmail.com', ageRange: '40-49' })
    await page.getByRole('button', { name: /continue/i }).click()

    // Step 2
    await expect(page.getByText(/How are you walking in/i)).toBeVisible()
    await page.getByText('Overwhelmed').click()
    await page.getByRole('button', { name: /continue/i }).click()

    // Step 3
    await expect(page.getByText(/Where do you need it most/i)).toBeVisible()
    await page.getByText('Business').click()
    await page.getByRole('button', { name: /continue/i }).click()

    // Step 4 — use Box Breathing (4-7-8 is members-only)
    await expect(page.getByText(/Choose your practice/i)).toBeVisible()
    await page.getByText('Box Breathing').click()
    await page.getByRole('button', { name: '10m', exact: true }).click()
    await page.getByRole('button', { name: /begin/i }).click()

    await expect(page).toHaveURL('/session/breathe')
  })

  test('back button returns to previous step', async ({ page }) => {
    await page.goto('/intake')
    await fillStep1(page)
    await page.getByRole('button', { name: /continue/i }).click()

    await expect(page.getByText(/How are you walking in/i)).toBeVisible()
    await page.getByRole('button', { name: /back/i }).click()

    await expect(page.getByText(/Who.s arriving/i)).toBeVisible()
  })

  test('Begin button is disabled until technique AND duration are selected', async ({ page }) => {
    await page.goto('/intake')
    await fillStep1(page)
    await page.getByRole('button', { name: /continue/i }).click()
    await page.getByText('Maintaining').click()
    await page.getByRole('button', { name: /continue/i }).click()
    await page.getByText('Body').click()
    await page.getByRole('button', { name: /continue/i }).click()

    const beginBtn = page.getByRole('button', { name: /begin/i })
    await expect(beginBtn).toBeDisabled()

    // Select technique only
    await page.getByText('Yoga Nidra').click()
    await expect(beginBtn).toBeDisabled()

    // Select duration too
    await page.getByRole('button', { name: '10m', exact: true }).click()
    await expect(beginBtn).toBeEnabled()
  })

  test('3 guest techniques visible on step 4 (4-7-8 is members-only)', async ({ page }) => {
    await page.goto('/intake')
    await fillStep1(page)
    await page.getByRole('button', { name: /continue/i }).click()
    await page.getByText('Maintaining').click()
    await page.getByRole('button', { name: /continue/i }).click()
    await page.getByText('Body').click()
    await page.getByRole('button', { name: /continue/i }).click()

    await expect(page.getByText('Box Breathing')).toBeVisible()
    await expect(page.getByText('Double Inhale')).toBeVisible()
    await expect(page.getByText('Yoga Nidra')).toBeVisible()
    await expect(page.getByText('4-7-8 Breathing')).not.toBeVisible()
  })
})
