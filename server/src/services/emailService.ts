import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

class EmailService {
  async sendMagicLinkEmail(email: string, token: string): Promise<boolean> {
    const loginUrl = `${process.env.CLIENT_URL}/magic-link?token=${token}`;
    const from = process.env.EMAIL_FROM || "noreply@drmovietimes.com";

    const { error } = await resend.emails.send({
      from,
      to: email,
      subject: "Your Dr. Movie Times login link",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #080808; color: #f0f0f0; margin: 0; padding: 0; }
            .container { max-width: 480px; margin: 40px auto; padding: 40px 32px; }
            .label { font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #c9a84c; margin-bottom: 24px; }
            h2 { font-size: 28px; font-weight: 700; margin: 0 0 16px; letter-spacing: -0.02em; }
            p { color: #888; font-size: 14px; line-height: 1.7; margin: 0 0 28px; }
            .button { display: inline-block; padding: 14px 28px; background: #c9a84c; color: #080808; text-decoration: none; font-weight: 700; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; }
            .url { margin-top: 28px; font-size: 12px; color: #444; word-break: break-all; }
            .url a { color: #c9a84c; }
            .expire { margin-top: 24px; font-size: 12px; color: #383838; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="label">Dr. Movie Times M.D.</div>
            <h2>Your login link</h2>
            <p>Click the button below to sign in. No password needed.</p>
            <a href="${loginUrl}" class="button">Sign In →</a>
            <div class="url">Or paste this into your browser:<br><a href="${loginUrl}">${loginUrl}</a></div>
            <div class="expire">This link expires in 7 days and can only be used once.</div>
          </div>
        </body>
        </html>
      `,
      text: `Sign in to Dr. Movie Times M.D.\n\n${loginUrl}\n\nThis link expires in 7 days and can only be used once.`,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return false;
    }

    console.log(`✅ Magic link sent to ${email}`);
    return true;
  }
}

export default new EmailService();
