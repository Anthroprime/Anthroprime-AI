import { DEFAULTS, GPU_OPTIONS, DEPLOY_OPTIONS, buildBrief } from './request.js'

export const REQUEST_EMAIL = 'hello@anthroprime.com'
export const REQUEST_FORM = 'gpu-capacity'
export const REQUEST_CONSENT = 'Yes — contact me about this GPU capacity request'
export const REQUEST_LIMITS = {
  gpuType: 80,
  gpuQty: 500,
  location: 500,
  startDate: 10,
  duration: 500,
  workload: 4000,
  deployType: 80,
  company: 500,
  email: 254,
  phone: 500
}

export function canSubmitRequest(enabled, hostname) {
  const host = String(hostname).toLowerCase()
  return (
    enabled === true &&
    !!host &&
    !(
      host === 'localhost' ||
      host.endsWith('.localhost') ||
      host.endsWith('.local') ||
      /^127\./.test(host) ||
      host === '[::1]' ||
      host === '::1'
    )
  )
}

export function capacityEmailSubject(form) {
  const company = String(form.company || '')
    .replace(/[\r\n]/g, ' ')
    .trim()
  return `GPU capacity request: ${form.gpuType}${company ? ' — ' + company : ''}`.slice(
    0,
    180
  )
}

export function capacityEmailLink(form) {
  const subject = capacityEmailSubject(form)
  return `mailto:${REQUEST_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildBrief(form))}`
}

export function prepareCapacityRequest(form) {
  const values = Object.fromEntries(
    Object.keys(DEFAULTS).map((key) => [key, String(form[key] || '').trim()])
  )
  if (!values.gpuQty || !values.location || !values.company || !values.email)
    throw new Error(
      'Please complete GPU quantity, region, company, and business email.'
    )
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    throw new Error('Please enter a valid business email.')
  if (
    !GPU_OPTIONS.includes(values.gpuType) ||
    !DEPLOY_OPTIONS.includes(values.deployType)
  )
    throw new Error('Please select a GPU family and deployment model.')
  if (
    Object.entries(values).some(
      ([key, value]) => value.length > REQUEST_LIMITS[key]
    )
  )
    throw new Error(
      'One of the fields is too long. Please shorten it before reviewing your request.'
    )
  if (form['bot-field'])
    throw new Error(
      'The request could not be submitted. Please contact us by email.'
    )
  return values
}

export function encodeCapacityRequest(form, consent) {
  if (consent !== true)
    throw new Error('Please agree to be contacted about this request.')
  const values = prepareCapacityRequest(form)
  return new URLSearchParams({
    'form-name': REQUEST_FORM,
    'bot-field': '',
    subject: capacityEmailSubject(values),
    ...values,
    consent: REQUEST_CONSENT,
    brief: buildBrief(values)
  }).toString()
}

export async function submitCapacityRequest(
  form,
  {
    enabled,
    hostname,
    consent,
    fetchImpl = globalThis.fetch,
    timeoutMs = 15000
  } = {}
) {
  if (!canSubmitRequest(enabled, hostname))
    throw new Error(
      `Online submission is available on the live site. Email your brief to ${REQUEST_EMAIL}.`
    )
  const body = encodeCapacityRequest(form, consent)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: controller.signal
    })
    if (!response.ok) throw new Error('Submission was not accepted.')
  } catch {
    throw new Error(
      `Your request could not be confirmed. Your brief is still here. Try again or email ${REQUEST_EMAIL}.`
    )
  } finally {
    clearTimeout(timeout)
  }
}
