# GPU request notifications · hello@anthroprime.com

The GPU form now follows the Netlify Forms approach used by [Anthroprime.com](https://anthroprime.com/contact). Review the brief, consent to contact, then send. An accepted submission is stored by Netlify; its email notification is delivered by Netlify to the configured recipient.

To also copy verified requests into a restricted Google Sheet, see [Save GPU capacity requests to Google Sheets](capacity-requests-sheet.md).

## Already implemented

- Registered static form: `gpu-capacity`, declared in `index.html` for build-time form detection.
- Same-origin, URL-encoded POST after review and explicit send. Structured GPU, region, deployment, workload, company, email, phone, consent, and a complete readable brief are included.
- Notification subject includes GPU family and company. The field named `email` supplies Netlify's Reply-To address.
- Loading, accepted, error/retry, duplicate-click prevention, honeypot, consent, and a 15-second timeout. Errors retain the brief. Acceptance confirms receipt by the form service, not mailbox delivery.
- All public email links and prefilled request emails use `hello@anthroprime.com`.
- Localhost, local builds, and Netlify deploy previews do not send. Production Netlify builds enable the submit action through the `NETLIFY=true` and `CONTEXT=production` build environment. Email draft, copy, and download remain usable locally.

## Required in the Netlify project before launch

The recipient cannot be configured through a public HTML field or `netlify.toml`.

1. Enable **Forms → Form detection** for the intended GPU site.
2. At the eventual authorized deployment, confirm Netlify detects the form named `gpu-capacity`.
3. Open **Forms → Submission notifications**, add an email notification for `gpu-capacity`, and set **hello@anthroprime.com** as the recipient. Keep the hidden `subject` field as the notification subject source.
4. Submit one approved end-to-end request on the live site and verify the submission appears in Netlify, the notification reaches that inbox, and Reply-To points to the requester. A spam-filtered submission may not generate a notification.

No site was deployed, no Netlify account setting was changed, and no real message was sent during implementation. Transport success and failure were tested using an injected mock, without contacting a live form endpoint.

Validation: the production build and 196 checks pass. A fresh browser visual check was unavailable because the browser URL policy blocked access to its existing error tab; local HTTP responses returned 200. Recipient setup and real mailbox delivery remain unverified until the launch steps above are performed.

Sources: [Netlify JavaScript forms](https://docs.netlify.com/manage/forms/setup/), [email notifications and Reply-To](https://docs.netlify.com/manage/forms/notifications/).

## Production activation · 16 October 2026

The owner authorized deployment through the existing GitHub main branch and connected Netlify project `anthroprimeai` (https://anthroprime.ai). Form detection is now enabled, and the Netlify dashboard confirms a new-submission notification to `hello@anthroprime.com`. The initial notification covers any form because no form had been detected before activation; the project declares the `gpu-capacity` form. The earlier local-only verification notes above describe the previous implementation pass. A verified Netlify submission confirms form acceptance; inbox receipt requires mailbox access or recipient confirmation.
