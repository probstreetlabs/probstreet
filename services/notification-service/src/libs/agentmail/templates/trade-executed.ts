import { baseTemplate } from './base';

export function tradeExecutedEmailHtml(
	marketTitle: string,
	stockType: string,
	price: number,
	quantity: number,
	totalValue: number,
): string {
	const body = `
    <h2>Your trade has been executed</h2>
    <p>A trade was successfully matched and executed on your behalf on Probstreet.</p>
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
        <span class="detail-label">Price per Share</span>
        <span class="detail-value">&#8377;${price}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Quantity</span>
        <span class="detail-value">${quantity} shares</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Total Value</span>
        <span class="detail-value">&#8377;${totalValue}</span>
      </div>
    </div>
    <div style="margin-top: 32px;">
      <a href="${process.env.FRONTEND_URL || ''}/portfolio" class="cta-button">View Portfolio</a>
    </div>
  `;
	return baseTemplate(`Trade Executed on "${marketTitle}"`, body);
}
