import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePwaInstall() {
	const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
	const [isInstallable, setIsInstallable] = useState(false);
	const [isInstalled, setIsInstalled] = useState(false);

	useEffect(() => {
		// Check if already launched in standalone PWA mode
		const isStandalone =
			window.matchMedia('(display-mode: standalone)').matches ||
			(window.navigator as unknown as { standalone?: boolean }).standalone === true;

		if (isStandalone) {
			setIsInstalled(true);
			return;
		}

		const handlePrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);
			setIsInstallable(true);
		};

		const handleAppInstalled = () => {
			setIsInstalled(true);
			setIsInstallable(false);
			setDeferredPrompt(null);
		};

		window.addEventListener('beforeinstallprompt', handlePrompt);
		window.addEventListener('appinstalled', handleAppInstalled);

		return () => {
			window.removeEventListener('beforeinstallprompt', handlePrompt);
			window.removeEventListener('appinstalled', handleAppInstalled);
		};
	}, []);

	const promptInstall = async () => {
		if (!deferredPrompt) return false;
		await deferredPrompt.prompt();
		const choice = await deferredPrompt.userChoice;
		if (choice.outcome === 'accepted') {
			setIsInstalled(true);
			setIsInstallable(false);
			setDeferredPrompt(null);
			return true;
		}
		return false;
	};

	return { isInstallable, isInstalled, promptInstall };
}
