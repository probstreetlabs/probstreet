import { create } from 'zustand';
import api from '@/config/axios';
import { queryClient } from '@/lib/queryClient';
import { authenticateSocket, deauthenticateSocket } from '@/socket';

export type OnboardingStatus = 'PENDING_USERNAME' | 'PENDING_PREFERENCES' | 'COMPLETED';

export interface User {
	id: string;
	email?: string;
	phone?: string;
	username?: string;
	bio?: string;
	avatarUrl?: string;
	role: string;
	isNewUser?: boolean;
	onboardingStatus: OnboardingStatus;
	usernameChangedAt?: string | Date | null;
}

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isHydrated: boolean;
	login: (user: User, streamToken?: string) => void;
	logout: () => void;
	updateUser: (data: Partial<User>) => void;
	hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
	user: null,
	isAuthenticated: false,
	isHydrated: false,

	login: (user, streamToken) => {
		set({ user, isAuthenticated: true });
		if (streamToken) {
			authenticateSocket(streamToken);
		} else {
			authenticateSocket();
		}
	},

	logout: async () => {
		try {
			await api.post('/auth/logout');
		} catch (error) {
			console.error('Logout failed on backend', error);
		} finally {
			queryClient.clear();
			set({ user: null, isAuthenticated: false });
			deauthenticateSocket();
		}
	},

	updateUser: (data) => {
		const currentUser = get().user;
		if (currentUser) {
			set({ user: { ...currentUser, ...data } });
		}
	},

	hydrate: async () => {
		try {
			const response = await api.get('/auth/me');
			if (response.data && response.data.success) {
				set({
					user: response.data.data,
					isAuthenticated: true,
					isHydrated: true,
				});
				if (response.data.streamToken) {
					authenticateSocket(response.data.streamToken);
				} else {
					authenticateSocket();
				}
			} else {
				set({ user: null, isAuthenticated: false, isHydrated: true });
				deauthenticateSocket();
			}
		} catch (error) {
			// 401 means not authenticated, which is fine, just means no session
			set({ user: null, isAuthenticated: false, isHydrated: true });
			deauthenticateSocket();
		}
	},
}));
