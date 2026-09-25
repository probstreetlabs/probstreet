import { baseTemplate } from './base';

export function priceAlertEmailHtml(
	marketTitle: string,
	stockType: string,
	currentPrice: number,
): string {
	const body = `
    <h2>Price alert triggered</h2>
    <p>The price for a market you are tracking has reached your alert threshold on Probstreet.</p>
    <div class="detail-box">
      <div class="detail-row">
        <span class="detail-label">Market</span>
        <span class="detail-value">${marketTitle}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Position</span>
        <span class="detail-value">${stockType}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Current Price</span>
        <span class="detail-value">&#8377;${currentPrice}</span>
      </div>
    </div>
    <div style="margin-top: 32px;">
      <a href="${process.env.FRONTEND_URL || ''}/markets" class="cta-button">View Market</a>
    </div>
  `;
	return baseTemplate(`Price Alert: ${marketTitle}`, body);
}
