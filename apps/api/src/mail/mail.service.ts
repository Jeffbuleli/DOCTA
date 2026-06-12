import { Injectable, Logger } from '@nestjs/common';

/**
 * Envoi d'e-mails via Resend (https://resend.com).
 * Si RESEND_API_KEY n'est pas defini, on n'envoie rien : on journalise le lien
 * (utile en dev). L'API renverra alors le lien pour permettre les tests.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly apiKey = process.env.RESEND_API_KEY;
  private readonly from = process.env.MAIL_FROM || 'Docta <onboarding@resend.dev>';

  get isConfigured(): boolean {
    return !!this.apiKey;
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.apiKey) {
      this.logger.warn(`[MAIL non configure] -> ${to} : ${subject}`);
      return;
    }
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: this.from, to, subject, html }),
    });
    if (!res.ok) {
      const body = await res.text();
      this.logger.error(`Echec envoi e-mail (${res.status}): ${body}`);
      throw new Error('Envoi e-mail impossible');
    }
  }

  private layout(title: string, body: string, cta: string, link: string) {
    return `
      <div style="font-family:system-ui,Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#0f1b12">
        <h2 style="color:#018000;margin:0 0 8px">Docta</h2>
        <h3 style="margin:0 0 12px">${title}</h3>
        <p style="color:#52525b;line-height:1.5">${body}</p>
        <p style="margin:24px 0">
          <a href="${link}" style="background:#018000;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700;display:inline-block">${cta}</a>
        </p>
        <p style="color:#94a3b8;font-size:12px;word-break:break-all">${link}</p>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px">Powered by McBuleli</p>
      </div>`;
  }

  sendVerification(to: string, fullName: string, link: string) {
    return this.send(
      to,
      'Confirmez votre adresse e-mail — Docta',
      this.layout(
        `Bienvenue ${fullName}`,
        'Confirmez votre adresse e-mail pour activer votre compte Docta.',
        'Confirmer mon e-mail',
        link,
      ),
    );
  }

  sendPasswordReset(to: string, fullName: string, link: string) {
    return this.send(
      to,
      'Reinitialisation de votre mot de passe — Docta',
      this.layout(
        `Bonjour ${fullName}`,
        'Vous avez demande la reinitialisation de votre mot de passe. Ce lien expire dans 1 heure.',
        'Choisir un nouveau mot de passe',
        link,
      ),
    );
  }
}
