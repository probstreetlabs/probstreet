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
    <p>Please log in to the admin dashboard to investigate the issue and trigger a manual archive if necessary.</p>
    <hr class="divider" />
    <p style="font-size: 13px; color: #71717a;">This is an automated system alert sent to Probstreet administrators.</p>
  `;
	return baseTemplate(`ALERT: Engine Archival Failed — ${symbol}`, body);
}
