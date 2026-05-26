/**
 * E2E coverage for css-drawer's built-in body scroll lock in Chromium with
 * mobile emulation (iPhone-13-ish viewport + touch + mobile UA — same profile
 * as Chrome DevTools "Toggle device toolbar").
 *
 * The smoking-gun test is "drawer → drawer transition" — this is the actual
 * bug consumers hit (menu drawer closes + checkout drawer opens in the same
 * synchronous handler, and the page jumps to the wrong scroll position
 * because their own consumer-side `useEffect` lock cleanup runs mid-swap).
 * With v0.4.0's counter-based lock, the count goes 1 → 1 and the body
 * remains pinned throughout the swap.
 *
 * Implementation notes:
 *
 * - We open drawers via `page.evaluate(() => button.click())` instead of
 *   `page.getByRole('button').click()`. Playwright's click does
 *   `scrollIntoViewIfNeeded` first, which moves the page off our target
 *   scrollY before the lock snapshot is taken.
 * - The in-drawer trigger buttons are safe to click via Playwright because by
 *   that point the body is `position: fixed` (the lock has been applied), so
 *   click's scroll-into-view is a no-op on the underlying document.
 */
import { expect, test, type Page } from '@playwright/test'

const TARGET_SCROLL_Y = 800

async function scrollTo(page: Page, y: number) {
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior }),
    y,
  )
  await page.waitForFunction((y) => Math.abs(window.scrollY - y) < 2, y)
}

async function scrollY(page: Page) {
  return page.evaluate(() => Math.round(window.scrollY))
}

async function bodyStyles(page: Page) {
  return page.evaluate(() => ({
    position: document.body.style.position,
    top: document.body.style.top,
    width: document.body.style.width,
  }))
}

async function clickInDom(page: Page, testId: string) {
  await page.evaluate((id) => {
    const el = document.querySelector<HTMLElement>(`[data-testid="${id}"]`)
    if (!el) throw new Error(`no element with data-testid="${id}"`)
    el.click()
  }, testId)
}

async function waitForOpenDrawer(page: Page) {
  await page.waitForFunction(
    () => !!document.querySelector('dialog.drawer[open]'),
  )
}

async function waitForClosedDrawer(page: Page) {
  await page.waitForFunction(
    () => !document.querySelector('dialog.drawer[open]'),
  )
}

test.describe('Scroll lock on drawer open/close', () => {
  test('standard drawer pins the body at the snapshot scrollY and restores on close', async ({
    page,
  }) => {
    await page.goto('/')
    await scrollTo(page, TARGET_SCROLL_Y)
    expect(await scrollY(page)).toBe(TARGET_SCROLL_Y)

    // Open the menu drawer (it auto-scrolls to 800 first, then opens).
    // We use it as a generic locking drawer for this baseline test.
    await clickInDom(page, 'open-menu-drawer')
    await waitForOpenDrawer(page)

    const locked = await bodyStyles(page)
    expect(locked.position).toBe('fixed')
    expect(locked.top).toBe(`-${TARGET_SCROLL_Y}px`)
    expect(locked.width).toBe('100%')

    await page.keyboard.press('Escape')
    await waitForClosedDrawer(page)

    expect(await scrollY(page)).toBe(TARGET_SCROLL_Y)
    const cleared = await bodyStyles(page)
    expect(cleared.position).toBe('')
    expect(cleared.top).toBe('')
    expect(cleared.width).toBe('')
  })

  test('opt-out drawer (scrollLock={false}) does NOT lock the body', async ({ page }) => {
    await page.goto('/')
    await scrollTo(page, TARGET_SCROLL_Y)

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
      const optOut = btns.find((b) => b.textContent?.includes('Opt-out drawer'))
      optOut?.click()
    })
    await waitForOpenDrawer(page)

    const styles = await bodyStyles(page)
    expect(styles.position).toBe('')
    expect(styles.top).toBe('')
  })
})

test('drawer → drawer transition keeps the lock held — the @commercengine/checkout case', async ({
  page,
}) => {
  // Same-tick close-A + open-B. Counter goes 1 → 1. Body remains pinned at
  // the original -800px throughout; only released when the LAST drawer
  // (checkout) closes — at which point scroll restores to the original 800.
  await page.goto('/')

  // Triggers auto-scroll to 800 + opens the menu drawer in a microtask.
  await clickInDom(page, 'open-menu-drawer')
  await waitForOpenDrawer(page)

  const lockedBefore = await bodyStyles(page)
  expect(lockedBefore.position).toBe('fixed')
  expect(lockedBefore.top).toBe('-800px')

  // Click "Sign in" — closes menu + opens checkout in the same handler.
  await page.getByTestId('menu-sign-in').click()
  await waitForOpenDrawer(page) // checkout is now the open one

  // The demo captures body styles synchronously DURING the swap (right
  // after both close+open calls, before next paint). If the lock is truly
  // held, body styles must be unchanged.
  const duringPos = await page
    .getByTestId('drawer-swap-during-position')
    .innerText()
  const duringTop = await page
    .getByTestId('drawer-swap-during-top')
    .innerText()
  console.log(
    `[drawer-swap] during swap: body.position=${duringPos} body.top=${duringTop}`,
  )
  expect(duringPos).toBe('fixed')
  expect(duringTop).toBe('-800px')

  const lockedDuring = await bodyStyles(page)
  expect(lockedDuring.position).toBe('fixed')
  expect(lockedDuring.top).toBe('-800px')

  // Close the checkout — last drawer closing should release the lock and
  // restore scroll to the original 800.
  await page.getByTestId('checkout-close').click()
  await waitForClosedDrawer(page)

  await page.waitForFunction(() => {
    const el = document.querySelector(
      '[data-testid="drawer-swap-final-scroll"]',
    )
    return el && el.textContent !== '-1'
  })
  const finalText = await page
    .getByTestId('drawer-swap-final-scroll')
    .innerText()
  const finalY = parseInt(finalText, 10)
  console.log(`[drawer-swap] final scrollY after close = ${finalY}`)
  expect(finalY).toBe(800)

  const cleared = await bodyStyles(page)
  expect(cleared.position).toBe('')
  expect(cleared.top).toBe('')
})
