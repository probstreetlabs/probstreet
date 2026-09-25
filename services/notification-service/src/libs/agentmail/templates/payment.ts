import { baseTemplate } from './base';

type PaymentEventType =
	'deposit.success' | 'deposit.failed' | 'withdrawal.success' | 'withdrawal.failed';

export function paymentEmailHtml(
	eventType: PaymentEventType,
	amount: string | number,
	reason?: string,
): string {
	switch (eventType) {
		case 'deposit.success': {
			const body = `
        <h2>Deposit confirmed</h2>
        <p>Your deposit has been received and credited to your Probstreet wallet. You can now use these funds to trade on prediction markets.</p>
        <div class="detail-box">
          <div class="detail-row">
            <span class="detail-label">Amount Credited</span>
            <span class="detail-value">&#8377;${amount}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value"><span class="badge-success">Successful</span></span>
          </div>
        </div>
        <div style="margin-top: 32px;">
          <a href="${process.env.FRONTEND_URL || ''}/wallet" class="cta-button">View Wallet</a>
        </div>
      `;
			return baseTemplate('Deposit Successful — Probstreet', body);
		}

		case 'deposit.failed': {
			const body = `
        <h2>Deposit could not be processed</h2>
        <p>Unfortunately, your recent deposit attempt was unsuccessful. No funds have been deducted from your payment method.</p>
        <div class="detail-box">
          <div class="detail-row">
            <span class="detail-label">Amount</span>
            <span class="detail-value">&#8377;${amount}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value"><span class="badge-danger">Failed</span></span>
          </div>
          ${
						reason
							? `
          <div class="detail-row">
            <span class="detail-label">Reason</span>
            <span class="detail-value">${reason}</span>
          </div>`
							: ''
					}
        </div>
        <div style="margin-top: 32px;">
          <a href="${process.env.FRONTEND_URL || ''}/wallet" class="cta-button">View Wallet</a>
        </div>
      `;
			return baseTemplate('Deposit Failed — Probstreet', body);
		}

		case 'withdrawal.success': {
			const body = `
        <h2>Withdrawal processed</h2>
        <p>Your withdrawal request has been successfully processed. The funds are on their way to your bank account.</p>
        <div class="detail-box">
          <div class="detail-row">
            <span class="detail-label">Amount Withdrawn</span>
            <span class="detail-value">&#8377;${amount}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value"><span class="badge-success">Successful</span></span>
          </div>
        </div>
        <div style="margin-top: 32px;">
          <a href="${process.env.FRONTEND_URL || ''}/wallet" class="cta-button">View Wallet</a>
        </div>
      `;
			return baseTemplate('Withdrawal Successful — Probstreet', body);
		}

		case 'withdrawal.failed': {
			const body = `
        <h2>Withdrawal could not be completed</h2>
        <p>Your recent withdrawal request was unsuccessful. Your funds remain safe in your Probstreet wallet and have not been affected.</p>
        <div class="detail-box">
          <div class="detail-row">
            <span class="detail-label">Amount</span>
            <span class="detail-value">&#8377;${amount}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value"><span class="badge-danger">Failed</span></span>
          </div>
          ${
						reason
							? `
          <div class="detail-row">
            <span class="detail-label">Reason</span>
            <span class="detail-value">${reason}</span>
          </div>`
							: ''
					}
        </div>
        <div style="margin-top: 32px;">
          <a href="${process.env.FRONTEND_URL || ''}/wallet" class="cta-button">View Wallet</a>
        </div>
      `;
			return baseTemplate('Withdrawal Failed — Probstreet', body);
		}
	}
}
