// DRAFT — FOR COUNSEL REVIEW (docs/discovery/17, 18)
//
// Written by the build team so counsel has something concrete to mark up, and so the site is not
// live without a notice. It describes what this codebase actually does today: the lead form in
// src/lib/leads/schema.ts, the server action in src/lib/leads/submit-lead.ts and the processors in
// src/lib/leads/emails.ts. Nothing here cites a statute; the mapping to the DPDP Act, the DPDP
// Rules and the SPDI Rules is in the two discovery notes above, for counsel to apply.
//
// Facts still missing: the retention periods. They are marked `pending` below and must be settled
// before launch. The legal entity name and the grievance officer are facts in src/content/site.ts;
// the blocks that use them fall back to a placeholder while either is null.
// The page is noindex until counsel approves it (./index.ts).
//
// Every sentence is one row in docs/kannada/translations/units.json, matched by its exact text:
// reword one here and the Kannada build stops until the row is updated.

import type { LegalNotice } from "@/content/types";

export const privacyNotice = {
  title: "Privacy notice",
  description:
    "What personal information Irradiant Energy collects through this website, why we collect it, who else sees it and how to ask us to change or delete it.",
  summary:
    "What we collect when you ask us for an estimate or get in touch, what we do with it, and how to change your mind.",

  sections: [
    {
      heading: "Who we are",
      body: [
        {
          withEntity:
            "This website is run by {siteName}, a brand of {entityName}. We decide what personal information this site collects and what happens to it.",
          withoutEntity:
            "This website is run by {siteName}. We decide what personal information this site collects and what happens to it.",
          pending: "Legal entity name to be confirmed",
        },
        { contactLines: ["Email: {email}", "Phone: {phone}"] },
      ],
    },
    {
      heading: "What this notice covers",
      body: [
        "It covers this website and the enquiries you send through it, by email, or on WhatsApp after you use a link on this site. It does not cover other organisations’ websites we link to, such as government scheme pages or map services.",
      ],
    },
    {
      heading: "What we collect",
      body: [
        "<strong>When you ask for an estimate or send an enquiry</strong>, we collect what you type into the form:",
        {
          items: [
            "your name;",
            "your mobile number;",
            "your email address;",
            "whether you are asking about a home, a housing society or a business;",
            "your PIN code and a rough monthly electricity bill, if you give them, so we can size a system;",
            "anything you write in the message box;",
            "whether you ticked the box asking us to use WhatsApp;",
            "a record that you gave your consent, with the date and time.",
          ],
        },
        "<strong>When you browse</strong>, our hosting provider records technical details of each request — the internet address your device is using, the browser and device type, the page requested and the time. We use these to keep the site running and to look into problems and abuse.",
        "<strong>What we do not ask for:</strong> an account or login, identity documents, bank or card details, or your date of birth. We do not use advertising or analytics cookies — see our <cookieLink>cookie notice</cookieLink>.",
      ],
    },
    {
      heading: "Why we use it",
      body: [
        {
          items: [
            "to prepare an estimate for your roof and send it to you;",
            "to contact you about your enquiry by phone, email, or WhatsApp if you asked us to;",
            "to arrange and carry out a site visit, if you want one;",
            "to keep a record of the consent you gave and of any request you make about your information;",
            "to keep this website secure and working;",
            "to meet our legal, tax and accounting obligations.",
          ],
        },
        "We do not use your details for automated decision-making, and we do not build profiles about you. If we ever want to send you marketing that is unrelated to your enquiry, we will ask you separately first.",
      ],
    },
    {
      heading: "Your consent, and taking it back",
      body: [
        "We ask you to tick a box before you send an enquiry. That box is never ticked for you. Ticking it is how you tell us we may use your details to answer you.",
        "You can take that consent back at any time — email {email}, call {phone}, or reply to a WhatsApp message from us asking us to stop. We will stop contacting you. Taking your consent back does not undo what we did while it was in place.",
      ],
    },
    {
      heading: "Who else sees your information",
      body: [
        "We keep your details to ourselves and to the companies that run this site and our email for us:",
        {
          items: [
            "<strong>Vercel</strong> — hosts this website, runs the form, and keeps the technical request logs.",
            "<strong>Resend</strong> — delivers the enquiry to our team and the acknowledgement to you.",
            "<strong>Our own email and phone accounts</strong> — where our team reads and answers your enquiry.",
            "<strong>WhatsApp</strong> — only if you choose to message us there. Your chat is also handled by WhatsApp under its own terms.",
          ],
        },
        "We may also share details with an installer or engineer working on your project, and with an adviser or an authority where the law requires it.",
        { emphasis: "We do not sell your information, and we do not share it for anyone else’s marketing." },
        "<strong>Where it is stored.</strong> Our hosting and email providers run their systems outside India, including in the United States, so your details may be stored and handled outside India. We ask these providers to keep your details secure and to use them only on our instructions.",
      ],
    },
    {
      heading: "How long we keep it",
      body: [
        { text: "Provisional, pending legal review:", pending: "Retention periods to be confirmed with counsel" },
        {
          items: [
            "<strong>Enquiries that do not become projects</strong> — up to 12 months after we last spoke, then deleted or reduced to a count that identifies nobody.",
            "<strong>Customer records</strong> — kept for as long as the contract, the warranties and tax and accounting rules require.",
            "<strong>Consent records</strong> — kept while the consent is in place and for a period afterwards, so we can show what you agreed to and when.",
            "<strong>Technical logs</strong> — kept for a limited period for security and troubleshooting.",
          ],
        },
      ],
    },
    {
      heading: "How we protect it",
      body: [
        "The site is served over an encrypted connection. Access to enquiry emails is limited to the people who need it. No system is perfectly safe; if something goes wrong, we will act on it and tell the people and authorities we have to.",
      ],
    },
    {
      heading: "Your choices",
      body: [
        "You can ask us to:",
        {
          items: [
            "tell you what personal information we hold about you and who we have shared it with;",
            "correct or complete anything that is wrong or out of date;",
            "delete what we hold, unless we have to keep it for a legal reason;",
            "stop contacting you.",
          ],
        },
        "Write to {email} from the email address you used, or call from the number you gave us, so we can find your enquiry. We may ask one or two questions to be sure it is you. If we cannot act on a request, we will say why.",
        // PROPOSED CONTENT — REQUIRES CLIENT APPROVAL: the response times are a commitment the owner has to accept.
        {
          text: "We aim to acknowledge a request within 7 days and to answer it within 30 days.",
          pending: "Response times to be approved",
        },
        "If you are not satisfied with how we handled it, you can complain to the data-protection authority in India.",
      ],
    },
    {
      heading: "Children",
      body: [
        "We do not knowingly collect information from anyone under 18. If you believe a child has sent us their details, tell us and we will delete them.",
      ],
    },
    {
      heading: "Changes to this notice",
      body: [
        "We will update this notice when what we do changes. The version and effective date appear at the top of this page.",
      ],
    },
    {
      heading: "Grievance and privacy contact",
      body: [
        {
          grievanceFallback:
            "Until we name one, please use the contact details above and say that it is a privacy request.",
          pending: "Grievance contact to be named",
        },
      ],
    },
  ],
} as const satisfies LegalNotice;
