import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const from = process.env.RESEND_FROM_EMAIL ?? "TemplateHub CM <noreply@templatehub.cm>";

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  if (!resend) {
    console.log("[DEV] Verification email:", url);
    return;
  }

  await resend.emails.send({
    from,
    to: email,
    subject: "Vérifiez votre email — TemplateHub CM",
    html: `
      <h1>Bienvenue ${name}!</h1>
      <p>Cliquez sur le lien ci-dessous pour vérifier votre email :</p>
      <a href="${url}">${url}</a>
      <p>Ce lien expire dans 24 heures.</p>
    `,
  });
}

export async function sendPurchaseConfirmation(
  email: string,
  name: string,
  templateTitle: string,
  downloadUrl: string
) {
  if (!resend) {
    console.log("[DEV] Purchase confirmation:", downloadUrl);
    return;
  }

  await resend.emails.send({
    from,
    to: email,
    subject: `Achat confirmé — ${templateTitle}`,
    html: `
      <h1>Merci ${name}!</h1>
      <p>Votre achat de <strong>${templateTitle}</strong> est confirmé.</p>
      <p><a href="${downloadUrl}">Télécharger votre template</a></p>
    `,
  });
}

export async function sendTemplateApprovedEmail(email: string, title: string) {
  if (!resend) {
    console.log("[DEV] Template approved:", title);
    return;
  }

  await resend.emails.send({
    from,
    to: email,
    subject: `Template approuvé — ${title}`,
    html: `<p>Votre template <strong>${title}</strong> a été approuvé et est maintenant visible sur TemplateHub CM.</p>`,
  });
}

export async function sendTemplateRejectedEmail(
  email: string,
  title: string,
  reason: string
) {
  if (!resend) {
    console.log("[DEV] Template rejected:", title, reason);
    return;
  }

  await resend.emails.send({
    from,
    to: email,
    subject: `Template rejeté — ${title}`,
    html: `<p>Votre template <strong>${title}</strong> a été rejeté.</p><p>Raison : ${reason}</p>`,
  });
}

export async function sendNewSaleEmail(
  email: string,
  templateTitle: string,
  amount: number
) {
  if (!resend) {
    console.log("[DEV] New sale:", templateTitle, amount);
    return;
  }

  await resend.emails.send({
    from,
    to: email,
    subject: `Nouvelle vente — ${templateTitle}`,
    html: `<p>Félicitations! Vous avez vendu <strong>${templateTitle}</strong> pour ${amount} XAF.</p>`,
  });
}
