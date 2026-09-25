import { baseTemplate } from './base';

export function marketResolvedEmailHtml(title: string, result: string, isWinner: boolean): string {
	const winnerBody = `
    <h2>Market resolved — you won</h2>
    <p>Congratulations. The market you traded on has been resolved, and your position was on the correct side.</p>
    <div class="detail-box">
      <div class="detail-row">
        <span class="detail-label">Market</span>
        <span class="detail-value">${title}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Outcome</span>
        <span class="detail-value"><span class="verdict-yes">${result}</span></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Your Result</span>
        <span class="detail-value"><span class="badge-success">Winner</span></span>
      </div>
    </div>
    <p>Your winnings have been credited to your Probstreet wallet. Check your portfolio to see the updated balance.</p>
  `;

	const loserBody = `
    <h2>Market has been settled</h2>
    <p>A market you participated in has been resolved. Your positions have been settled accordingly.</p>
    <div class="detail-box">
      <div class="detail-row">
        <span class="detail-label">Market</span>
        <span class="detail-value">${title}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Outcome</span>
        <span class="detail-value">${result}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status</span>
        <span class="detail-value">Positions Settled</span>
      </div>
    </div>
    <p>Visit your portfolio to review the final settlement of your trades. New markets are always available to explore.</p>
  `;

	const body =
		(isWinner ? winnerBody : loserBody) +
		`
    <div style="margin-top: 32px;">
      <a href="${process.env.FRONTEND_URL || ''}/portfolio" class="cta-button">View Portfolio</a>
    </div>
  `;

	return baseTemplate(isWinner ? `Market Resolved — You Won` : `Market Settled: ${title}`, body);
}
