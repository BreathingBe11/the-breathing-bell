import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3000'

async function validateEmail(email: string) {
  return fetch(`${BASE}/api/validate-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
}

test.describe('POST /api/validate-email', () => {
  test('gmail.com returns valid: true', async () => {
    const res = await validateEmail('test@gmail.com')
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.valid).toBe(true)
  })

  test('fake domain returns valid: false', async () => {
    const res = await validateEmail('test@notarealdomainxyz99999.com')
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.valid).toBe(false)
  })

  test('missing email returns 400', async () => {
    const res = await fetch(`${BASE}/api/validate-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(400)
  })
})
