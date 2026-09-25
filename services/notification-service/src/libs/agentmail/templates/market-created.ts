import { baseTemplate } from './base';

export function newMarketEmailHtml(title: string, slug: string): string {
	const body = `
    <h2>A New Market is Live</h2>
    <p>A new prediction market has just been published on Probstreet and is open for trading.</p>
    <div class="detail-box">
      <div class="detail-row">
        <span class="detail-label">Market</span>
        <span class="detail-value">${title}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status</span>
        <span class="detail-value"><span class="badge-success">Live</span></span>
      </div>
    </div>
    <div style="margin-top: 32px;">
      <a href="${process.env.FRONTEND_URL || ''}/events/${slug}" class="cta-button">Trade Now</a>
    </div>
  `;
	return baseTemplate(`New Market: ${title}`, body);
}
