import { api } from '@/lib/axios';

export const getBalance = () => {
	return api.get('/balance');
};

export const getDepositAmount = () => {
	return api.get('/balance/deposit');
};

export const withdraw = (amount: string, currentWalletAmount: string, paymentMethodId: string) => {
	return api.post('/balance/withdraw', { amount, currentWalletAmount, paymentMethodId });
};
