import { Page } from '@playwright/test'

export async function fillStep1(
  page: Page,
  opts: { name?: string; email?: string; ageRange?: string } = {}
) {
  const name = opts.name ?? 'Omi'
  const email = opts.email ?? 'omi@gmail.com'
  const ageRange = opts.ageRange ?? '30-39'

  await page.fill('input[placeholder="Your first name"]', name)
  await page.fill('input[type="email"]', email)
  await page.getByRole('button', { name: ageRange, exact: true }).click()
}

export async function completeFullIntake(page: Page) {
  // Mock validate-email so DNS is not a test dependency
  await page.route('**/api/validate-email', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true }) })
  )

  await page.goto('/intake')
  await fillStep1(page)
  await page.getByRole('button', { name: /continue/i }).click()

  // Step 2: walking-in state
  await page.getByText('Maintaining').click()
  await page.getByRole('button', { name: /continue/i }).click()

  // Step 3: domain
  await page.getByText('Body').click()
  await page.getByRole('button', { name: /continue/i }).click()

  // Step 4: technique + duration
  await page.getByText('Box Breathing').click()
  await page.getByRole('button', { name: '10m', exact: true }).click()
  // Now on /session/breathe with intake state populated
}
