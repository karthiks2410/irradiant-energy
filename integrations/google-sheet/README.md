# Lead register (Google Sheet)

Every enquiry from the website — the quote popup, the site-visit popup and the calculator form — is
added as one row to a Google Sheet in the company's Google Workspace, right after the sales alert
email goes out. The team works from the Sheet: the **Status** column starts as "New" and the
**Notes** column is theirs. The website never changes either.

It is optional. Until the two settings below exist in Vercel, the website simply skips this step;
enquiries still arrive by email exactly as before.

**Columns:** Received (IST) · Reference · Form · Language · Name · Phone · Email · PIN code ·
Property · Monthly bill · Sanctioned load (kW) · Estimated system (kWp) · WhatsApp OK · Source ·
Medium · Campaign · Landing page · Enquiry page · Status · Notes

- **Form** is Popup, Site visit or Calculator.
- **Email** is empty for a popup enquiry until the visitor asks for the breakdown by email; the
  same row is then filled in.
- **Source / Medium / Campaign** come from the link's campaign tags (utm_source, utm_medium,
  utm_campaign). Without tags they show the referring website ("referral"), or "direct or unknown".
  **Landing page** and the referring site are known only when the visitor allowed analytics.
- **Enquiry page** is the page the form was sent from.

The Sheet holds personal data (names, numbers, email addresses). Share it only with the people who
follow up enquiries, and delete rows in line with the retention periods in the privacy notice.

## Set it up (about 15 minutes, once)

You need: the company Google Workspace account that should own the Sheet, and access to the
project in Vercel.

### 1. Create the Sheet

1. Sign in to Google with the **company Workspace account** (not a personal Gmail).
2. Go to <https://sheets.new>. A blank spreadsheet opens.
3. Click the title "Untitled spreadsheet" and name it, for example `Irradiant Energy — Leads`.
4. Optional: **File → Settings → Time zone** → `(GMT+05:30) India Standard Time` → **Save settings**.
   (The website already sends Indian time; this only keeps Sheets' own timestamps consistent.)

Leave the sheet empty. The header row and a tab called **Leads** are created by the first enquiry.

### 2. Add the script

1. In the Sheet, open **Extensions → Apps Script**. A new tab opens with a file called `Code.gs`.
2. Delete everything in that file.
3. Open `integrations/google-sheet/Code.gs` from this repository, copy **all** of it, and paste it
   into the Apps Script editor.
4. Click the disk icon (**Save project**). If asked, name the project `Lead register`.

### 3. Choose the secret token

The token is a password the website sends with every enquiry, so only the website can write to
the Sheet. **You** create it; nobody else needs to see it.

1. Generate a long random value on your own computer, for example in Terminal:
   `openssl rand -hex 32` — this prints 64 random characters. Any random string of 40 or more
   letters and digits works. Do not reuse a password.
2. Keep it somewhere safe for the next two minutes (a password manager is ideal). Do not email it
   or paste it into chat.
3. In Apps Script, click the gear icon (**Project Settings**) in the left bar.
4. Scroll to **Script Properties** → **Add script property**.
   - Property: `TOKEN`
   - Value: the random value from step 1
5. Click **Save script properties**.

### 4. Publish the script as a web app

1. Top right: **Deploy → New deployment**.
2. Next to "Select type", click the gear → **Web app**.
3. Fill in:
   - Description: `Lead register`
   - **Execute as: Me** (your Workspace account — the Sheet is written as you)
   - **Who has access: Anyone** (the website's server has no Google login; the token is what
     keeps others out)
4. Click **Deploy**.
5. Google asks you to **Authorize access**. Choose your Workspace account. If a screen says
   "Google hasn't verified this app", click **Advanced → Go to Lead register (unsafe)** — it is your
   own script — then **Allow**. It asks only for access to this spreadsheet.
6. Copy the **Web app URL**. It looks like
   `https://script.google.com/macros/s/AKfy…/exec`.

### 5. Give the website the two settings

1. Open the project in Vercel → **Settings → Environment Variables**.
2. Add:
   - Key `LEAD_SHEET_URL`, value: the Web app URL from step 4.6, environment: **Production** only.
   - Key `LEAD_SHEET_TOKEN`, value: the token from step 3, environment: **Production** only.
     Tick **Sensitive** if Vercel offers it.
3. **Redeploy**: Deployments → the latest Production deployment → ⋯ → **Redeploy**. Settings only
   take effect in a new deployment.

Do not add them to Preview unless you want test enquiries from preview links in the same Sheet.

### 6. Test with one enquiry

1. Open <https://www.irradiantenergy.in/en>, click **Get a free quote**, and send an enquiry with
   your own name and number.
2. Within a few seconds a **Leads** tab appears in the Sheet with the header row and your enquiry,
   Status "New". The Reference matches the one shown on screen and in the alert email.
3. In the popup's result, enter your email under "email me the breakdown". The **Email** cell of
   the same row fills in.
4. Delete the test row afterwards (right-click the row number → **Delete row**).

If no row appears: in Vercel, open the deployment's **Logs** and search for `lead_sheet`.
`lead_sheet_ok` means it worked; `lead_sheet_failed` with `unauthorized` means the token in Vercel
and in Script Properties differ; `lead_sheet_skipped` means one of the two settings is missing or
the deployment was not redeployed. The logs never contain names or numbers, only the reference.

## Changing things later

- **Rotating the token:** set a new `TOKEN` in Script Properties and the same value in
  `LEAD_SHEET_TOKEN` in Vercel, then redeploy the website. Enquiries sent in between still arrive
  by email; only their rows are missing.
- **Changing the script:** paste the new code, save, then **Deploy → Manage deployments** → the
  pencil on the existing deployment → Version: **New version** → **Deploy**. The URL stays the same.
  (A *new* deployment would get a new URL, which Vercel would then need.)
- **Columns:** you may reorder columns, add your own, colour rows or add filters; the script finds
  its columns by their header text. Do not rename the website's headers.
- **Status values:** a dropdown helps (select the Status column → **Data → Data validation** →
  Dropdown: New, Contacted, Site visit booked, Quoted, Won, Lost). The website only ever writes
  "New".

## How it is protected

- The token is checked in constant time before anything is read or written. Without it the script
  answers `unauthorized` and touches nothing.
- The website sends the token in the request body over HTTPS, from its server only. It never
  appears in the browser, in the page or in logs.
- A value that starts with `=`, `+`, `-` or `@` (a phone number such as +91…, or a hostile name)
  is prefixed with an apostrophe, so the Sheet shows it as text and never runs it as a formula.
- One enquiry is written at a time (a script lock), and a repeated reference updates its row
  instead of adding another.
- The website gives up after about four seconds (and tries once more a moment later), after the
  visitor already has their answer, so a Sheet problem never affects the visitor or the alert email.
