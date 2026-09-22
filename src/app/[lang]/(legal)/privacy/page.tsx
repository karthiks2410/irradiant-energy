// DRAFT — FOR COUNSEL REVIEW (docs/discovery/17, 18)
//
// Written by the build team so counsel has something concrete to mark up, and so the site is not
// live without a notice. It describes what this codebase actually does today: the lead form in
// src/lib/leads/schema.ts, the server action in src/app/get-quote/actions.ts and the processors in
// src/lib/leads/emails.ts. Nothing here cites a statute; the mapping to the DPDP Act, the DPDP
// Rules and the SPDI Rules is in the two discovery notes above, for counsel to apply.
//
// Facts still missing: the legal entity name, the named grievance contact and the retention
// periods. They are placeholders (src/content/site.ts) and must be filled before launch.
// The page is noindex until counsel approves it.

import Link from "next/link";
import { LegalPageShell } from "@/components/pages/LegalPageShell";
import { PlaceholderTag } from "@/components/pages/PlaceholderTag";
import { isLegalPageIndexable } from "@/content/legal";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy notice",
  description:
    "What personal information Irradiant Energy collects through this website, why we collect it, who else sees it and how to ask us to change or delete it.",
  path: "/privacy",
  // Draft until counsel approves it (src/content/legal.ts); the sitemap reads the same flag.
  noindex: !isLegalPageIndexable("privacy"),
});

const { address, email, phonePrimary } = site.contact;

export default function PrivacyPage() {
  return (
    <LegalPageShell
      slug="privacy"
      summary="What we collect when you ask us for an estimate or get in touch, what we do with it, and how to change your mind."
    >
      <h2>Who we are</h2>
      <p>
        This website is run by {site.name}
        {site.legal.entityName ? `, a brand of ${site.legal.entityName}` : ""}.{" "}
        {!site.legal.entityName && <PlaceholderTag>Legal entity name to be confirmed</PlaceholderTag>} We decide what
        personal information this site collects and what happens to it.
      </p>
      <p>
        {address.value.lines.join(", ")}
        <br />
        Email: <a href={`mailto:${email.value}`}>{email.value}</a>
        <br />
        Phone: <a href={`tel:${phonePrimary.value.tel}`}>{phonePrimary.value.display}</a>
      </p>

      <h2>What this notice covers</h2>
      <p>
        It covers this website and the enquiries you send through it, by email, or on WhatsApp after you use a link on
        this site. It does not cover other organisations&rsquo; websites we link to, such as government scheme pages or
        map services.
      </p>

      <h2>What we collect</h2>
      <p>
        <strong>When you ask for an estimate or send an enquiry</strong>, we collect what you type into the form:
      </p>
      <ul>
        <li>your name;</li>
        <li>your mobile number;</li>
        <li>your email address;</li>
        <li>whether you are asking about a home, a housing society or a business;</li>
        <li>your PIN code and a rough monthly electricity bill, if you give them, so we can size a system;</li>
        <li>anything you write in the message box;</li>
        <li>whether you ticked the box asking us to use WhatsApp;</li>
        <li>a record that you gave your consent, with the date and time.</li>
      </ul>
      <p>
        <strong>When you browse</strong>, our hosting provider records technical details of each request — the
        internet address your device is using, the browser and device type, the page requested and the time. We use
        these to keep the site running and to look into problems and abuse.
      </p>
      <p>
        <strong>What we do not ask for:</strong> an account or login, identity documents, bank or card details, or your
        date of birth. We do not use advertising or analytics cookies — see our{" "}
        <Link href="/cookies">cookie notice</Link>.
      </p>

      <h2>Why we use it</h2>
      <ul>
        <li>to prepare an estimate for your roof and send it to you;</li>
        <li>to contact you about your enquiry by phone, email, or WhatsApp if you asked us to;</li>
        <li>to arrange and carry out a site visit, if you want one;</li>
        <li>to keep a record of the consent you gave and of any request you make about your information;</li>
        <li>to keep this website secure and working;</li>
        <li>to meet our legal, tax and accounting obligations.</li>
      </ul>
      <p>
        We do not use your details for automated decision-making, and we do not build profiles about you. If we ever
        want to send you marketing that is unrelated to your enquiry, we will ask you separately first.
      </p>

      <h2>Your consent, and taking it back</h2>
      <p>
        We ask you to tick a box before you send an enquiry. That box is never ticked for you. Ticking it is how you
        tell us we may use your details to answer you.
      </p>
      <p>
        You can take that consent back at any time — email{" "}
        <a href={`mailto:${email.value}`}>{email.value}</a>, call{" "}
        <a href={`tel:${phonePrimary.value.tel}`}>{phonePrimary.value.display}</a>, or reply
        to a WhatsApp message from us asking us to stop. We will stop contacting you. Taking your consent back does
        not undo what we did while it was in place.
      </p>

      <h2>Who else sees your information</h2>
      <p>We keep your details to ourselves and to the companies that run this site and our email for us:</p>
      <ul>
        <li>
          <strong>Vercel</strong> — hosts this website, runs the form, and keeps the technical request logs.
        </li>
        <li>
          <strong>Resend</strong> — delivers the enquiry to our team and the acknowledgement to you.
        </li>
        <li>
          <strong>Our own email and phone accounts</strong> — where our team reads and answers your enquiry.
        </li>
        <li>
          <strong>WhatsApp</strong> — only if you choose to message us there. Your chat is also handled by WhatsApp
          under its own terms.
        </li>
      </ul>
      <p>
        We may also share details with an installer or engineer working on your project, and with an adviser or an
        authority where the law requires it.
      </p>
      <p>
        <strong>We do not sell your information, and we do not share it for anyone else&rsquo;s marketing.</strong>
      </p>
      <p>
        <strong>Where it is stored.</strong> Our hosting and email providers run their systems outside India, including
        in the United States, so your details may be stored and handled outside India. We ask these providers to keep
        your details secure and to use them only on our instructions.
      </p>

      <h2>How long we keep it</h2>
      <p>
        <PlaceholderTag>Retention periods to be confirmed with counsel</PlaceholderTag> Provisional, pending legal
        review:
      </p>
      <ul>
        <li>
          <strong>Enquiries that do not become projects</strong> — up to 12 months after we last spoke, then deleted or
          reduced to a count that identifies nobody.
        </li>
        <li>
          <strong>Customer records</strong> — kept for as long as the contract, the warranties and tax and accounting
          rules require.
        </li>
        <li>
          <strong>Consent records</strong> — kept while the consent is in place and for a period afterwards, so we can
          show what you agreed to and when.
        </li>
        <li>
          <strong>Technical logs</strong> — kept for a limited period for security and troubleshooting.
        </li>
      </ul>

      <h2>How we protect it</h2>
      <p>
        The site is served over an encrypted connection. Access to enquiry emails is limited to the people who need
        it. No system is perfectly safe; if something goes wrong, we will act on it and tell the people and
        authorities we have to.
      </p>

      <h2>Your choices</h2>
      <p>You can ask us to:</p>
      <ul>
        <li>tell you what personal information we hold about you and who we have shared it with;</li>
        <li>correct or complete anything that is wrong or out of date;</li>
        <li>delete what we hold, unless we have to keep it for a legal reason;</li>
        <li>stop contacting you.</li>
      </ul>
      <p>
        Write to <a href={`mailto:${email.value}`}>{email.value}</a> from the email address you used, or call from the
        number you gave us, so we can find your enquiry. We may ask one or two questions to be sure it is you. If we
        cannot act on a request, we will say why.
      </p>
      {/* PROPOSED CONTENT — REQUIRES CLIENT APPROVAL: the response times are a commitment the owner has to accept. */}
      <p>
        <PlaceholderTag>Response times to be approved</PlaceholderTag> We aim to acknowledge a request within 7 days
        and to answer it within 30 days.
      </p>
      <p>
        If you are not satisfied with how we handled it, you can complain to the data-protection authority in India.
      </p>

      <h2>Children</h2>
      <p>
        We do not knowingly collect information from anyone under 18. If you believe a child has sent us their details,
        tell us and we will delete them.
      </p>

      <h2>Changes to this notice</h2>
      <p>
        We will update this notice when what we do changes. The version and effective date appear at the top of this
        page.
      </p>

      <h2>Grievance and privacy contact</h2>
      <p>
        {site.legal.grievanceOfficer ? (
          <>
            {site.legal.grievanceOfficer.name} —{" "}
            <a href={`mailto:${site.legal.grievanceOfficer.email}`}>{site.legal.grievanceOfficer.email}</a>
          </>
        ) : (
          <>
            <PlaceholderTag>Grievance contact to be named</PlaceholderTag> Until we name one, please use the contact
            details above and say that it is a privacy request.
          </>
        )}
      </p>
    </LegalPageShell>
  );
}
