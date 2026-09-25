export function baseTemplate(title: string, body: string): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f4f4f5; color: #18181b; line-height: 1.6; }
    .wrapper { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 4px; overflow: hidden; border: 1px solid #f0f0f0; }
    .header { background-color: #ffffff; padding: 12px 40px; border-bottom: 1px solid #e4e4e7; }
    .content { padding: 36px 40px; }
    .content h2 { font-size: 22px; font-weight: 700; color: #09090b; margin-bottom: 12px; letter-spacing: -0.3px; }
    .content p { font-size: 15px; color: #3f3f46; margin-bottom: 16px; }
    .detail-box { background-color: #f4f4f5; border-radius: 4px; padding: 20px 24px; margin: 24px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e4e4e7; font-size: 14px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #71717a; font-weight: 500; }
    .detail-value { color: #09090b; font-weight: 600; }
    .verdict-yes { color: #16a34a; }
    .verdict-no { color: #dc2626; }
    .cta-button { display: inline-block; margin-top: 8px; padding: 10px 18px; background-color: #09090b; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; }
    .divider { border: none; border-top: 1px solid #e4e4e7; margin: 28px 0; }
    .badge-success { display: inline-block; padding: 3px 10px; background-color: #dcfce7; color: #15803d; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .badge-danger { display: inline-block; padding: 3px 10px; background-color: #fee2e2; color: #b91c1c; border-radius: 999px; font-size: 12px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="${process.env.FRONTEND_URL || 'https://probstreet.com'}/logo.png" alt="Probstreet" style="height: 48px;" />
    </div>
    <div class="content">
      ${body}
    </div>
  </div>
</body>
</html>`;
}
