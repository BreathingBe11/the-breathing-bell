import { test, expect, Request } from '@playwright/test'
import { fillStep1 } from '../helpers/intake'

test.describe('Leads Capture', () => {
  test('POST /api/leads fires with correct payload and returns 200', async ({ page }) => {
    // Mock validate-email so DNS is not a test dependency
    await page.route('**/api/validate-email', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true }) })
    )

    let leadsRequest: Request | null = null
    let leadsResponseStatus: number | null = null

    page.on('request', (req) => {
      if (req.url().includes('/api/leads') && req.method() === 'POST') {
        leadsRequest = req
      }
    })
    page.on('response', async (res) => {
      if (res.url().includes('/api/leads')) {
        leadsResponseStatus = res.status()
      }
    })

    await page.goto('/intake')
    await fillStep1(page, {
      name: 'LeadTest',
      email: `leadtest+${Date.now()}@gmail.com`,
      ageRange: '30-39',
    })

    await page.getByRole('button', { name: /continue/i }).click()

    // Wait until step 2 is visible — confirms the request completed
    await expect(page.getByText(/How are you walking in/i)).toBeVisible({ timeout: 10000 })

    // Assert the request was fired
    expect(leadsRequest, 'leads API was never called').not.toBeNull()

    // Assert the payload shape
    const body = JSON.parse((leadsRequest as Request).postData() ?? '{}')
    expect(body.name).toBe('LeadTest')
    expect(body.email).toMatch(/@gmail\.com$/)
    expect(body.age_range).toBe('30-39')

    // THIS IS THE RLS TEST — 500 means the RLS policy is not applied
    expect(leadsResponseStatus, 'leads API returned non-200 (check Supabase RLS policy)').toBe(200)
  })

  test('Continue button is disabled when fields are missing', async ({ page }) => {
    await page.goto('/intake')

    const continueBtn = page.getByRole('button', { name: /continue/i })

    // No fields filled — disabled
    await expect(continueBtn).toBeDisabled()

    // Only name — still disabled
    await page.fill('input[placeholder="Your first name"]', 'Omi')
    await expect(continueBtn).toBeDisabled()

    // Name + email — still disabled (no age range)
    await page.fill('input[type="email"]', 'omi@gmail.com')
    await expect(continueBtn).toBeDisabled()

    // All three — enabled
    await page.getByRole('button', { name: '30-39', exact: true }).click()
    await expect(continueBtn).toBeEnabled()
  })

  test('does not fire POST /api/leads when fields are missing', async ({ page }) => {
    let leadsFired = false
    page.on('request', (req) => {
      if (req.url().includes('/api/leads')) leadsFired = true
    })

    await page.goto('/intake')
    await page.fill('input[type="email"]', 'partial@gmail.com')
    await page.getByRole('button', { name: '30-39', exact: true }).click()
    // No name — button is disabled

    expect(leadsFired).toBe(false)
  })

  test('shows error for invalid email format', async ({ page }) => {
    await page.goto('/intake')
    await page.fill('input[placeholder="Your first name"]', 'Omi')
    await page.fill('input[type="email"]', 'notanemail')
    await page.getByRole('button', { name: '18-29', exact: true }).click()
    await page.getByRole('button', { name: /continue/i }).click()

    await expect(page.getByText(/please enter a valid email/i)).toBeVisible()
  })

  test('shows error when MX record check fails', async ({ page }) => {
    await page.route('**/api/validate-email', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: false }) })
    )

    await page.goto('/intake')
    await page.fill('input[placeholder="Your first name"]', 'Omi')
    await page.fill('input[type="email"]', 'omi@fakedomain99999.com')
    await page.getByRole('button', { name: '18-29', exact: true }).click()
    await page.getByRole('button', { name: /continue/i }).click()

    await expect(page.getByText(/doesn't look valid/i)).toBeVisible()
  })
})
