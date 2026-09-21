import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { SiInstagram } from "react-icons/si";
import { Suspense, lazy, useEffect, useRef, useState } from "react";

// Lazy-load the newsletter form only when the user scrolls near it. It is
// always below the fold and pulls react-hook-form + zod + drizzle schema
// code that would otherwise sit unused in the entry bundle on every page.
const Newsletter = lazy(() =>
  import("@/components/Newsletter").then((m) => ({ default: m.Newsletter }))
);

function LazyNewsletter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      // Start loading well before the section scrolls into view so the
      // placeholder is replaced without any visible pop-in or layout shift.
      { rootMargin: "600px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Placeholder approximates the rendered newsletter height (stacked panels
  // on mobile, side-by-side on md+) so the swap-in causes no layout shift
  // even on short pages where the footer is visible at load.
  const placeholder = (
    <div className="min-h-[520px] md:min-h-[400px]" aria-hidden="true" />
  );

  return (
    <div ref={containerRef}>
      {shouldLoad ? (
        <Suspense fallback={placeholder}>
          <Newsletter />
        </Suspense>
      ) : (
        placeholder
      )}
    </div>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <div className="mt-auto">
      <LazyNewsletter />
      <FooterContent currentYear={currentYear} t={t} />
    </div>
  );
}

function FooterContent({
  currentYear,
  t,
}: {
  currentYear: number;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <footer className="border-t bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center w-fit hover-elevate active-elevate-2 rounded-md p-2 -ml-2" data-testid="link-footer-logo">
              <img
                src="/images/logo-256.webp"
                alt="FIT-FUSION CALCULATE - Your Movement"
                className="h-16 sm:h-20 w-auto object-contain"
                width="123"
                height="80"
                loading="lazy"
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              {t("footer.tagline")}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/fitfusion25eu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-pink-500 transition-colors min-h-12 py-2 px-3 -ml-3 rounded-md"
                data-testid="link-instagram"
              >
                <SiInstagram className="h-6 w-6" aria-hidden="true" />
                <span className="text-sm font-medium">@fitfusion25eu</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("footer.calculators")}</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/bmi" className="inline-block py-2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px]">
                  {t("calculators.bmi.title")}
                </Link>
              </li>
              <li>
                <Link href="/bmr" className="inline-block py-2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px]">
                  {t("calculators.bmr.title")}
                </Link>
              </li>
              <li>
                <Link href="/calories" className="inline-block py-2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px]">
                  {t("calculators.calories.title")}
                </Link>
              </li>
              <li>
                <Link href="/macros" className="inline-block py-2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px]">
                  {t("calculators.macros.title")}
                </Link>
              </li>
              <li>
                <Link href="/food" className="inline-block py-2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px]">
                  {t("calculators.food.title")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("footer.resources")}</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/blog" className="inline-block py-2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px]">
                  {t("footer.blogArticles")}
                </Link>
              </li>
              <li>
                <Link href="/tips" className="inline-block py-2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px]">
                  {t("nav.tips")}
                </Link>
              </li>
              <li>
                <Link href="/supplements" className="inline-block py-2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px]">
                  {t("nav.supplements")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="inline-block py-2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px]" data-testid="link-footer-about">
                  {t("footer.about")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="inline-block py-2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px]" data-testid="link-footer-privacy">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="inline-block py-2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px]" data-testid="link-footer-contact">
                  {t("footer.contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p className="mb-2">
            <strong>Disclaimer:</strong> {t("footer.disclaimer")}
          </p>
          <p>{t("footer.copyright", { year: currentYear })}</p>
        </div>
      </div>
    </footer>
  );
}
