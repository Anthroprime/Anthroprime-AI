import React, { useEffect, useRef, useState } from 'react'
import { ArrowRight, Handshake, LoaderCircle, Mail } from 'lucide-react'
import { COLLABORATOR_TYPES } from '../data/infrastructure'
import { REQUEST_EMAIL, canSubmitRequest } from '../data/request-delivery'
import {
  COLLAB_DEFAULTS,
  COLLAB_LIMITS,
  COLLAB_FORM,
  DATA_NOTICE_URL,
  collaboratorEmailLink,
  prepareCollaborator,
  submitCollaborator
} from '../data/collaborator-delivery'

// Grouped like a partner application: company, contact, then the offer.
const GROUPS = [
  {
    legend: 'Company',
    fields: [
      { label: 'Company name', name: 'company', required: true, autoComplete: 'organization' },
      { label: 'Website', name: 'website', type: 'url', placeholder: 'https://', autoComplete: 'url' }
    ]
  },
  {
    legend: 'Contact',
    fields: [
      { label: 'Contact name', name: 'name', required: true, autoComplete: 'name', wide: true },
      { label: 'Email', name: 'email', type: 'email', required: true, autoComplete: 'email' },
      { label: 'Phone / WhatsApp', name: 'phone', type: 'tel', autoComplete: 'tel' }
    ]
  },
  {
    legend: 'What you offer',
    fields: [
      { label: 'Collaborator type', name: 'collaboratorType', options: COLLABORATOR_TYPES },
      { label: 'Region(s)', name: 'regions', placeholder: 'e.g. India, Middle East, Europe' },
      {
        label: 'What you offer',
        name: 'offer',
        required: true,
        area: true,
        wide: true,
        placeholder:
          'e.g. GPU model and quantity, MW available, location, ready-for-service date'
      }
    ]
  }
]

function Field({ field, value, onChange }) {
  const id = `co-${field.name}`
  const common = {
    id,
    name: field.name,
    value,
    onChange,
    required: field.required,
    placeholder: field.placeholder
  }
  return (
    <div className={field.wide ? 'field-wide' : ''}>
      <label htmlFor={id}>
        {field.label}
        {field.required && <span aria-hidden="true"> *</span>}
      </label>
      {field.options ? (
        <select {...common}>
          {field.options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : field.area ? (
        <textarea {...common} rows={4} maxLength={COLLAB_LIMITS[field.name]} />
      ) : (
        <input
          {...common}
          type={field.type || 'text'}
          autoComplete={field.autoComplete}
          maxLength={COLLAB_LIMITS[field.name]}
        />
      )}
    </div>
  )
}

export default function CollaboratorForm() {
  const [form, setForm] = useState(COLLAB_DEFAULTS)
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const statusRef = useRef(null)
  const sendingRef = useRef(false)
  const sending = status === 'sending'
  const sent = status === 'sent'
  // Decided after mount so the prerendered HTML matches the first render.
  const [online, setOnline] = useState(false)
  useEffect(() => {
    setOnline(
      canSubmitRequest(
        import.meta.env.VITE_NETLIFY_FORMS_ENABLED === 'true',
        window.location.hostname
      )
    )
  }, [])
  useEffect(() => {
    if (status === 'sent' || status === 'error') statusRef.current?.focus()
  }, [status])

  const change = (e) => {
    e.target.setCustomValidity?.('')
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    if (status === 'error') {
      setStatus('idle')
      setMessage('')
    }
  }
  const submit = async (e) => {
    e.preventDefault()
    if (sendingRef.current || sent) return
    const invalid = [...e.currentTarget.elements].find(
      (f) => f.required && !String(f.value).trim()
    )
    if (invalid) {
      invalid.setCustomValidity('Please complete this field.')
      invalid.reportValidity()
      return
    }
    try {
      prepareCollaborator(form)
    } catch (error) {
      setStatus('error')
      setMessage(error.message)
      return
    }
    if (!online) {
      setStatus('error')
      setMessage(
        `This preview does not send forms. Email your details to ${REQUEST_EMAIL} using the button below.`
      )
      return
    }
    sendingRef.current = true
    setStatus('sending')
    setMessage('')
    try {
      await submitCollaborator(form, {
        enabled: online,
        hostname: window.location.hostname,
        consent
      })
      setStatus('sent')
      setMessage(
        'Thank you. Your details were received. Our team will review them and be in touch.'
      )
    } catch (error) {
      setStatus('error')
      setMessage(error.message)
    } finally {
      sendingRef.current = false
    }
  }

  return (
    <form
      className="capacity-form collab-form"
      name={COLLAB_FORM}
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={submit}
    >
      <input type="hidden" name="form-name" value={COLLAB_FORM} />
      <div hidden>
        <label>
          Leave this empty
          <input
            name="bot-field"
            tabIndex={-1}
            autoComplete="off"
            value={form['bot-field'] || ''}
            onChange={change}
          />
        </label>
      </div>
      <div className="form-heading">
        <span className="mono">Become a collaborator</span>
        <Handshake size={18} />
      </div>
      <fieldset className="collab-fields" disabled={sending || sent}>
        {GROUPS.map((group, gi) => (
          <fieldset key={group.legend} className="request-fields collab-group">
            <legend className="collab-legend mono">
              <span>{String(gi + 1).padStart(2, '0')}</span> {group.legend}
            </legend>
            {group.fields.map((field) => (
              <Field
                key={field.name}
                field={field}
                value={form[field.name]}
                onChange={change}
              />
            ))}
          </fieldset>
        ))}
        <label className="request-consent collab-consent">
          <input
            type="checkbox"
            name="consent"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            I agree that AnthroPrime Technology may use these details to
            assess and respond to this collaborator enquiry, as described in
            the{' '}
            <a href={DATA_NOTICE_URL} target="_blank" rel="noopener noreferrer">
              Website data notice
            </a>
            .
          </span>
        </label>
      </fieldset>
      <div className="form-submit">
        <button
          className="btn btn-primary"
          type="submit"
          disabled={sending || sent || !consent}
        >
          {sending ? (
            <>
              <LoaderCircle className="animate-spin" /> Sending…
            </>
          ) : (
            <>
              Join the network
              <ArrowRight />
            </>
          )}
        </button>
        <span>
          Please share business details only. Every collaborator is vetted
          before joining the network.
        </span>
        <p
          ref={statusRef}
          tabIndex={-1}
          role={status === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className="collab-status"
        >
          {message}
        </p>
        {!sent && (!online || status === 'error') && (
          <a className="btn btn-secondary mt-3" href={collaboratorEmailLink(form)}>
            Email {REQUEST_EMAIL}
            <Mail />
          </a>
        )}
      </div>
    </form>
  )
}
