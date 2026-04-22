/**
 * Password reset email template.
 */
export function renderPasswordResetEmail(opts: {
  userName?: string;
  resetUrl: string;
  expiresInHours?: number;
}): { html: string; text: string } {
  const name = opts.userName ?? "there";
  const hours = opts.expiresInHours ?? 2;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your memacta password</title>
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
              <h1 style="font-size:22px;font-weight:600;color:#ffffff;margin:24px 0 12px;">Reset your password, ${name}</h1>
              <p style="font-size:15px;line-height:1.6;color:#a0a0b0;margin:0 0 28px;">
                We received a request to reset your memacta password. Click the button below.
                This link expires in ${hours} hours and can only be used once.
              </p>
              <a href="${opts.resetUrl}"
                 style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#e01070,#ff9f40);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
                Reset Password
              </a>
              <p style="font-size:13px;color:#606070;margin:28px 0 0;">
                Or copy this link into your browser:<br/>
                <span style="color:#a0a0b0;word-break:break-all;">${opts.resetUrl}</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 36px;border-top:1px solid #2a2a3a;">
              <p style="font-size:12px;color:#505060;margin:0;">
                If you didn&apos;t request a password reset, you can safely ignore this email.
                Your password won&apos;t change.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Reset your memacta password\n\nHi ${name},\n\nReset your password by visiting this link:\n${opts.resetUrl}\n\nThis link expires in ${hours} hours and can only be used once.\n\nIf you didn't request a password reset, ignore this email.`;

  return { html, text };
}
