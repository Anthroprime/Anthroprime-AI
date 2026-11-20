import { COLLABORATOR_TYPES } from './infrastructure.js'
import { REQUEST_EMAIL, canSubmitRequest } from './request-delivery.js'

// "Become a collaborator" — Netlify form registered in index.html.
// Email notification recipients are configured in the Netlify project.
export const COLLAB_FORM = 'collaborator'
export const COLLAB_CONSENT =
  'Yes — contact me about joining the AnthroPrime collaborator network'
export const DATA_NOTICE_URL = 'https://anthroprime.com/data-notice'

export const COLLAB_DEFAULTS = {
  company: '',
  website: '',
  name: '',
  email: '',
  phone: '',
  collaboratorType: COLLABORATOR_TYPES[0],
  offer: '',
  regions: ''
}
export const COLLAB_LIMITS = {
  company: 200,
  website: 300,
  name: 200,
  email: 254,
  phone: 60,
  collaboratorType: 60,
  offer: 4000,
  regions: 500
}

export function collaboratorSubject(type) {
  return `New collaborator — ${String(type).replace(/[\r\n]/g, ' ').trim()}`.slice(
    0,
    120
  )
}

export function prepareCollaborator(form) {
  const values = Object.fromEntries(
    Object.keys(COLLAB_DEFAULTS).map((key) => [
      key,
      String(form[key] || '').trim()
    ])
  )
  if (!values.company || !values.name || !values.email || !values.offer)
    throw new Error(
      'Please complete company name, contact name, email and what you offer.'
    )
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    throw new Error('Please enter a valid email address.')
  if (!COLLABORATOR_TYPES.includes(values.collaboratorType))
    throw new Error('Please select a collaborator type.')
  if (Object.entries(values).some(([k, v]) => v.length > COLLAB_LIMITS[k]))
    throw new Error('One of the fields is too long. Please shorten it.')
  if (form['bot-field'])
    throw new Error(
      `The form could not be submitted. Please email ${REQUEST_EMAIL}.`
    )
  return values
}

export function collaboratorSummary(values) {
  return [
    `Collaborator type: ${values.collaboratorType}`,
    `Company: ${values.company}`,
    `Website: ${values.website || '—'}`,
    `Contact: ${values.name}`,
    `Email: ${values.email}`,
    `Phone: ${values.phone || '—'}`,
    `Region(s): ${values.regions || '—'}`,
    '',
    'What we offer:',
    values.offer
  ].join('\n')
}

export function collaboratorEmailLink(form) {
  const values = Object.fromEntries(
    Object.keys(COLLAB_DEFAULTS).map((k) => [k, String(form[k] || '').trim()])
  )
  return `mailto:${REQUEST_EMAIL}?subject=${encodeURIComponent(collaboratorSubject(values.collaboratorType))}&body=${encodeURIComponent(collaboratorSummary(values))}`
}

export function encodeCollaborator(form, consent) {
  if (consent !== true)
    throw new Error('Please agree to be contacted about joining the network.')
  const values = prepareCollaborator(form)
  return new URLSearchParams({
    'form-name': COLLAB_FORM,
    'bot-field': '',
    subject: collaboratorSubject(values.collaboratorType),
    ...values,
    consent: COLLAB_CONSENT
  }).toString()
}

export async function submitCollaborator(
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
      `Online submission is available on the live site. Email ${REQUEST_EMAIL} instead.`
    )
  const body = encodeCollaborator(form, consent)
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
      `We could not confirm your submission. Your details are still here. Try again or email ${REQUEST_EMAIL}.`
    )
  } finally {
    clearTimeout(timeout)
  }
}
