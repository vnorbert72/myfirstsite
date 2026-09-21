import type { NewsletterArticle } from "./articles-reader";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

const COPY: Record<
  string,
  { subject: string; heading: string; intro: string; readMore: string; unsubscribe: string }
> = {
  en: {
    subject: "Fresh from FitFusion",
    heading: "Fresh from FitFusion",
    intro: "Here's what we've published recently:",
    readMore: "Read more",
    unsubscribe: "Unsubscribe",
  },
  hu: {
    subject: "Friss hírek a FitFusion-tól",
    heading: "Friss hírek a FitFusion-tól",
    intro: "Íme, amit mostanában publikáltunk:",
    readMore: "Tovább olvasom",
    unsubscribe: "Leiratkozás",
  },
  es: {
    subject: "Novedades de FitFusion",
    heading: "Novedades de FitFusion",
    intro: "Esto es lo que hemos publicado recientemente:",
    readMore: "Leer más",
    unsubscribe: "Darse de baja",
  },
};

export function newsletterSubject(lang: string): string {
  return (COPY[lang] || COPY.en).subject;
}

export function renderNewsletterHtml(
  lang: string,
  articles: NewsletterArticle[],
  siteUrl: string,
  unsubscribeUrl: string,
): string {
  const copy = COPY[lang] || COPY.en;
  const langPrefix = lang === "en" ? "" : `?lang=${lang}`;

  const articlesHtml = articles
    .map((a) => {
      const url = `${siteUrl}/blog/${encodeURIComponent(a.slug)}${langPrefix}`;
      return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #eee;">
            <p style="margin:0 0 6px;font-size:18px;font-weight:600;color:#1a1a1a;">
              <a href="${url}" style="color:#ea580c;text-decoration:none;">${escapeHtml(a.title)}</a>
            </p>
            <p style="margin:0 0 8px;font-size:14px;color:#555;line-height:1.5;">${escapeHtml(a.excerpt)}</p>
            <a href="${url}" style="font-size:13px;color:#ea580c;text-decoration:none;font-weight:600;">${copy.readMore} →</a>
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="${lang}">
      <head><meta charset="utf-8" /></head>
      <body style="margin:0;padding:0;background:#f6f6f4;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f4;padding:24px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="background:#ea580c;padding:24px;text-align:center;">
                    <span style="font-size:22px;font-weight:700;color:#ffffff;">FitFusion</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px;">
                    <h1 style="margin:0 0 8px;font-size:20px;color:#1a1a1a;">${copy.heading}</h1>
                    <p style="margin:0 0 16px;font-size:14px;color:#555;">${copy.intro}</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${articlesHtml}
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;text-align:center;">
                    <a href="${unsubscribeUrl}" style="font-size:12px;color:#999;text-decoration:underline;">${copy.unsubscribe}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
