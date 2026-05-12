import { test, expect } from '@playwright/test'

test('landing loads and shows CTA', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: /giriş/i })).toBeVisible()
})

