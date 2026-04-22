/**
 * Persona training complete notification email template.
 */
export function renderPersonaTrainingCompleteEmail(opts: {
  userName?: string;
  personaName: string;
  personaUrl: string;
}): { html: string; text: string } {
  const name = opts.userName ?? "there";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Persona is ready!</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#e0e0e0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#12121a;border-radius:12px;overflow:hidden;border:1px solid #2a2a3a;">
          <tr>
            <td style="background:linear-gradient(135deg,#e01070 0%,#ff9f40 100%);padding:4px 0;"></td>
          </tr>
          <tr>
            <td style="padding:40px 36px;">
              <p style="font-size:28px;font-weight:700;margin:0 0 8px;background:linear-gradient(135deg,#e01070,#ff9f40);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">memacta</p>
              <h1 style="font-size:22px;font-weight:600;color:#ffffff;margin:24px 0 12px;">Your Persona is ready, ${name}!</h1>
              <p style="font-size:15px;line-height:1.6;color:#a0a0b0;margin:0 0 12px;">
                Great news — your Persona <strong style="color:#ffffff;">${opts.personaName}</strong> has finished training
                and is ready to generate.
              </p>
              <p style="font-size:15px;line-height:1.6;color:#a0a0b0;margin:0 0 28px;">
                Head to your Persona and start creating with your premium LoRA model.
              </p>
              <a href="${opts.personaUrl}"
                 style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#e01070,#ff9f40);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
                Open ${opts.personaName}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 36px;border-top:1px solid #2a2a3a;">
              <p style="font-size:12px;color:#505060;margin:0;">
                You&apos;re receiving this because you started a premium Persona training on memacta.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Your Persona is ready!\n\nHi ${name},\n\nYour Persona "${opts.personaName}" has finished training and is ready to generate.\n\nVisit your Persona:\n${opts.personaUrl}`;

  return { html, text };
}
