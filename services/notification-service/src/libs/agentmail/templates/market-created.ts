import { baseTemplate } from './base';

export function newMarketEmailHtml(title: string, slug: string): string {
	const body = `
    <h2>A new market is now live</h2>
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
    <p>Head over to Probstreet to explore the market, review the odds, and place your prediction.</p>
    <a href="${process.env.FRONTEND_URL || ''}/events/${slug}" class="cta-button">View Market</a>
    <hr class="divider" />
    <p style="font-size: 13px; color: #71717a;">You are receiving this because you have new market email alerts enabled. You can update your notification preferences in account settings.</p>
  `;
	return baseTemplate(`New Market: ${title}`, body);
}
