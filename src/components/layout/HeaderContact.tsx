import { PhoneIcon } from "@/components/ui";

/**
 * Call and WhatsApp, kept on screen at every width.
 *
 * Both were already published in the footer and inside the phone menu, which meant that on a
 * phone — where most of this business's visitors are, and where tapping a number is the whole
 * point — nothing actionable stayed on screen while scrolling. A call is the highest-intent
 * action a local installer can offer, and WhatsApp is the default contact expectation for this
 * buyer, so both now sit in the fixed header.
 *
 * Shape follows the width. A phone gets an icon button, because there is no room for a number
 * beside the logo and the menu. From `md` the number is spelled out, because a visible number is
 * itself a trust signal on a large purchase — you can see who you would be ringing.
 *
 * WhatsApp is not here: it is the floating bubble (<WhatsAppBubble>), which is where the owner's
 * previous site put it and where this buyer looks for it.
 */
export function HeaderContact({
  phone,
  srLabel,
}: {
  phone: { display: string; tel: string };
  /** The link's accessible name; the visible text is the number itself. */
  srLabel: string;
}) {
  return (
    <>
      <a
        href={`tel:${phone.tel}`}
        className="grid size-11 shrink-0 place-items-center rounded-full text-white transition-colors duration-200 ease-controlled hover:bg-white/15 md:w-auto md:gap-2 md:px-4 md:[grid-auto-flow:column]"
      >
        <PhoneIcon className="size-[18px]" />
        <span className="sr-only md:not-sr-only md:font-mono md:text-small md:tabular-nums">
          {phone.display}
        </span>
        <span className="sr-only">{srLabel}</span>
      </a>

    </>
  );
}
