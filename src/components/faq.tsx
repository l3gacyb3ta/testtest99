import { FAQS } from "@/lib/content";

/**
 * Comp geometry: a 1615-wide field of 725 × 323 plates, two up, 56px apart
 * (Figma 275:158–177). The comp's grey containing panel is dropped — its only
 * job was separating the field from the band behind it, and the palette shift
 * to periwinkle now does that.
 */
export default function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-hl-periwinkle text-hl-ink"
    >
      <div
        className="mx-auto max-w-[1615px] px-4 py-20 sm:px-8 min-[1180px]:px-[3.4vw] min-[1180px]:py-28"
      >
        <h2
          id="faq-heading"
          className="font-display font-bold tracking-[-0.025em]"
          style={{ fontSize: "clamp(2.25rem, 5.8vw, 6rem)", lineHeight: 1 }}
        >
          Frequently Asked Questions
        </h2>

        <dl
          className="mt-12 grid gap-5 min-[1180px]:mt-20"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 26rem), 1fr))",
            gap: "clamp(1.25rem, 3.24vw, 56px)",
          }}
        >
          {FAQS.map((faq) => (
            <div
              key={faq.q}
              className="flex flex-col bg-hl-paper"
              style={{ padding: "clamp(1.25rem, 2.37vw, 41px)" }}
            >
              <dt
                className="font-display font-bold"
                style={{
                  fontSize: "clamp(1.35rem, 2.32vw, 2.5rem)",
                  lineHeight: 1.1,
                }}
              >
                {faq.q}
              </dt>
              <dd
                className="mt-[0.85em] text-hl-ink"
                style={{
                  fontSize: "clamp(1rem, 1.74vw, 1.875rem)",
                  lineHeight: 1.45,
                }}
              >
                {faq.a}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
