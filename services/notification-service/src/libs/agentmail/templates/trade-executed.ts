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
    <p>Your portfolio has been updated to reflect this trade. Visit Probstreet to monitor your positions.</p>
    <hr class="divider" />
    <p style="font-size: 13px; color: #71717a;">You can update your trade notification preferences in your account settings.</p>
  `;
	return baseTemplate(`Trade Executed on "${marketTitle}"`, body);
}
