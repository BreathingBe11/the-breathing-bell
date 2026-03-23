import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3000'
let ipCounter = 0

// Each call uses a unique IP so the in-memory rate limiter never triggers
async function postLeads(body: object) {
  const ip = `10.0.${Math.floor(ipCounter / 256)}.${ipCounter++ % 256}`
  return fetch(`${BASE}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  })
}

test.describe('POST /api/leads', () => {
  test('valid payload returns 200', async () => {
    const res = await postLeads({
      name: 'API Test',
      email: `apitest+${Date.now()}@gmail.com`,
      age_range: '30-39',
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
  })

  test('missing name returns 400', async () => {
    const res = await postLeads({ email: 'test@gmail.com', age_range: '30-39' })
    expect(res.status).toBe(400)
  })

  test('missing email returns 400', async () => {
    const res = await postLeads({ name: 'Test', age_range: '30-39' })
    expect(res.status).toBe(400)
  })

  test('missing age_range returns 400', async () => {
    const res = await postLeads({ name: 'Test', email: 'test@gmail.com' })
    expect(res.status).toBe(400)
  })

  test('invalid email format returns 400', async () => {
    const res = await postLeads({ name: 'Test', email: 'notanemail', age_range: '30-39' })
    expect(res.status).toBe(400)
  })

  test('invalid age_range value returns 400', async () => {
    const res = await postLeads({ name: 'Test', email: 'test@gmail.com', age_range: '100+' })
    expect(res.status).toBe(400)
  })
})
