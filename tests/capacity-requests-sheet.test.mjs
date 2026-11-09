import assert from 'node:assert/strict'
import test from 'node:test'
import { makeHandler } from '../netlify/functions/submission-created.mjs'
import { encodeCapacityRequest } from '../src/data/request-delivery.js'

const fields = {
  gpuType: 'H200', gpuQty: '8 GPUs', location: 'India', startDate: '2027-01-02',
  duration: '6 months', deployType: 'Bare Metal', workload: '=1+1',
  company: 'Example Co', email: 'gpu@example.com', phone: '+91 0000000000'
}
const payload = {
  form_name: 'gpu-capacity', id: 'test-submission', created_at: '2026-11-09T15:00:00Z',
  data: { ...Object.fromEntries(new URLSearchParams(encodeCapacityRequest(fields, true))), ip: '192.0.2.1' }
}
const request = (overrides = {}) => new Request('https://example.com/.netlify/functions/submission-created', {
  method: 'POST', body: JSON.stringify({ payload: { ...payload, ...overrides } })
})
const env = { CAPACITY_REQUESTS_SPREADSHEET_ID: 'workbook', CAPACITY_REQUESTS_GOOGLE_CREDENTIALS: 'test' }

test('appends a valid request as literal text to the dedicated tab', async () => {
  const calls = []
  const handle = makeHandler({ env, createClient: () => ({ request: async (options) => {
    calls.push(options)
    return { data: { permissions: [{ type: 'user' }] } }
  } }) })
  assert.equal((await handle(request())).status, 204)
  assert.equal(calls.length, 2)
  assert.match(calls[0].url, /\/workbook\/permissions$/)
  assert.match(decodeURIComponent(calls[1].url), /\/workbook\/values\/'GPU Capacity Requests'!A:M:append$/)
  assert.equal(calls[1].params.valueInputOption, 'RAW')
  assert.deepEqual(calls[1].data.values, [[
    '2026-11-09T15:00:00.000Z', 'test-submission', 'H200', '8 GPUs', 'India', '2027-01-02',
    '6 months', 'Bare Metal', '=1+1', 'Example Co', 'gpu@example.com', '+91 0000000000', payload.data.consent
  ]])
})

test('skips unconfigured deployments, other forms, and requests without consent', async () => {
  const createClient = () => assert.fail('Must not contact Google')
  assert.equal((await makeHandler({ env: {}, createClient })(request())).status, 204)
  const handle = makeHandler({ env, createClient })
  assert.equal((await handle(request({ form_name: 'contact' }))).status, 204)
  assert.equal((await handle(request({ data: { ...payload.data, consent: '' } }))).status, 204)
})

test('checks every permissions page and blocks link-shared destinations before writing', async () => {
  const handle = makeHandler({ env, createClient: () => ({ request: async ({ url, params }) => {
    assert.match(url, /\/permissions$/)
    return params.pageToken
      ? { data: { permissions: [{ type: 'anyone' }] } }
      : { data: { permissions: [{ type: 'user' }], nextPageToken: 'page-2' } }
  } }) })
  await assert.rejects(handle(request()), /must use restricted sharing/)
})

test('reports Sheets failures without including request data or credentials', async () => {
  const handle = makeHandler({ env, createClient: () => ({ request: async ({ method }) => {
    if (method === 'POST') throw new Error('Unredacted upstream error')
    return { data: { permissions: [{ type: 'user' }] } }
  } }) })
  await assert.rejects(handle(request()), { message: 'Could not append capacity request to Google Sheets' })
})
