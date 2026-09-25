import { baseTemplate } from './base';

export function oracleReviewEmailHtml(
	marketTitle: string,
	verdict: string,
	score: number,
	reviewUrl: string,
): string {
	const body = `
    <h2>Admin action required — Oracle review</h2>
    <p>The AI Oracle has flagged a market for manual review due to low confidence in the automated verdict. Your decision is needed before the market can be settled.</p>
    <div class="detail-box">
      <div class="detail-row">
        <span class="detail-label">Market</span>
        <span class="detail-value">${marketTitle}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Proposed Verdict</span>
        <span class="detail-value">${verdict || 'INCONCLUSIVE'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Confidence Score</span>
        <span class="detail-value">${score ?? 0} / 100</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Review Required By</span>
        <span class="detail-value">Admin</span>
      </div>
    </div>
    <div style="margin-top: 32px;">
      <a href="${reviewUrl}" class="cta-button">Review and Confirm Resolution</a>
    </div>
  `;
	return baseTemplate(`Action Required: Oracle Review — ${marketTitle}`, body);
}

export function oracleResolvedEmailHtml(
	marketTitle: string,
	verdict: string,
	sourceLabel: string,
	score: number | undefined,
	reasoning: string | undefined,
	marketUrl: string,
): string {
	const verdictClass = verdict === 'YES' ? 'verdict-yes' : 'verdict-no';
	const body = `
    <h2>Market auto-resolved by Oracle</h2>
    <p>The Probstreet automated Oracle pipeline has successfully resolved the following market. No manual action is required.</p>
    <div class="detail-box">
      <div class="detail-row">
        <span class="detail-label">Market</span>
        <span class="detail-value">${marketTitle}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Final Verdict</span>
        <span class="detail-value"><span class="${verdictClass}">${verdict}</span></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Resolution Method</span>
        <span class="detail-value">${sourceLabel}</span>
      </div>
      ${
				score !== undefined
					? `
      <div class="detail-row">
        <span class="detail-label">Confidence Score</span>
        <span class="detail-value">${score} / 100</span>
      </div>`
					: ''
			}
      ${
				reasoning
					? `
      <div class="detail-row">
        <span class="detail-label">Reasoning</span>
        <span class="detail-value" style="max-width: 340px; text-align: right;">${reasoning}</span>
      </div>`
					: ''
			}
    </div>
    <div style="margin-top: 32px;">
      <a href="${marketUrl}" class="cta-button">View Resolved Market</a>
    </div>
  `;
	return baseTemplate(`Oracle Auto-Resolved: ${marketTitle} — ${verdict}`, body);
}
