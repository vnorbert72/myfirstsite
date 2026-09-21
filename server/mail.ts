import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
const SMTP_SECURE = (process.env.SMTP_SECURE ?? "true") !== "false";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const MAIL_FROM = process.env.MAIL_FROM || `FitFusion <${SMTP_USER ?? "noreply@fit-fusion.eu"}>`;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;

export const hasMail = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASSWORD);

const transport = hasMail
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    })
  : null;

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  if (!transport) {
    console.warn(`[mail] not configured, skipping send to ${opts.to}`);
    return;
  }
  await transport.sendMail({
    from: MAIL_FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

export async function notifyNewSubscriber(email: string, language: string): Promise<void> {
  if (!NOTIFY_EMAIL) return;
  await sendMail({
    to: NOTIFY_EMAIL,
    subject: `Új feliratkozó: ${email}`,
    html: `
      <p>Új hírlevél-feliratkozó érkezett a fit-fusion.eu oldalon.</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}<br/>
      <strong>Nyelv:</strong> ${escapeHtml(language)}</p>
    `,
  });
}

const RECEIPT_COPY: Record<string, { subject: string; body: string }> = {
  en: {
    subject: "You're subscribed to the FitFusion newsletter",
    body: "Thanks for subscribing! You'll get an email whenever we publish fresh nutrition and training content. You can unsubscribe at any time using the link at the bottom of any newsletter.",
  },
  hu: {
    subject: "Feliratkoztál a FitFusion hírlevélre",
    body: "Köszönjük a feliratkozást! Emailt fogsz kapni, amikor friss táplálkozási és edzéssel kapcsolatos tartalmat teszünk közzé. Bármikor leiratkozhatsz a hírlevelek alján található linkkel.",
  },
  es: {
    subject: "Te has suscrito al boletín de FitFusion",
    body: "¡Gracias por suscribirte! Recibirás un correo cada vez que publiquemos contenido nuevo sobre nutrición y entrenamiento. Puedes darte de baja en cualquier momento con el enlace al final de cada boletín.",
  },
};

export async function sendSubscriberReceipt(email: string, language: string): Promise<void> {
  const copy = RECEIPT_COPY[language] || RECEIPT_COPY.en;
  await sendMail({
    to: email,
    subject: copy.subject,
    html: `<p>${escapeHtml(copy.body)}</p>`,
  });
}
