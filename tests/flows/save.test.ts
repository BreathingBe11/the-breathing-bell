import { test, expect } from '@playwright/test'

test.describe('Save Page', () => {
  test('shows create account form by default (no auth session)', async ({ page }) => {
    await page.goto('/save')
    await expect(page.getByText('Create your profile')).toBeVisible()
    await expect(page.getByPlaceholder('Email')).toBeVisible()
    await expect(page.getByPlaceholder('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
  })

  test('toggles to sign in mode', async ({ page }) => {
    await page.goto('/save')
    await page.getByText(/Already have an account/i).click()
    await expect(page.getByText('Welcome back')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('toggles back to create account mode', async ({ page }) => {
    await page.goto('/save')
    await page.getByText(/Already have an account/i).click()
    await page.getByText(/New here/i).click()
    await expect(page.getByText('Create your profile')).toBeVisible()
  })
})
