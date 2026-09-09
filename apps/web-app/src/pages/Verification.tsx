import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { useState, useEffect, useRef } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { Loader2, ChevronRight } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import kycTitleIcon from '@/assets/images/kyc_title.avif';
import { VerificationPreview } from '@/components/VerificationPreview';
import { useSubmitKycMutation, useSubmitPaymentMutation } from '@/hooks/mutations/verification';
import { useGetVerificationStatus, useGetVerificationDetails } from '@/hooks/queries/verification';

export default function KycVerificationPage() {
	const queryClient = useQueryClient();

	const [panName, setPanName] = useState('');
	const [panNumber, setPanNumber] = useState('');
	const [DOB, setDOB] = useState<Date | null>(null);

	const [ifscCode, setIfscCode] = useState('');
	const [upiId, setUpiId] = useState('');
	const [bankAccountNumber, setBankAccountNumber] = useState('');
	const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'BANK'>('BANK');
	const [showPaymentForm, setShowPaymentForm] = useState(false);

	const { data: verificationData, isLoading: isLoadingDetails } = useGetVerificationDetails();
	const { data: statusData, isLoading: isLoadingStatus } = useGetVerificationStatus();
	const { mutate: submitKyc, isPending: kycPending } = useSubmitKycMutation();
	const { mutate: submitPayment, isPending: paymentPending } = useSubmitPaymentMutation();

	const prevKycStatus = useRef<string | null>(null);
	const prevPaymentStatus = useRef<string | null>(null);

	useEffect(() => {
		if (statusData?.data?.data) {
			const currentKycStatus = statusData.data.data.kycVerificationStatus;
			const currentPaymentStatus = statusData.data.data.paymentVerificationStatus;

			if (prevKycStatus.current === 'PENDING' && currentKycStatus === 'VERIFIED') {
				toast.success('KYC Verification Approved!');
			} else if (prevKycStatus.current === 'PENDING' && currentKycStatus === 'REJECTED') {
				toast.error('KYC Verification Rejected!');
			}

			if (prevPaymentStatus.current === 'PENDING' && currentPaymentStatus === 'VERIFIED') {
				toast.success('Payment Method Verification Approved!');
			} else if (prevPaymentStatus.current === 'PENDING' && currentPaymentStatus === 'REJECTED') {
				toast.error('Payment Method Verification Rejected!');
			}

			prevKycStatus.current = currentKycStatus;
			prevPaymentStatus.current = currentPaymentStatus;
		}
	}, [statusData]);

	const isUserOfAge = (dob: Date | null) => {
		if (!dob) return false;
		const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
		return age >= 18;
	};

	const handleSubmitKyc = () => {
		if (!DOB) return;
		if (!isUserOfAge(DOB)) {
			toast.error('You must be at least 18 years old.');
			return;
		}
		submitKyc(
			{ panName, panNumber, DOB: DOB.toISOString().split('T')[0] },
			{
				onSuccess: (data: any) => {
					if (data?.data?.status === 'VERIFIED') {
						toast.success('KYC Verification Approved!');
					} else if (data?.data?.status === 'REJECTED') {
						toast.error('KYC Verification Rejected!');
					} else {
						toast.success('KYC details submitted successfully');
					}
					queryClient.invalidateQueries({ queryKey: ['verificationStatus'] });
					queryClient.invalidateQueries({ queryKey: ['verificationDetails'] });
				},
				onError: (error: any) => {
					toast.error(error.response?.data?.message || 'Failed to submit KYC details');
				},
			},
		);
	};

	const handleSubmitPayment = () => {
		if (paymentMethod === 'UPI' && !upiId) return;
		if (paymentMethod === 'BANK' && (!bankAccountNumber || !ifscCode)) return;

		submitPayment(
			{
				upiId,
				bankAccountNumber,
				ifscCode,
			},
			{
				onSuccess: (data: any) => {
					if (data?.data?.status === 'VERIFIED') {
						toast.success('Payment Method Verification Approved!');
					} else if (data?.data?.status === 'REJECTED') {
						toast.error('Payment Method Verification Rejected!');
					} else {
						toast.success('Payment method submitted successfully');
					}
					queryClient.invalidateQueries({ queryKey: ['verificationStatus'] });
					queryClient.invalidateQueries({ queryKey: ['verificationDetails'] });
					setShowPaymentForm(false);
					setUpiId('');
					setBankAccountNumber('');
					setIfscCode('');
				},
				onError: (error: any) => {
					toast.error(error.response?.data?.message || 'Failed to submit payment method');
				},
			},
		);
	};

	const isValidPan = (pan: string) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
	const isFormValid =
		panName.trim() !== '' && isValidPan(panNumber) && DOB !== null && isUserOfAge(DOB);

	const isPaymentFormValid =
		paymentMethod === 'UPI'
			? upiId.trim() !== ''
			: bankAccountNumber.trim() !== '' && ifscCode.trim() !== '';

	if (isLoadingStatus) {
		return (
			<div className="flex justify-center bg-[#f4f4f5] dark:bg-[#090C1A] items-center py-72 transition-colors">
				<Loader2 className="animate-spin w-6 h-6 text-gray-600 dark:text-gray-400" />
			</div>
		);
	}

	const { kycVerificationStatus, paymentVerificationStatus } = statusData?.data.data || {};

	const isKycComplete = kycVerificationStatus === 'PENDING' || kycVerificationStatus === 'VERIFIED';
	const isPaymentComplete =
		paymentVerificationStatus === 'PENDING' || paymentVerificationStatus === 'VERIFIED';
	const isAllComplete = isKycComplete && isPaymentComplete;

	return (
		<div className="w-full bg-[#f4f4f5] dark:bg-[#090C1A] flex justify-center items-start text-gray-900 dark:text-white transition-colors pb-10">
			<div className="max-w-232 flex flex-col items-start md:px-4 px-6 md:py-2 w-full pt-4 md:pt-8">
				<nav className="md:text-base text-sm mt-4 mb-8">
					<ol className="list-reset flex items-center text-gray-500 dark:text-gray-400 space-x-0.5">
						<li>
							<Link to="/" className="hover:underline">
								Home
							</Link>
						</li>
						<ChevronRight size={20} />
						<li>
							<Link to="/wallet" className="hover:underline">
								Wallet
							</Link>
						</li>
						<ChevronRight size={20} />
						<li className="text-gray-900 dark:text-white font-medium">Verification</li>
					</ol>
				</nav>

				<div className="flex items-center mb-6 gap-4">
					<img
						src={kycTitleIcon}
						alt="KYC Illustration"
						className="w-16 h-16 object-contain dark:invert"
					/>
					<div>
						<h2 className="md:text-2xl text-xl font-semibold text-gray-900 dark:text-white">
							KYC verification
						</h2>
						<p className="text-gray-600 dark:text-gray-400 md:text-base text-sm">
							{isAllComplete ? 'Verification complete' : 'Instant verification via Cashfree'}
						</p>
					</div>
				</div>

				<div className="w-full rounded-xl">
					{/* Step 1: KYC PAN Form (if not verified or rejected) */}
					{(!isKycComplete || kycVerificationStatus === 'REJECTED') && (
						<div className="w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl py-6 px-6 shadow-sm transition-colors">
							<div className="text-sm max-w-89.25 rounded-lg mb-6">
								<h3 className="text-[10px] mb-1.5 font-semibold text-red-600 dark:text-red-400 tracking-wide uppercase">
									IMPORTANT
								</h3>
								<p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
									Bank and PAN card details should be of the same person. Incorrect or different
									details may lead to permanent block.
								</p>
							</div>

							<div className="space-y-6 max-w-89.25">
								<div>
									<label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1.5">
										Name (as in PAN card)
									</label>
									<input
										type="text"
										placeholder="Type the full name"
										value={panName}
										onChange={(e) => setPanName(e.target.value)}
										className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-white/10 bg-white dark:bg-[#090C1A] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1.5">
										PAN card number
									</label>
									<input
										type="text"
										placeholder="PAN number (10 digits)"
										maxLength={10}
										value={panNumber}
										onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
										className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-white/10 bg-white dark:bg-[#090C1A] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1.5">
										Date of Birth
									</label>
									<DatePicker
										onChange={(date: Date | null) => setDOB(date)}
										dateFormat="dd/MM/yyyy"
										placeholderText="DD/MM/YYYY"
										showMonthDropdown
										selected={DOB}
										showYearDropdown
										dropdownMode="select"
										wrapperClassName="w-full"
										className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-white/10 bg-white dark:bg-[#090C1A] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
									/>
								</div>

								<button
									onClick={handleSubmitKyc}
									disabled={!isFormValid || kycPending}
									className={`w-full py-3.5 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center ${
										!isFormValid
											? 'bg-gray-200 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-not-allowed'
											: 'bg-black dark:bg-white text-white dark:text-black cursor-pointer hover:opacity-90'
									}`}
								>
									{kycPending ? <Loader2 className="animate-spin w-4 h-4" /> : 'Continue'}
								</button>
							</div>
						</div>
					)}

					{/* Step 2: Payment Details Form */}
					{isKycComplete &&
						(!isPaymentComplete || paymentVerificationStatus === 'REJECTED' || showPaymentForm) && (
							<div className="w-full rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 min-h-[40vh] py-6 px-6 shadow-sm transition-colors mb-6">
								<div className="flex items-center justify-between mb-6">
									<div className="text-sm max-w-89.25 rounded-lg">
										<h3 className="text-[10px] mb-2 font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
											PAYMENT DETAILS
										</h3>
										<p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
											Please provide your payment method. Make sure the details are correct to avoid
											failed transactions.
										</p>
									</div>
								</div>

								<div className="space-y-6 max-w-87.5">
									<div>
										<label className="block text-gray-800 dark:text-gray-200 mb-2 font-medium text-sm">
											Select Payment Method
										</label>
										<div className="flex items-center gap-6">
											<label className="flex items-center gap-2 cursor-pointer text-gray-800 dark:text-gray-200">
												<input
													type="radio"
													checked={paymentMethod === 'BANK'}
													onChange={() => setPaymentMethod('BANK')}
													className="accent-black dark:accent-white"
												/>
												Bank Account
											</label>
											<label
												className="flex items-center gap-2 cursor-not-allowed opacity-50 text-gray-800 dark:text-gray-200"
												title="Temporarily unavailable"
											>
												<input
													type="radio"
													disabled
													checked={paymentMethod === 'UPI'}
													className="accent-black dark:accent-white"
												/>
												UPI ID (Disabled)
											</label>
										</div>
									</div>

									{paymentMethod === 'UPI' && (
										<div>
											<label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1.5">
												UPI ID
											</label>
											<input
												type="text"
												placeholder="example@upi"
												value={upiId}
												onChange={(e) => setUpiId(e.target.value)}
												className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-white/10 bg-white dark:bg-[#090C1A] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
											/>
										</div>
									)}

									{paymentMethod === 'BANK' && (
										<>
											<div>
												<label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1.5">
													Bank Account Number
												</label>
												<input
													type="text"
													placeholder="Enter account number"
													value={bankAccountNumber}
													onChange={(e) => setBankAccountNumber(e.target.value)}
													className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-white/10 bg-white dark:bg-[#090C1A] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1.5">
													IFSC Code
												</label>
												<input
													type="text"
													placeholder="Enter IFSC code"
													value={ifscCode}
													onChange={(e) => setIfscCode(e.target.value)}
													className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-white/10 bg-white dark:bg-[#090C1A] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
												/>
											</div>
										</>
									)}

									<button
										onClick={handleSubmitPayment}
										disabled={!isPaymentFormValid || paymentPending}
										className={`w-full py-3.5 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center ${
											!isPaymentFormValid || paymentPending
												? 'bg-gray-200 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-not-allowed'
												: 'bg-black dark:bg-white text-white dark:text-black cursor-pointer hover:opacity-90'
										}`}
									>
										{paymentPending ? (
											<Loader2 className="animate-spin w-4 h-4" />
										) : (
											'Submit Payment'
										)}
									</button>
								</div>
							</div>
						)}

					{/* Step 3: All Details Submitted & Under Review or Verified */}
					{isAllComplete &&
						!showPaymentForm &&
						(isLoadingDetails ? (
							<div className="flex justify-center items-center py-16 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl">
								<Loader2 className="animate-spin w-6 h-6 text-gray-600 dark:text-gray-400" />
							</div>
						) : (
							<VerificationPreview
								data={verificationData?.data?.data}
								onAddPaymentMethod={() => setShowPaymentForm(true)}
							/>
						))}
				</div>
			</div>
		</div>
	);
}
