import { withdraw } from '@/api/balance';
import { useMutation } from '@tanstack/react-query';

export const useWithdrawMutation = () => {
	return useMutation({
		mutationKey: ['withdrawl'],
		mutationFn: ({
			amount,
			currentWalletAmount,
			paymentMethodId,
		}: {
			amount: string;
			currentWalletAmount: string;
			paymentMethodId: string;
		}) => withdraw(amount, currentWalletAmount, paymentMethodId),
	});
};
