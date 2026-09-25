import { baseTemplate } from './base';

export function archiveFailedEmailHtml(symbol: string, error: string): string {
	const body = `
    <h2>Engine archival failure detected</h2>
    <p>An automated archival job for a market has failed. This requires your immediate attention to prevent data loss or settlement issues.</p>
    <div class="detail-box">
      <div class="detail-row">
        <span class="detail-label">Market Symbol</span>
        <span class="detail-value">${symbol}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status</span>
        <span class="detail-value"><span class="badge-danger">Failed</span></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Error</span>
        <span class="detail-value" style="color: #dc2626; word-break: break-all;">${error}</span>
      </div>
    </div>
    <div style="margin-top: 32px;">
      <a href="https://admin.probstreet.com/markets/${symbol}" class="cta-button">View Admin Dashboard</a>
    </div>
  `;
	return baseTemplate(`ALERT: Engine Archival Failed — ${symbol}`, body);
}
