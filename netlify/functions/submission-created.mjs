import { JWT } from 'google-auth-library'
import {
  prepareCapacityRequest, REQUEST_CONSENT, REQUEST_FORM
} from '../../src/data/request-delivery.js'

const TAB = 'GPU Capacity Requests'
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
]

function makeClient(credentials) {
  try {
    const { type, client_email: email, private_key: key } = JSON.parse(credentials)
    if (type !== 'service_account' || !email || !key) throw new Error()
    return new JWT({ email, key, scopes: SCOPES })
  } catch {
    throw new Error('Invalid Google service account credentials')
  }
}

export function makeHandler({ env = process.env, createClient = makeClient } = {}) {
  return async function handler(request) {
    if (request.method !== 'POST') return new Response(null, { status: 405 })

    // Netlify verifies the platform signature for this reserved event function.
    const { payload } = await request.json()
    if (payload?.form_name !== REQUEST_FORM) return new Response(null, { status: 204 })

    const id = env.CAPACITY_REQUESTS_SPREADSHEET_ID
    const credentials = env.CAPACITY_REQUESTS_GOOGLE_CREDENTIALS
    if (!id && !credentials) return new Response(null, { status: 204 })
    if (!/^[a-zA-Z0-9_-]+$/.test(id || '') || !credentials)
      throw new Error('Capacity request spreadsheet settings are incomplete')

    const data = payload.data
    if (!data || data['bot-field'] || data.consent !== REQUEST_CONSENT)
      return new Response(null, { status: 204 })

    let values
    try {
      values = prepareCapacityRequest(data)
    } catch {
      return new Response(null, { status: 204 })
    }

    if (typeof payload.id !== 'string' || !payload.id || !Number.isFinite(Date.parse(payload.created_at)))
      throw new Error('Capacity request event is missing submission metadata')

    const row = [
      new Date(payload.created_at).toISOString(), payload.id,
      values.gpuType, values.gpuQty, values.location, values.startDate,
      values.duration, values.deployType, values.workload, values.company,
      values.email, values.phone, data.consent
    ]

    const client = createClient(credentials)
    const permissionUrl = `https://www.googleapis.com/drive/v3/files/${id}/permissions`
    let pageToken
    do {
      let page
      try {
        const result = await client.request({
          url: permissionUrl,
          params: { fields: 'nextPageToken,permissions(type)', supportsAllDrives: true, pageToken },
          timeout: 5000,
          retry: false
        })
        page = result.data
        if (!Array.isArray(page.permissions) || !page.permissions.length) throw new Error()
      } catch {
        throw new Error('Could not verify capacity request spreadsheet sharing')
      }
      if (page.permissions.some(({ type }) => !['user', 'group'].includes(type)))
        throw new Error('Capacity request spreadsheet must use restricted sharing')
      pageToken = page.nextPageToken
    } while (pageToken)

    try {
      await client.request({
        url: `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${encodeURIComponent(`'${TAB}'!A:M`)}:append`,
        method: 'POST',
        params: { valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS' },
        data: { values: [row] },
        timeout: 8000,
        retry: false
      })
    } catch {
      // Google's request error can contain the row and authorization headers.
      throw new Error('Could not append capacity request to Google Sheets')
    }
    return new Response(null, { status: 204 })
  }
}

export default makeHandler()
