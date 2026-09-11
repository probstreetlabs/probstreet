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
    <p>Log in to Probstreet to review the market and act on this price movement before the opportunity changes.</p>
    <hr class="divider" />
    <p style="font-size: 13px; color: #71717a;">You set up a price alert for this market. You can manage or remove alerts from your account settings.</p>
  `;
	return baseTemplate(`Price Alert: ${marketTitle}`, body);
}
