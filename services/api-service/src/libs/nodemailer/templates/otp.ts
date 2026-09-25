export function otpEmailHtml(otp: string): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login OTP — Probstreet</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f4f4f5; color: #18181b; line-height: 1.6; }
    .wrapper { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 4px; overflow: hidden; border: 1px solid #f0f0f0; }
    .header { background-color: #ffffff; padding: 12px 40px; border-bottom: 1px solid #e4e4e7; }
    .content { padding: 36px 40px; }
    .content h2 { font-size: 22px; font-weight: 700; color: #09090b; margin-bottom: 12px; letter-spacing: -0.3px; }
    .content p { font-size: 15px; color: #3f3f46; margin-bottom: 16px; }
    .otp-box { background-color: #f4f4f5; border-radius: 4px; padding: 24px; margin: 24px 0; text-align: center; font-size: 38px; font-weight: bold; letter-spacing: 12px; font-family: monospace; color: #09090b; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="${process.env.FRONTEND_URL || 'https://probstreet.com'}/logo.png" alt="Probstreet" style="height: 48px;" />
    </div>
    <div class="content">
      <h2>Your Login Code</h2>
      <p>Use this code to sign in to Probstreet. It expires in <strong>5 minutes</strong>.</p>
      <div class="otp-box">
        ${otp}
      </div>
      <p style="margin-top: 24px;">If you did not request this code, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>`;
}
