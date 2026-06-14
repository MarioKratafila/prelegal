import { test, expect, Page } from '@playwright/test'

async function fillParty(page: Page, partyIndex: 0 | 1, data: {
  name: string; title: string; company: string; address: string
}) {
  const nameInputs = page.getByPlaceholder('Full name')
  const titleInputs = page.getByPlaceholder('e.g. CEO')
  const companyInputs = page.getByPlaceholder('Company name')
  const addressInputs = page.getByPlaceholder('Email or postal address')

  await nameInputs.nth(partyIndex).fill(data.name)
  await titleInputs.nth(partyIndex).fill(data.title)
  await companyInputs.nth(partyIndex).fill(data.company)
  await addressInputs.nth(partyIndex).fill(data.address)
}

test.describe('NDA Creator — app loads', () => {
  test('page renders without errors', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Mutual NDA Creator')).toBeVisible()
    await expect(page.getByText('Prelegal')).toBeVisible()
  })

  test('Download PDF button is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Download PDF' })).toBeVisible()
  })

  test('form panel is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByPlaceholder('e.g. Delaware')).toBeVisible()
  })

  test('preview panel is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Mutual Non-Disclosure Agreement').first()).toBeVisible()
  })
})

test.describe('NDA Creator — default state', () => {
  test('effective date defaults to today', async ({ page }) => {
    await page.goto('/')
    const today = new Date().toISOString().split('T')[0]
    await expect(page.locator('input[type="date"]')).toHaveValue(today)
  })

  test('expires radio is selected by default', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('input[value="expires"]')).toBeChecked()
  })

  test('years confidentiality radio is selected by default', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('input[value="years"]')).toBeChecked()
  })

  test('purpose is pre-filled', async ({ page }) => {
    await page.goto('/')
    const textarea = page.locator('textarea').first()
    await expect(textarea).not.toBeEmpty()
  })
})

test.describe('NDA Creator — form inputs update preview', () => {
  test('typing governing law shows it in preview', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('e.g. Delaware').fill('Texas')
    await expect(page.getByText('Texas').first()).toBeVisible()
  })

  test('typing jurisdiction shows it in preview', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('e.g. New Castle, DE').fill('Austin, TX')
    await expect(page.getByText('Austin, TX').first()).toBeVisible()
  })

  test('typing party 1 name shows it in preview table', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('Full name').first().fill('Alice Smith')
    await expect(page.getByText('Alice Smith').first()).toBeVisible()
  })

  test('typing party 2 name shows it in preview table', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('Full name').nth(1).fill('Bob Jones')
    await expect(page.getByText('Bob Jones').first()).toBeVisible()
  })

  test('typing modifications shows the modifications section', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('List any modifications to the standard terms').fill('Clause 3 amended.')
    await expect(page.getByText('MNDA Modifications').first()).toBeVisible()
    await expect(page.getByText('Clause 3 amended.').first()).toBeVisible()
  })

  test('clearing modifications hides the modifications section', async ({ page }) => {
    await page.goto('/')
    const textarea = page.getByPlaceholder('List any modifications to the standard terms')
    await textarea.fill('Some text')
    await expect(page.getByText('MNDA Modifications').first()).toBeVisible()
    await textarea.clear()
    await expect(page.getByText('MNDA Modifications')).not.toBeVisible()
  })
})

test.describe('NDA Creator — MNDA term radio buttons', () => {
  test('switching to "until terminated" updates preview', async ({ page }) => {
    await page.goto('/')
    await page.locator('input[value="until-terminated"]').click()
    await expect(
      page.getByText('Continues until terminated in accordance with the terms of the MNDA.').first()
    ).toBeVisible()
  })

  test('switching back to "expires" updates preview', async ({ page }) => {
    await page.goto('/')
    await page.locator('input[value="until-terminated"]').click()
    await page.locator('input[value="expires"]').click()
    await expect(page.getByText(/Expires \d+ year\(s\) from Effective Date/).first()).toBeVisible()
  })

  test('changing expires years updates preview text', async ({ page }) => {
    await page.goto('/')
    const yearsInputs = page.locator('input[type="number"]')
    await yearsInputs.first().fill('4')
    await expect(page.getByText('Expires 4 year(s) from Effective Date.').first()).toBeVisible()
  })
})

test.describe('NDA Creator — confidentiality term radio buttons', () => {
  test('switching to perpetuity updates preview', async ({ page }) => {
    await page.goto('/')
    await page.locator('input[value="perpetuity"]').click()
    await expect(page.getByText('In perpetuity.').first()).toBeVisible()
  })

  test('switching back to years updates preview', async ({ page }) => {
    await page.goto('/')
    await page.locator('input[value="perpetuity"]').click()
    await page.locator('input[value="years"]').click()
    await expect(page.getByText(/year\(s\) from Effective Date/).first()).toBeVisible()
  })
})

test.describe('NDA Creator — full happy path', () => {
  test('fills in all fields and preview reflects everything', async ({ page }) => {
    await page.goto('/')

    await page.locator('textarea').first().fill('Evaluating a strategic acquisition target')
    await page.locator('input[type="date"]').fill('2026-06-15')
    await page.locator('input[value="until-terminated"]').click()
    await page.locator('input[value="perpetuity"]').click()
    await page.getByPlaceholder('e.g. Delaware').fill('Delaware')
    await page.getByPlaceholder('e.g. New Castle, DE').fill('Wilmington, DE')
    await page.getByPlaceholder('List any modifications to the standard terms').fill('Section 11 amended.')

    await fillParty(page, 0, {
      name: 'Alice Smith',
      title: 'CEO',
      company: 'Acme Corp',
      address: 'alice@acme.com',
    })
    await fillParty(page, 1, {
      name: 'Bob Jones',
      title: 'CTO',
      company: 'Widget Inc',
      address: 'bob@widget.com',
    })

    await expect(page.getByText('Evaluating a strategic acquisition target').first()).toBeVisible()
    await expect(page.getByText('Delaware').first()).toBeVisible()
    await expect(page.getByText('Wilmington, DE').first()).toBeVisible()
    await expect(page.getByText('MNDA Modifications')).toBeVisible()
    await expect(page.getByText('Section 11 amended.').first()).toBeVisible()
    await expect(page.getByText('Alice Smith').first()).toBeVisible()
    await expect(page.getByText('Bob Jones').first()).toBeVisible()
    await expect(page.getByText('Acme Corp').first()).toBeVisible()
    await expect(page.getByText('Widget Inc').first()).toBeVisible()
    await expect(page.getByText('In perpetuity.').first()).toBeVisible()
    await expect(
      page.getByText('Continues until terminated in accordance with the terms of the MNDA.').first()
    ).toBeVisible()
  })
})

test.describe('NDA Creator — Download PDF button', () => {
  test('Download PDF button triggers window.print()', async ({ page }) => {
    // Register the override before goto so it applies on the initial page load.
    await page.addInitScript(() => {
      window.print = () => { (window as any).__printCalled = true }
    })
    await page.goto('/')
    await page.getByRole('button', { name: 'Download PDF' }).click()
    const printCalled = await page.evaluate(() => (window as any).__printCalled)
    expect(printCalled).toBe(true)
  })
})
