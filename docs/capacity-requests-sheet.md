# Save GPU capacity requests to Google Sheets

When Netlify verifies a `gpu-capacity` submission, `submission-created` can copy the request into the **GPU Capacity Requests** tab. The form and its existing Netlify notifications work independently of the copy. The integration is off until both production variables below are set.

1. In the destination Google workbook, set **Share → General access → Restricted**. If the workbook also powers the public capacity table, verify under **File → Share → Publish to web → Published content & settings** that only **Website capacity** is published. Never publish **GPU Capacity Requests**. If the workbook needs to remain link-shared, use a separate restricted workbook for requests.
2. Add a tab named **GPU Capacity Requests** with these headers in row 1, in order:

   ```text
   Submitted at (UTC) | Submission ID | GPU type | Number of GPUs / nodes | Required region | Preferred start date | Duration | Deployment model | Workload | Company name | Business email | Phone / WhatsApp | Contact consent
   ```

3. In Google Cloud, enable the **Google Sheets API** and **Google Drive API**. Create a dedicated service account with no project roles or domain-wide delegation. Give its email **Editor** access to this workbook only. Create a JSON key for that service account.
4. In Netlify, set these variables for the **Functions** scope and the **Production** deploy context only:

   - `CAPACITY_REQUESTS_SPREADSHEET_ID`: the value between `/d/` and `/edit` in the workbook's URL.
   - `CAPACITY_REQUESTS_GOOGLE_CREDENTIALS`: the full service account key JSON, marked as a secret. Keep the key out of Git, browser code, and messages.

5. Deploy once. Send an approved test request and check for its submission ID in **Netlify → Forms → gpu-capacity** and in the new tab. The test uses the normal form, so it also follows the existing email notification settings. Check the public capacity table still loads if it uses the same workbook's published inventory tab.

The function verifies restricted Drive sharing before writing. The publishing selection must be checked separately. Rows are stored as literal text, including phone numbers and text beginning with `=`. Only the fields shown above are copied; Netlify metadata such as IP address and user agent is omitted.

If the Sheets write fails, the original submission remains in Netlify. Check the `submission-created` function logs for a sharing, credentials, or append error and use the submission ID to reconcile rows against Netlify. This integration does not backfill historical submissions. To turn off the copy, remove both variables and redeploy.

References: [Netlify form events](https://docs.netlify.com/build/functions/trigger-on-events/#form-events), [Google Sheets append](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/append), [Google Sheets publishing settings](https://support.google.com/docs/answer/183965).
