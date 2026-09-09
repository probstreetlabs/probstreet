import { formatAmount } from '@/lib/format';
import { useNavigate, Link } from 'react-router-dom';
import kycWalletIcon from '@/assets/images/kyc_v2.avif';
import { ArrowRight, Gift, ChevronRight } from 'lucide-react';
import gaugeWalletIcon from '@/assets/images/gauge_icon_v2.avif';
import depositWalletIcon from '@/assets/images/deposit_wallet_icon.png';
import { useGetVerificationStatus } from '@/hooks/queries/verification';
import transactionWalletIcon from '@/assets/images/transaction_v2.avif';
import winningsWalletIcon from '@/assets/images/winnings_wallet_icon.png';
import { useBalanceQuery, useDepositAmountQuery } from '@/hooks/queries/balance';

export default function WalletPage() {
	const navigate = useNavigate();

	const { data: balance, isLoading } = useBalanceQuery();
	const { data: verificationStatus } = useGetVerificationStatus();
	const { data: depositeAmountData } = useDepositAmountQuery();

	const isKycVerified = verificationStatus?.data?.data?.kycVerificationStatus === 'VERIFIED';

	const goToRecharge = () => {
		navigate('/wallet/recharge');
	};

	const goToWithdraw = () => {
		navigate('/wallet/withdraw');
	};

	const goToverification = () => {
		navigate('/verification');
	};

	const goToTransactionHistory = () => {
		navigate('/transaction-history');
	};

	const goToControlCentre = () => {
		navigate('/wallet/control-centre');
	};

	return (
		<div className="w-full bg-[#f4f4f5] dark:bg-[#090C1A] flex justify-center px-6 md:px-4 md:pt-8 pt-4 pb-10 md:pb-0 transition-colors min-h-screen">
			<div className="w-full max-w-4xl flex flex-col gap-8">
				<nav className="md:text-base text-sm mt-4 md:mb-3 mb-1">
					<ol className="list-reset flex items-center text-gray-500 dark:text-gray-400 space-x-0.5">
						<li>
							<Link to="/" className="hover:underline">
								Home
							</Link>
						</li>
						<ChevronRight size={20} />
						<li className="text-gray-900 dark:text-white font-medium">Wallet</li>
					</ol>
				</nav>

				<div>
					<h2 className="text-sm text-[#262626] dark:text-gray-400 font-normal">Total Balance</h2>
					{isLoading ? (
						<p className="md:text-5xl text-4xl font-semibold mt-1 text-gray-900 dark:text-white">
							₹ 0
						</p>
					) : (
						<p className="md:text-5xl text-4xl font-semibold mt-1 text-gray-900 dark:text-white">
							₹ {formatAmount(balance?.data?.data?.amount)}
						</p>
					)}
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
					{/* Deposit */}
					<div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-gray-400/25 dark:border-white/10 flex flex-col gap-1 transition-colors">
						<img src={depositWalletIcon} alt="Deposit Icon" className="w-8 h-8 dark:invert" />
						<h3 className="text-base mt-4 text-[#262626] dark:text-gray-200 font-normal">
							Deposit Money
						</h3>
						<p className="text-xl font-medium text-gray-900 dark:text-white">
							₹{formatAmount(depositeAmountData?.data?.data?.totalDepositAmount)}
						</p>
						<button
							onClick={goToRecharge}
							className="w-16 h-9 cursor-pointer mt-4 flex items-center justify-center rounded-full border border-gray-400/60 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
						>
							<ArrowRight className="w-6 h-6 text-black dark:text-white" />
						</button>
					</div>

					{/* Winnings */}
					<div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-gray-400/25 dark:border-white/10 flex flex-col gap-1 transition-colors">
						<img src={winningsWalletIcon} alt="Winnings Icon" className="w-8 h-8 dark:invert" />
						<h3 className="text-base mt-4 text-[#262626] dark:text-gray-200 font-normal">
							Your Winnings
						</h3>
						<p
							className={`text-xl font-medium ${isKycVerified ? 'text-black dark:text-white' : 'text-gray-900 dark:text-white'}`}
						>
							₹{isLoading ? '0' : formatAmount(balance?.data?.data?.amount)}
						</p>
						<button
							onClick={() => {
								if (isKycVerified) {
									goToWithdraw();
								} else {
									goToverification();
								}
							}}
							className="w-16 h-9 cursor-pointer mt-4 flex items-center justify-center rounded-full border border-gray-400/60 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
						>
							<ArrowRight className="w-6 h-6 text-black dark:text-white" />
						</button>
					</div>

					{/* Transaction History */}
					<div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-gray-400/25 dark:border-white/10 flex flex-col gap-1 transition-colors">
						<img
							src={transactionWalletIcon}
							alt="Transaction History Icon"
							className="w-8 h-8 dark:invert"
						/>
						<h3 className="text-base mt-4 text-[#262626] dark:text-gray-200 font-normal">
							Transaction History
						</h3>
						<p className="text-xs text-[#757575] dark:text-gray-400">
							View debits, credits & payouts
						</p>
						<button
							onClick={goToTransactionHistory}
							className="w-16 h-9 cursor-pointer mt-4 flex items-center justify-center rounded-full border border-gray-400/60 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
						>
							<ArrowRight className="w-6 h-6 text-black dark:text-white" />
						</button>
					</div>
				</div>

				<div>
					<h2 className="text-xl font-semibold mt-2 mb-4 text-gray-900 dark:text-white">
						Quick Actions
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{/* KYC Verification */}
						<div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-gray-400/25 dark:border-white/10 flex flex-col gap-1 transition-colors">
							<img src={kycWalletIcon} className="w-8 h-8 dark:invert" alt="KYC Verification" />
							<h3 className="text-base mt-4 text-[#262626] dark:text-gray-200 font-normal">
								KYC verification
							</h3>
							{isKycVerified ? (
								<p className="text-xs text-green-600 dark:text-green-400">
									Verified on{' '}
									{new Date(verificationStatus.data.data.kycVerifiedAt).toLocaleDateString(
										'en-US',
										{
											day: 'numeric',
											month: 'long',
											year: 'numeric',
										},
									)}
								</p>
							) : (
								<p className="text-xs text-[#D29822] dark:text-yellow-500">Tap to verify</p>
							)}
							<button
								onClick={goToverification}
								className="w-16 h-9 cursor-pointer mt-4 flex items-center justify-center rounded-full border border-gray-400/60 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
							>
								<ArrowRight className="w-6 h-6 text-black dark:text-white" />
							</button>
						</div>

						{/* Refer & Rewards */}
						<div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-gray-400/25 dark:border-white/10 flex flex-col gap-1 transition-colors">
							<div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
								<Gift size={20} />
							</div>
							<h3 className="text-base mt-4 text-[#262626] dark:text-gray-200 font-normal">
								Refer & Rewards
							</h3>
							<p className="text-xs text-[#757575] dark:text-gray-400">
								Invite friends & earn ₹20 bonus
							</p>
							<button
								onClick={() => navigate('/referral')}
								className="w-16 h-9 cursor-pointer mt-4 flex items-center justify-center rounded-full border border-gray-400/60 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
							>
								<ArrowRight className="w-6 h-6 text-black dark:text-white" />
							</button>
						</div>

						{/* Control Centre */}
						<div className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-gray-400/25 dark:border-white/10 flex flex-col gap-1 transition-colors">
							<img src={gaugeWalletIcon} className="w-8 h-8 dark:invert" alt="Control Centre" />
							<h3 className="text-base mt-4 text-[#262626] dark:text-gray-200 font-normal">
								Control Centre
							</h3>
							<p className="text-xs text-[#757575] dark:text-gray-400">
								Manage Price Alerts & limits
							</p>
							<button
								onClick={goToControlCentre}
								className="w-16 h-9 cursor-pointer mt-4 flex items-center justify-center rounded-full border border-gray-400/60 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
								aria-label="Open Control Centre"
							>
								<ArrowRight className="w-6 h-6 text-black dark:text-white" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
