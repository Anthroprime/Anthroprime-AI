import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Handshake,
  ArrowUpRight,
  ArrowRight,
  Check,
  Copy,
  Download,
  ShieldCheck,
  FileText,
  Mail,
  LoaderCircle
} from 'lucide-react'
import { PageHero, Reveal } from '../components/ui'
import CapacityTable from '../components/CapacityTable'
import {
  GPU_OPTIONS,
  DEPLOY_OPTIONS,
  initialRequest,
  applyCapacitySelection,
  buildBrief
} from '../data/request'
import {
  REQUEST_EMAIL,
  REQUEST_LIMITS,
  prepareCapacityRequest,
  canSubmitRequest,
  capacityEmailLink,
  submitCapacityRequest
} from '../data/request-delivery'

const FIELDS = [
  { label: 'GPU type', name: 'gpuType', options: GPU_OPTIONS },
  {
    label: 'Number of GPUs / nodes',
    name: 'gpuQty',
    placeholder: 'e.g. 8 GPUs or 4 nodes',
    required: true
  },
  {
    label: 'Required region',
    name: 'location',
    placeholder: 'e.g. India, Europe, flexible',
    required: true
  },
  { label: 'Preferred start date', name: 'startDate', type: 'date' },
  {
    label: 'Duration',
    name: 'duration',
    placeholder: 'e.g. 6 months, 3 years'
  },
  { label: 'Deployment model', name: 'deployType', options: DEPLOY_OPTIONS },
  {
    label: 'Tell us about the workload',
    name: 'workload',
    placeholder: 'Model training, inference, fine-tuning…',
    wide: true,
    area: true
  },
  {
    label: 'Company name',
    name: 'company',
    placeholder: 'Your organisation',
    required: true,
    autoComplete: 'organization'
  },
  {
    label: 'Business email',
    name: 'email',
    placeholder: 'you@company.com',
    type: 'email',
    required: true,
    autoComplete: 'email'
  },
  {
    label: 'Phone / WhatsApp',
    name: 'phone',
    placeholder: '+91 …',
    type: 'tel',
    autoComplete: 'tel'
  }
]

export default function FindCapacity() {
  const { state } = useLocation()
  const [form, setForm] = useState(() => initialRequest(state || {}))
  const [review, setReview] = useState(null)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')
  const [consent, setConsent] = useState(false)
  const [delivery, setDelivery] = useState('idle')
  const [deliveryError, setDeliveryError] = useState('')
  const [reviewError, setReviewError] = useState('')
  const formErrorRef = useRef(null)
  const sendingRef = useRef(false)
  const statusRef = useRef(null)
  const sending = delivery === 'sending'
  const sent = delivery === 'sent'
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
  const reviewRef = useRef(null)
  const formRef = useRef(null)
  const selectOffering = (row) => {
    if (sendingRef.current || sent) return
    setForm((current) => applyCapacitySelection(current, row))
    setReview(null)
    setReviewError('')
    setDelivery('idle')
    setDeliveryError('')
    setConsent(false)
    const field = formRef.current?.elements.namedItem('gpuType')
    field?.focus({ preventScroll: true })
    field?.scrollIntoView({ block: 'center' })
  }
  useEffect(() => {
    setForm(initialRequest(state || {}))
    setReview(null)
    setDelivery('idle')
    setDeliveryError('')
    setConsent(false)
    setReviewError('')
  }, [state])
  useEffect(() => {
    if (review) reviewRef.current?.focus()
  }, [review])
  useEffect(() => {
    if (delivery === 'sent' || delivery === 'error') statusRef.current?.focus()
  }, [delivery])
  useEffect(() => {
    if (reviewError) formErrorRef.current?.focus()
  }, [reviewError])
  const handleSubmit = (e) => {
    e.preventDefault()
    if (sendingRef.current || sent) return
    const invalid = [...e.currentTarget.elements].find(
      (field) => field.required && !String(field.value).trim()
    )
    if (invalid) {
      invalid.setCustomValidity('Please complete this field.')
      invalid.reportValidity()
      return
    }
    try {
      const trimmed = prepareCapacityRequest(form)
      setForm(trimmed)
      setReview(buildBrief(trimmed))
      setReviewError('')
    } catch (error) {
      setReviewError(error.message)
      return
    }
    setCopied(false)
    setCopyError('')
    setDelivery('idle')
    setDeliveryError('')
    setConsent(false)
  }
  const handleChange = (e) => {
    setReviewError('')
    e.target.setCustomValidity?.('')
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setReview(null)
    setDelivery('idle')
    setDeliveryError('')
    setConsent(false)
  }
  const send = async () => {
    if (sendingRef.current || sent || !review || !consent || !online) return
    sendingRef.current = true
    setDelivery('sending')
    setDeliveryError('')
    try {
      await submitCapacityRequest(form, {
        enabled: online,
        hostname: window.location.hostname,
        consent
      })
      setDelivery('sent')
    } catch (error) {
      setDelivery('error')
      setDeliveryError(error.message)
    } finally {
      sendingRef.current = false
    }
  }
  const copy = async () => {
    setCopyError('')
    try {
      await navigator.clipboard.writeText(review)
      setCopied(true)
    } catch {
      setCopied(false)
      setCopyError(
        'Copy is unavailable in this browser. Download the brief or select the text below.'
      )
    }
  }
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([review], { type: 'text/plain;charset=utf-8' })
    )
    const a = document.createElement('a')
    a.href = url
    a.download = 'anthroprime-capacity-brief.txt'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <>
      <PageHero
        crumb="Find GPU Capacity"
        title="Your next chapter."
        highlight="Starts with a brief."
        sub="A few details about your ambition. We’ll help find the infrastructure to match. From 8 GPUs to your next dedicated cluster."
      />
      <section className="wrap pb-16" aria-label="Explore GPU capacity">
        <CapacityTable onSelect={selectOffering} disabled={sending || sent} />
      </section>
      <section className="pb-24">
        <div className="wrap request-layout">
          <Reveal className="request-sidebar">
            <div className="eyebrow mono">A more considered conversation</div>
            <h2 className="editorial-title">
              Your workload.
              <br />
              <em>Our starting point.</em>
            </h2>
            <p className="text-muted text-[13px] leading-[1.9] mt-6">
              Start with what you know. We’ll work through the architecture,
              deployment options, and commercial model together.
            </p>
            <div className="request-steps">
              {[
                [
                  '01',
                  'Define the requirement',
                  'GPU, scale, geography, and timing.'
                ],
                [
                  '02',
                  'Confirm your configuration',
                  'GPU configuration, available capacity, and deployment terms.'
                ],
                [
                  '03',
                  'Move forward together',
                  'Work directly with Anthroprime from agreement to deployment.'
                ]
              ].map(([n, t, d]) => (
                <div key={n}>
                  <span className="mono">{n}</span>
                  <div>
                    <h3>{t}</h3>
                    <p>{d}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="request-privacy">
              <ShieldCheck size={19} />
              <p>
                Your workload and deployment requirements can be discussed
                confidentially under NDA.
              </p>
            </div>
          </Reveal>
          <div>
            <form
              ref={formRef}
              id="capacity-brief"
              className="capacity-form"
              name="gpu-capacity"
              method="POST"
              data-netlify="true"
              netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
            >
              <input type="hidden" name="form-name" value="gpu-capacity" />
              <div hidden>
                <label>
                  Leave this empty
                  <input
                    name="bot-field"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form['bot-field'] || ''}
                    onChange={handleChange}
                  />
                </label>
              </div>
              <div className="form-heading">
                <span className="mono">01 / Your capacity brief</span>
                <FileText size={18} />
              </div>
              <div
                className="request-type"
                role="group"
                aria-label="What would you like to do?"
              >
                <span className="request-type-option is-active" aria-current="true">
                  <Check size={15} aria-hidden="true" />
                  Secure capacity for AI workloads
                </span>
                <Link to="/infrastructure#join" className="request-type-option">
                  <Handshake size={15} aria-hidden="true" />
                  Offer capacity or space to our network
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              </div>
              {!!state?.gpu && (
                <p className="prefill-note">
                  <Check size={14} />
                  Prefilled from your selection. Make it yours.
                </p>
              )}
              <fieldset className="request-fields" disabled={sending || sent}>
                <legend className="sr-only">
                  GPU capacity and contact details
                </legend>
                {FIELDS.map((field) => (
                  <div
                    key={field.name}
                    className={field.wide ? 'field-wide' : ''}
                  >
                    <label htmlFor={`fc-${field.name}`}>
                      {field.label}
                      {field.required && <span aria-hidden="true"> *</span>}
                    </label>
                    {field.options ? (
                      <select
                        id={`fc-${field.name}`}
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                      >
                        {field.options.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    ) : field.area ? (
                      <textarea
                        id={`fc-${field.name}`}
                        name={field.name}
                        rows={3}
                        maxLength={REQUEST_LIMITS[field.name]}
                        value={form[field.name]}
                        placeholder={field.placeholder}
                        onChange={handleChange}
                      />
                    ) : (
                      <input
                        id={`fc-${field.name}`}
                        name={field.name}
                        type={field.type || 'text'}
                        value={form[field.name]}
                        placeholder={field.placeholder}
                        required={field.required}
                        autoComplete={field.autoComplete}
                        maxLength={REQUEST_LIMITS[field.name]}
                        onChange={handleChange}
                      />
                    )}
                  </div>
                ))}
              </fieldset>
              {reviewError && (
                <p
                  ref={formErrorRef}
                  tabIndex={-1}
                  role="alert"
                  className="text-[13px] text-muted mt-5"
                >
                  {reviewError}
                </p>
              )}
              <div className="form-submit">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={sending || sent}
                >
                  Review my request
                  <ArrowRight />
                </button>
                <span>
                  Review your details before sending to Anthroprime. Please keep
                  this request non-sensitive.
                </span>
              </div>
            </form>
            {review && (
              <section
                className="request-review mt-6"
                ref={reviewRef}
                tabIndex={-1}
                aria-label="Your capacity brief"
              >
                <span className="mono">
                  02 / Ready for your next conversation
                </span>
                <h2 className="text-[23px] mt-4">
                  {sent ? 'Request received.' : 'Your brief is ready.'}
                </h2>
                <p className="text-[12px] text-[#aab6cd] mt-2">
                  {sent
                    ? 'Thank you. Our team will follow up using the contact details you provided.'
                    : `Review your requirements below. Send your request to our team, or email ${REQUEST_EMAIL} directly.`}
                </p>
                <pre>{review}</pre>
                {!sent && (
                  <div className="request-delivery">
                    {online ? (
                      <label className="request-consent">
                        <input
                          type="checkbox"
                          name="consent"
                          checked={consent}
                          disabled={sending}
                          onChange={(e) => setConsent(e.target.checked)}
                        />
                        <span>
                          I agree that Anthroprime may use these details to
                          respond to this GPU capacity request.
                        </span>
                      </label>
                    ) : (
                      <p className="text-[12px] leading-relaxed text-[#d4dbee]">
                        This local preview does not send requests. Email your
                        brief to {REQUEST_EMAIL}, or copy and save it below.
                      </p>
                    )}
                    <button
                      className="btn btn-gold mt-4"
                      type="button"
                      disabled={!online || !consent || sending}
                      onClick={send}
                    >
                      {sending ? (
                        <>
                          <LoaderCircle className="animate-spin" /> Sending
                          request…
                        </>
                      ) : (
                        <>
                          <Mail />{' '}
                          {delivery === 'error'
                            ? 'Retry request'
                            : 'Send request'}
                        </>
                      )}
                    </button>
                  </div>
                )}
                <p
                  ref={statusRef}
                  tabIndex={-1}
                  role={delivery === 'error' ? 'alert' : 'status'}
                  className="request-delivery-status"
                  aria-live="polite"
                >
                  {deliveryError ||
                    (sent
                      ? 'Your request was received. Keep a copy of your brief for reference.'
                      : sending
                        ? 'Submitting your request. Please wait…'
                        : '')}
                </p>
                <div className="flex flex-wrap gap-3">
                  <a className="btn btn-outline" href={capacityEmailLink(form)}>
                    Email {REQUEST_EMAIL}
                    <Mail />
                  </a>
                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={copy}
                  >
                    {copied ? 'Copied' : 'Copy brief'}
                    <Copy />
                  </button>
                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={download}
                  >
                    Download
                    <Download />
                  </button>
                  <a
                    className="btn btn-outline"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://wa.me/919711554410?text=${encodeURIComponent(review)}`}
                  >
                    Open WhatsApp
                    <ArrowUpRight />
                  </a>
                  {sent && (
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() => {
                        setForm(initialRequest())
                        setReview(null)
                        setDelivery('idle')
                        setConsent(false)
                      }}
                    >
                      Start another request
                      <ArrowRight />
                    </button>
                  )}
                </div>
                <p className="text-[11px] mt-4 text-[#aab6cd]" role="status">
                  {copyError ||
                    (copied
                      ? 'Brief copied to your clipboard.'
                      : sent
                        ? ''
                        : 'No request has been sent until you choose a sending option.')}
                </p>
              </section>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
