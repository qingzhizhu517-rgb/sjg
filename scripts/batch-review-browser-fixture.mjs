// Local accessibility fixture only. Actual DB publication is covered by PlatformSecurityIT.
export async function prepareBatchReviewBrowser(context, page) {
  await context.addInitScript(() => {
    localStorage.setItem('token', 'local-batch-a11y-fixture')
    localStorage.setItem('username', 'local-reviewer')
    localStorage.setItem('role', 'admin')
  })
  const records = [
    { id: 1, entityType: 'poem', entityId: 31, status: 'needs_review' },
    { id: 2, entityType: 'cultural_item', entityId: 42, status: 'needs_review' },
  ]
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url())
    let data = { records: [], total: 0 }
    if (url.pathname.endsWith('/batch-approve')) {
      const request = route.request().postDataJSON()
      if (JSON.stringify(request.reviewIds) !== '[1,2]') throw new Error('Batch selection changed')
      records[0].status = 'published'
      data = {
        total: 2,
        successCount: 1,
        failureCount: 1,
        items: [
          { reviewId: 1, success: true, status: 'published', message: '审核通过，已发布到用户端' },
          { reviewId: 2, success: false, message: '实体至少需要一条来源关联才能发布' },
        ],
      }
    } else if (url.pathname.endsWith('/content-reviews')) {
      const pending = records.filter((row) => row.status === 'needs_review')
      data = { records: pending, total: pending.length }
    }
    await route.fulfill({ json: { code: 200, message: '成功', data } })
  })
}

export async function exerciseBatchReviewBrowser(page) {
  await page.getByRole('tab', { name: '审核队列' }).click()
  await page.locator('label[aria-label="选择所有行"]').click()
  await page.getByRole('textbox', { name: '批量审核备注' }).fill('内容与来源已核验')
  await page.getByRole('button', { name: '批量通过并发布', exact: true }).click()
  await page.getByRole('button', { name: '通过并发布', exact: true }).click()
  await page.locator('.el-message-box__wrapper').waitFor({ state: 'hidden' })
  await page.getByText('实体至少需要一条来源关联才能发布', { exact: true }).waitFor()
  await page.getByText('已选 0 条待审核数据（仅当前页）', { exact: true }).waitFor()
  await page.screenshot({ path: '.local/quality/batch-review-result.png', fullPage: true })
}
