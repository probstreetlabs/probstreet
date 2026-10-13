import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
	KeyRound,
	Plus,
	Copy,
	Check,
	Trash2,
	Code2,
	ExternalLink,
	ChevronDown,
	X,
	Lock,
	Calendar,
	Clock,
	Timer,
} from 'lucide-react';
import LogoutModalIcon from '@/assets/images/LogoutModal.svg';
import { fetchApiKeys, createApiKey, revokeApiKey, updateApiKey } from '@/api/apiKey';
import type { ApiKeyItem, CreateApiKeyResponse } from '@/api/apiKey';

const AVAILABLE_SCOPES = [
	{
		id: 'orders:write',
		label: 'Trade & Orders (Write)',
		desc: 'Place limit & market orders, cancel active orders',
	},
	{
		id: 'orders:read',
		label: 'Orders & Trades (Read)',
		desc: 'View open orders, trade history, and execution status',
	},
	{
		id: 'market:read',
		label: 'Markets & Orderbooks (Read)',
		desc: 'Access live market orderbooks, tickers, and price history',
	},
	{
		id: 'wallet:read',
		label: 'Wallet & Portfolio (Read)',
		desc: 'View wallet balance, position holdings, and stock balances',
	},
];

const formatTimeAgo = (dateStr?: string | Date | null) => {
	if (!dateStr) return 'Never';
	const now = new Date();
	const past = new Date(dateStr);
	const diffInSeconds = Math.max(0, Math.floor((now.getTime() - past.getTime()) / 1000));

	if (diffInSeconds < 60) return 'just now';
	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) return `${diffInHours}h ago`;
	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays === 1) return 'yesterday';
	if (diffInDays < 30) return `${diffInDays}d ago`;
	const diffInMonths = Math.floor(diffInDays / 30);
	if (diffInMonths < 12) return `${diffInMonths}mo ago`;
	const diffInYears = Math.floor(diffInDays / 365);
	return `${diffInYears}y ago`;
};

export const ApiKeysTab: React.FC = () => {
	const [keys, setKeys] = useState<ApiKeyItem[]>([]);
	const [loading, setLoading] = useState(true);

	// Create Modal state
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [keyName, setKeyName] = useState('');
	const [selectedScopes, setSelectedScopes] = useState<string[]>([
		'orders:write',
		'orders:read',
		'market:read',
		'wallet:read',
	]);
	const [expiresInDays, setExpiresInDays] = useState<number | null>(90);
	const [submitting, setSubmitting] = useState(false);

	// Delete/Revoke confirmation modal state
	const [keyToDelete, setKeyToDelete] = useState<ApiKeyItem | null>(null);
	const [revoking, setRevoking] = useState(false);

	// Secret Reveal Modal state
	const [createdKey, setCreatedKey] = useState<CreateApiKeyResponse | null>(null);
	const [copiedKey, setCopiedKey] = useState(false);
	const [copiedCode, setCopiedCode] = useState(false);

	// Active code sample tab in reveal modal
	const [codeLang, setCodeLang] = useState<'javascript' | 'python' | 'curl'>('javascript');

	const backendOrigin = (() => {
		const apiUrl = import.meta.env.VITE_API_BASE_URL;
		if (apiUrl) {
			try {
				return new URL(apiUrl).origin;
			} catch {
				return apiUrl.replace(/\/api\/v1\/(capi|aapi).*/, '');
			}
		}
		return 'http://localhost:3000';
	})();

	const swaggerDocsUrl = `${backendOrigin}/docs`;

	const loadKeys = async () => {
		try {
			setLoading(true);
			const data = await fetchApiKeys();
			setKeys(data);
		} catch (err: any) {
			console.error('Failed to load API keys:', err);
			toast.error(err?.response?.data?.message || 'Failed to load API keys');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadKeys();
	}, []);

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!keyName.trim()) {
			toast.error('Please enter a name for the API key');
			return;
		}
		if (selectedScopes.length === 0) {
			toast.error('Please select at least one permission scope');
			return;
		}

		try {
			setSubmitting(true);
			const res = await createApiKey({
				name: keyName.trim(),
				scopes: selectedScopes,
				expiresInDays,
			});
			setCreatedKey(res);
			setIsCreateOpen(false);
			setKeyName('');
			loadKeys();
			toast.success('API key generated successfully');
		} catch (err: any) {
			toast.error(err?.response?.data?.message || 'Failed to create API key');
		} finally {
			setSubmitting(false);
		}
	};

	const handleConfirmRevoke = async () => {
		if (!keyToDelete) return;
		try {
			setRevoking(true);
			await revokeApiKey(keyToDelete.id);
			toast.success(`API key "${keyToDelete.name}" revoked`);
			setKeys((prev) => prev.filter((k) => k.id !== keyToDelete.id));
			setKeyToDelete(null);
		} catch (err: any) {
			toast.error(err?.response?.data?.message || 'Failed to revoke API key');
		} finally {
			setRevoking(false);
		}
	};

	const handleToggle = async (id: string, currentStatus: boolean) => {
		try {
			await updateApiKey(id, { isActive: !currentStatus });
			setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, isActive: !currentStatus } : k)));
			toast.success(`API key ${!currentStatus ? 'activated' : 'deactivated'}`);
		} catch (err: any) {
			toast.error(err?.response?.data?.message || 'Failed to update key status');
		}
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		setCopiedKey(true);
		toast.success('API key copied to clipboard');
		setTimeout(() => setCopiedKey(false), 2000);
	};

	const getSnippet = () => {
		if (!createdKey) return '';
		if (codeLang === 'javascript') {
			return `const res = await fetch("${backendOrigin}/api/v1/capi/balance", {
  headers: {
    "X-API-Key": "${createdKey.apiKey}",
  },
});
const data = await res.json();
console.log(data);`;
		}
		if (codeLang === 'python') {
			return `import requests

headers = {
    "X-API-Key": "${createdKey.apiKey}"
}

res = requests.get("${backendOrigin}/api/v1/capi/balance", headers=headers)
print(res.json())`;
		}
		return `curl -X GET "${backendOrigin}/api/v1/capi/balance" \\
  -H "X-API-Key: ${createdKey.apiKey}"`;
	};

	const copySnippet = () => {
		navigator.clipboard.writeText(getSnippet());
		setCopiedCode(true);
		toast.success('Code copied to clipboard');
		setTimeout(() => setCopiedCode(false), 2000);
	};

	return (
		<div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white">API Keys</h2>
					<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
						Manage programmatic access for external systems.
					</p>
				</div>
				<button
					onClick={() => setIsCreateOpen(true)}
					className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-sm shrink-0"
				>
					<Plus size={15} /> Generate Key
				</button>
			</div>

			<div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 flex items-center justify-between gap-4">
				<div className="flex items-start gap-3">
					<div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/10 text-black dark:text-white flex items-center justify-center shrink-0">
						<Code2 size={18} />
					</div>
					<div>
						<p className="text-sm font-semibold text-gray-900 dark:text-white">
							Interactive Swagger API Documentation
						</p>
						<p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
							Explore all available market and order endpoints directly.
						</p>
					</div>
				</div>
				<a
					href={swaggerDocsUrl}
					target="_blank"
					rel="noreferrer"
					className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-md border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shrink-0"
				>
					Open Swagger <ExternalLink size={12} />
				</a>
			</div>

			<div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-2xl divide-y divide-gray-100 dark:divide-white/5 overflow-hidden">
				{loading ? (
					<div className="p-8 text-center text-sm text-gray-500">Loading API keys...</div>
				) : keys.length === 0 ? (
					<div className="p-12 text-center">
						<div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 mx-auto flex items-center justify-center text-gray-600 dark:text-gray-300 mb-3">
							<KeyRound size={24} />
						</div>
						<h3 className="text-base font-bold text-gray-900 dark:text-white">No API keys yet</h3>
						<p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
							Create an API key to trade programmatically or connect your automated trading bots.
						</p>
						<button
							onClick={() => setIsCreateOpen(true)}
							className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
						>
							<Plus size={15} /> Generate API Key
						</button>
					</div>
				) : (
					keys.map((k, index) => (
						<div
							key={k.id}
							className={`p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
								index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'
							}`}
						>
							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-2.5">
									<div className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300">
										<KeyRound size={14} />
									</div>
									<h4 className="text-base font-semibold text-gray-900 dark:text-white truncate">
										{k.name}
									</h4>
									<span
										className={`px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wider uppercase ${
											k.isActive
												? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
												: 'bg-gray-100 dark:bg-white/5 text-gray-500 border border-gray-200 dark:border-white/10'
										}`}
									>
										{k.isActive ? 'Active' : 'Disabled'}
									</span>
								</div>

								<div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
									<span className="font-mono bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200">
										{k.keyPrefix}••••••••
									</span>
									<span className="flex items-center gap-1.5" title="Created">
										<Calendar size={13} className="text-gray-400" />
										{formatTimeAgo(k.createdAt)}
									</span>
									<span className="flex items-center gap-1.5" title="Last used">
										<Clock size={13} className="text-gray-400" />
										{k.lastUsedAt ? formatTimeAgo(k.lastUsedAt) : 'Never'}
									</span>
									{k.expiresAt && (
										<span className="flex items-center gap-1.5" title="Expires">
											<Timer size={13} className="text-gray-400" />
											{new Date(k.expiresAt).toLocaleDateString()}
										</span>
									)}
								</div>

								{/* Scope Badges */}
								<div className="flex flex-wrap gap-1.5 mt-3">
									{k.scopes.map((s) => (
										<span
											key={s}
											className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
										>
											{s}
										</span>
									))}
								</div>
							</div>

							<div className="flex items-center gap-2 self-end sm:self-center">
								<button
									onClick={() => handleToggle(k.id, k.isActive)}
									className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-gray-700 dark:text-gray-300"
								>
									{k.isActive ? 'Deactivate' : 'Activate'}
								</button>
								<button
									onClick={() => setKeyToDelete(k)}
									className="p-2 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
									title="Revoke Key"
								>
									<Trash2 size={16} />
								</button>
							</div>
						</div>
					))
				)}
			</div>

			{/* Create API Key Modal */}
			{isCreateOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
					<div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
						<div className="flex items-start justify-between">
							<div>
								<h3 className="text-base font-bold text-gray-900 dark:text-white">
									Generate API Key
								</h3>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									API keys allow external applications & bots to allow on your behalf.
								</p>
							</div>
							<button
								onClick={() => setIsCreateOpen(false)}
								className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
							>
								<X size={18} />
							</button>
						</div>

						<form onSubmit={handleCreate} className="space-y-4">
							<div>
								<label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
									Key Name
								</label>
								<input
									type="text"
									placeholder="e.g. Market Making Bot"
									value={keyName}
									onChange={(e) => setKeyName(e.target.value)}
									required
									maxLength={50}
									className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none"
								/>
							</div>

							<div>
								<label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
									Permissions & Scopes
								</label>
								<div className="space-y-2 border border-gray-200 dark:border-white/10 rounded-xl p-3 bg-gray-50/50 dark:bg-black/20">
									{AVAILABLE_SCOPES.map((scope) => {
										const checked = selectedScopes.includes(scope.id);
										return (
											<label
												key={scope.id}
												className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
											>
												<input
													type="checkbox"
													checked={checked}
													onChange={() => {
														setSelectedScopes((prev) =>
															checked ? prev.filter((s) => s !== scope.id) : [...prev, scope.id],
														);
													}}
													className="mt-0.5 rounded border-gray-300 text-black focus:ring-black"
												/>
												<div className="min-w-0 flex-1">
													<p className="text-xs font-bold text-gray-900 dark:text-white">
														{scope.label}
													</p>
													<p className="text-[11px] text-gray-500 dark:text-gray-400">
														{scope.desc}
													</p>
												</div>
											</label>
										);
									})}
								</div>
							</div>

							<div>
								<label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
									Expiration
								</label>
								<div className="relative">
									<select
										value={expiresInDays ?? 'never'}
										onChange={(e) => {
											const v = e.target.value;
											setExpiresInDays(v === 'never' ? null : Number(v));
										}}
										className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111827] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white pr-9 cursor-pointer"
									>
										<option value={30}>30 Days</option>
										<option value={60}>60 Days</option>
										<option value={90}>90 Days (Recommended)</option>
										<option value={180}>180 Days</option>
										<option value={365}>1 Year</option>
										<option value="never">Never Expire</option>
									</select>
									<ChevronDown
										size={16}
										className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
									/>
								</div>
							</div>

							<div className="flex items-center justify-end pt-3">
								<button
									type="submit"
									disabled={submitting}
									className="px-4 py-2 text-xs font-semibold bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 shadow-sm"
								>
									{submitting ? 'Generating...' : 'Generate Key'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Secret Key Reveal Modal */}
			{createdKey && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
					<div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
								<KeyRound size={20} />
							</div>
							<div>
								<h3 className="text-base font-bold text-gray-900 dark:text-white">
									API Key Generated
								</h3>
								<p className="text-xs text-gray-500 dark:text-gray-400">
									Key Name:{' '}
									<strong className="text-gray-800 dark:text-gray-200">{createdKey.name}</strong>
								</p>
							</div>
						</div>

						{/* Security Notice */}
						<div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 flex items-start gap-2.5 text-xs">
							<Lock size={15} className="shrink-0 mt-0.5 text-gray-500" />
							<div>
								<strong>Save this key now.</strong> For security reasons, we do not store the
								plaintext key and will never display it to you again.
							</div>
						</div>

						{/* Key Display & Copy */}
						<div className="space-y-1.5">
							<label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
								Your API Key
							</label>
							<div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl">
								<code className="text-xs font-mono text-gray-900 dark:text-white break-all select-all flex-1">
									{createdKey.apiKey}
								</code>
								<button
									onClick={() => copyToClipboard(createdKey.apiKey)}
									className="px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 shrink-0"
								>
									{copiedKey ? <Check size={14} /> : <Copy size={14} />}
									{copiedKey ? 'Copied' : 'Copy'}
								</button>
							</div>
						</div>

						{/* Quickstart Integration Tabs */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
									Integration Quickstart
								</label>
								<div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-0.5 rounded-lg text-xs">
									<button
										onClick={() => setCodeLang('javascript')}
										className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
											codeLang === 'javascript'
												? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-xs'
												: 'text-gray-500'
										}`}
									>
										JavaScript
									</button>
									<button
										onClick={() => setCodeLang('python')}
										className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
											codeLang === 'python'
												? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-xs'
												: 'text-gray-500'
										}`}
									>
										Python
									</button>
									<button
										onClick={() => setCodeLang('curl')}
										className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
											codeLang === 'curl'
												? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-xs'
												: 'text-gray-500'
										}`}
									>
										cURL
									</button>
								</div>
							</div>

							<div className="relative p-3 bg-neutral-900 text-neutral-100 rounded-xl text-xs font-mono overflow-x-auto group">
								<button
									onClick={copySnippet}
									className="absolute top-2 right-2 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-sans flex items-center gap-1 cursor-pointer transition-colors"
								>
									{copiedCode ? <Check size={12} /> : <Copy size={12} />}
									{copiedCode ? 'Copied' : 'Copy Code'}
								</button>
								<pre className="pr-20 pt-1">{getSnippet()}</pre>
							</div>
						</div>

						<div className="pt-2 flex justify-end">
							<button
								onClick={() => setCreatedKey(null)}
								className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
							>
								I Have Saved My Key
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Custom Revoke Key Confirmation Modal (Matches Delete Account modal) */}
			{keyToDelete && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
					<div className="bg-white dark:bg-[#111827] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5 animate-in zoom-in-95 duration-200 relative">
						<div className="p-8 flex flex-col items-center text-center">
							<img
								src={LogoutModalIcon}
								alt="Delete Key"
								className="w-20 h-20 object-contain mb-5"
							/>
							<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
								Delete API Key
							</h3>
							<p className="text-gray-500 dark:text-gray-400 text-[15px] leading-relaxed mb-8 px-2">
								Are you sure you want to delete API key{' '}
								<strong className="text-gray-900 dark:text-white font-semibold">
									"{keyToDelete.name}"
								</strong>
								? This action cannot be undone and any applications using this key will immediately
								lose access.
							</p>
							<div className="flex items-center gap-3 w-full">
								<button
									onClick={() => setKeyToDelete(null)}
									disabled={revoking}
									className="flex-1 py-3 rounded-md font-semibold text-xs border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer"
								>
									Cancel
								</button>
								<button
									onClick={handleConfirmRevoke}
									disabled={revoking}
									className="flex-1 py-3 rounded-md font-semibold text-xs bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-sm transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
								>
									{revoking ? 'Deleting...' : 'Delete Key'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
