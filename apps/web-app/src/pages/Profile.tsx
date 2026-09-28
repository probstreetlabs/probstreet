import api from '@/config/axios';
import { useEffect, useState } from 'react';
import logo from '@/assets/images/logo.avif';
import darkLogo from '@/assets/images/dark-logo.avif';
import defaultThumbnail from '@/assets/images/logo.avif';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import {
	Loader2,
	Search,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Share2,
	Copy,
	BadgeCheck,
} from 'lucide-react';
import notFoundImg from '@/assets/images/404.avif';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PublicProfile {
	id: string;
	username: string;
	bio: string | null;
	avatarUrl: string | null;
	joinedAt: string;
	kycVerificationStatus?: string;
	stats: {
		tradesCount: number;
		openPositions: number;
		netProfit: number;
	};
	positions: Array<{
		yesQuantity: number;
		noQuantity: number;
		yesInvested: number;
		noInvested: number;
		market: {
			id: string;
			title: string;
			symbol: string;
			yesPrice: number;
			noPrice: number;
			thumbnail: string | null;
			status: string;
			endTime: string;
		};
	}>;
	recentActivity?: any[];
}

const generateMockChartData = () => {
	const data = [];
	let base = 5000;
	for (let i = 0; i < 30; i++) {
		base = base + (Math.random() * 100 - 50);
		data.push({ name: `Day ${i + 1}`, value: Math.max(base, 0) });
	}
	return data;
};

export default function ProfilePage() {
	const { username } = useParams<{ username: string }>();
	const navigate = useNavigate();
	const [profile, setProfile] = useState<PublicProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);
	const [activeTab, setActiveTab] = useState<'positions' | 'activity'>('positions');
	const [searchQuery, setSearchQuery] = useState('');
	const [positionFilter, setPositionFilter] = useState('All');
	const [activityFilter, setActivityFilter] = useState('All');
	const [activityPage, setActivityPage] = useState(1);
	const itemsPerPage = 10;
	const [chartData] = useState(() => generateMockChartData());

	useEffect(() => {
		if (!username) {
			navigate('/settings');
			return;
		}

		const fetchProfile = async () => {
			try {
				const res = await api.get(`/profile/${username}`);
				if (res.data?.success) {
					setProfile(res.data.data);
				} else {
					setNotFound(true);
				}
			} catch (err: any) {
				if (err.response?.status === 404) {
					setNotFound(true);
				}
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, [username, navigate]);

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-[60vh]">
				<Loader2 className="animate-spin w-8 h-8 text-foreground" />
			</div>
		);
	}

	if (notFound || !profile) {
		return (
			<div className="flex flex-col justify-center items-center min-h-[70vh] gap-4 px-4">
				<img
					src={notFoundImg}
					alt="Not Found"
					className="w-64 h-64 md:w-80 md:h-80 object-contain opacity-90"
				/>
				<div className="text-center space-y-2">
					<p className="text-3xl font-bold text-gray-900 dark:text-white">Profile not found</p>
					<p className="text-gray-500 dark:text-gray-400 text-base max-w-sm mx-auto">
						@{username} doesn't seem to exist on Probstreet. They might have changed their username
						or deleted their account.
					</p>
				</div>
				<Link
					to="/events"
					className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
				>
					Browse Markets
				</Link>
			</div>
		);
	}

	const netProfitPositive = profile.stats.netProfit >= 0;
	const joinedDate = new Date(profile.joinedAt).toLocaleDateString('en-IN', {
		month: 'short',
		year: 'numeric',
	});

	const filteredPositions = profile.positions.filter((pos) => {
		const matchesSearch = (pos.market?.title || '')
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
		if (!matchesSearch) return false;
		if (positionFilter === 'Active') return pos.market?.status === 'OPEN';
		if (positionFilter === 'Closed') return pos.market?.status === 'CLOSED';
		return true;
	});

	return (
		<div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6 font-sans w-full">
			<div className="grid md:grid-cols-2 gap-4 md:gap-6">

				<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-6 px-4 flex flex-col justify-between min-h-50 overflow-hidden relative">
					<div className="flex flex-row items-start gap-4 flex-1 relative">
						<div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 shadow-sm mt-1">
							{profile.avatarUrl ? (
								<img
									src={profile.avatarUrl}
									alt={profile.username}
									className="w-full h-full object-cover"
								/>
							) : (
								<span className="text-2xl font-semibold text-gray-500 dark:text-gray-400">
									{profile.username?.charAt(0).toUpperCase() || '?'}
								</span>
							)}
						</div>
						<div className="flex-1 min-w-0 flex flex-col justify-center pr-16">
							<div className="text-xl md:text-2xl font-medium tracking-wide text-gray-900 dark:text-white truncate flex items-center gap-2">
								{profile.username}
								{profile.kycVerificationStatus === 'VERIFIED' && (
									<span title="Verified User" className="flex shrink-0 mb-3">
										<BadgeCheck size={15}  />
									</span>
								)}
							</div>
							<div className="flex flex-wrap items-center gap-2 mt-1">
								<div className="text-gray-700 dark:text-gray-300 text-xs font-medium tracking-wide">
									Joined {joinedDate}
								</div>
								<div className="text-gray-400 dark:text-gray-600 text-sm hidden sm:block">•</div>
								<div className="text-gray-700 dark:text-gray-300 text-xs font-medium tracking-wide">
									{profile.stats.tradesCount.toLocaleString('en-IN')} trades
								</div>
							</div>
						</div>

						<div className="absolute top-0 right-0 flex items-center gap-3 shrink-0">
							<button
								onClick={() => {
									navigator.clipboard.writeText(window.location.href);
								}}
								className="p-1.5 border cursor-pointer border-border rounded-lg text-foreground hover:bg-muted transition"
								title="Copy Link"
							>
								<Copy size={12} className="w-3.5 h-3.5 md:w-3.5 md:h-3.5" />
							</button>
							<button
								onClick={() => {
									if (navigator.share) {
										navigator.share({
											title: `${profile.username}'s Profile`,
											url: window.location.href,
										});
									} else {
										navigator.clipboard.writeText(window.location.href);
									}
								}}
								className="p-1.5 border cursor-pointer border-border rounded-lg text-foreground hover:bg-muted transition"
								title="Share Profile"
							>
								<Share2 size={12} className="w-3.5 h-3.5 md:w-3.5 md:h-3.5" />
							</button>
						</div>
					</div>

					<div className="mt-4 pt-4 flex-1">
						<div className="text-gray-700  dark:text-gray-300 md:text-sm text-sm line-clamp-3 leading-relaxed">
							{profile.bio ||
								"This user hasn't added any bio yet, but they're probably making big moves on Probstreet."}
						</div>
					</div>
				</div>

				{/* CARD 2: P&L */}
				<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-6 px-4 relative flex flex-col justify-between min-h-50 overflow-hidden">
					<div className="flex justify-between items-start mb-4">
						<div className="flex items-center gap-2 text-black dark:text-white font-medium whitespace-nowrap">
							Profit/Loss
						</div>
						<div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 font-bold text-xl">
							<img
								src={logo}
								alt="Probstreet"
								className="h-6 md:h-9 grayscale opacity-75 dark:hidden"
							/>
							<img
								src={darkLogo}
								alt="Probstreet"
								className="h-6 md:h-9 grayscale opacity-75 hidden dark:block"
							/>
						</div>
					</div>

					<div className="flex justify-between items-end mt-6 relative z-10 gap-4">
						<div className="min-w-0 w-full">
							<div className="text-2xl md:text-[33px] font-semibold tracking-tight text-gray-900 dark:text-white flex items-center gap-2 truncate">
								<span
									className={
										netProfitPositive
											? 'text-emerald-600 dark:text-emerald-500'
											: 'text-red-600 dark:text-red-500'
									}
								>
									{netProfitPositive ? '+' : ''}₹{Math.abs(profile.stats.netProfit).toFixed(2)}
								</span>
							</div>
							<div className="md:h-9 h-14"></div>
						</div>
					</div>

					<div className="absolute bottom-0 left-0 right-0 md:h-28 h-31 p-2.5 overflow-hidden rounded-b-xl opacity-30 pointer-events-none">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={chartData}>
								<defs>
									<linearGradient id="colorPv" x1="0" y1="0" x2="5" y2="1">
										<stop
											offset="5%"
											stopColor={netProfitPositive ? '#10b981' : '#ef4444'}
											stopOpacity={0.8}
										/>
										<stop
											offset="95%"
											stopColor={netProfitPositive ? '#10b981' : '#ef4444'}
											stopOpacity={0}
										/>
									</linearGradient>
								</defs>
								<Area
									type="monotone"
									dataKey="value"
									stroke={netProfitPositive ? '#10b981' : '#ef4444'}
									strokeWidth={2}
									fillOpacity={1}
									fill="url(#colorPv)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			<div className="md:pt-6 pt-1">
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6 mt-2">
					<Tabs
						value={activeTab}
						onValueChange={(val: any) => setActiveTab(val)}
						className="w-full sm:w-auto shrink-0"
					>
						<TabsList variant="line" className="w-full sm:w-auto justify-start h-10 gap-6 bg-transparent p-0">
							<TabsTrigger className="cursor-pointer text-sm md:text-base font-semibold data-[state=active]:text-black dark:data-[state=active]:text-white text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors" value="positions">
								Positions
							</TabsTrigger>
							<TabsTrigger className="cursor-pointer text-sm md:text-base font-semibold data-[state=active]:text-black dark:data-[state=active]:text-white text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors" value="activity">
								Activity
							</TabsTrigger>
						</TabsList>
					</Tabs>

					<div className="relative flex-1 sm:max-w-xl sm:ml-auto">
						<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							placeholder="Search markets..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 transition-all"
						/>
					</div>

					<div className="flex items-center gap-2 shrink-0 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
						{activeTab === 'activity' && (
							<div className="relative flex-1 sm:flex-none">
								<select
									className="w-full appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md pl-3 pr-8 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 cursor-pointer transition-colors hover:border-gray-300 dark:hover:border-gray-600"
									value={activityFilter}
									onChange={(e) => setActivityFilter(e.target.value)}
								>
									<option value="All">All Types</option>
									<option value="BUY">Buy</option>
									<option value="SELL">Sell</option>
								</select>
								<ChevronDown
									size={14}
									className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
								/>
							</div>
						)}
						{activeTab === 'positions' && (
							<div className="relative flex-1 sm:flex-none">
								<select
									value={positionFilter}
									onChange={(e) => setPositionFilter(e.target.value)}
									className="w-full appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md pl-3 pr-8 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 cursor-pointer transition-colors hover:border-gray-300 dark:hover:border-gray-600"
								>
									<option value="All">All Status</option>
									<option value="Active">Active</option>
									<option value="Closed">Closed</option>
								</select>
								<ChevronDown
									size={14}
									className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
								/>
							</div>
						)}
					</div>
				</div>

				{activeTab === 'positions' && (
					<div className="w-full overflow-x-auto scrollbar-hide pb-4">
						<div className="min-w-150 flex flex-col rounded-xl overflow-hidden border border-gray-300 dark:border-gray-800">
							<div className="grid grid-cols-[1fr_70px_70px_70px_110px_70px] gap-2 md:gap-4 px-6 py-4 border-b border-gray-300 dark:border-gray-800">
								<div className="text-xs font-semibold text-gray-500 uppercase">MARKET</div>
								<div className="text-xs font-semibold text-gray-500 uppercase">AVG</div>
								<div className="text-xs font-semibold text-gray-500 uppercase">NOW</div>
								<div className="text-xs font-semibold text-gray-500 uppercase">SHARES</div>
								<div className="text-xs font-semibold text-gray-500 uppercase">VALUE</div>
								<div className="text-xs font-semibold text-gray-500 uppercase">ACTION</div>
							</div>
							{filteredPositions.length === 0 ? (
								<div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
									<div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
										<Search size={20} className="text-gray-400" />
									</div>
									<p className="text-gray-900 dark:text-white font-semibold text-sm">
										{positionFilter === 'Active'
											? 'No active positions'
											: positionFilter === 'Closed'
												? 'No closed positions'
												: 'No positions found'}
									</p>
									<p className="text-gray-400 dark:text-gray-500 text-sm max-w-sm">
										{positionFilter === 'Active'
											? 'Open market positions will appear here.'
											: positionFilter === 'Closed'
												? 'Positions from resolved markets will appear here.'
												: 'No matching positions found.'}
									</p>
								</div>
							) : (
								<div className="divide-y divide-gray-100 dark:divide-gray-800">
									{filteredPositions
										.flatMap((pos) => {
											const rows = [];
											if (pos.yesQuantity > 0 || pos.yesInvested > 0) {
												const qty = Number(pos.yesQuantity || 0);
												const invested = Number(pos.yesInvested || 0);
												const avg = qty > 0 ? (invested / qty).toFixed(2) : '0.00';
												const currentPrice = Number(pos.market?.yesPrice || 0);
												const currentValue = qty * currentPrice;
												const pnl = currentValue - invested;
												rows.push({
													...pos,
													side: 'Yes',
													qty,
													invested,
													avgPrice: avg,
													currentPrice,
													currentValue,
													pnl,
												});
											}
											if (pos.noQuantity > 0 || pos.noInvested > 0) {
												const qty = Number(pos.noQuantity || 0);
												const invested = Number(pos.noInvested || 0);
												const avg = qty > 0 ? (invested / qty).toFixed(2) : '0.00';
												const currentPrice = Number(pos.market?.noPrice || 0);
												const currentValue = qty * currentPrice;
												const pnl = currentValue - invested;
												rows.push({
													...pos,
													side: 'No',
													qty,
													invested,
													avgPrice: avg,
													currentPrice,
													currentValue,
													pnl,
												});
											}
											return rows;
										})
										.map((row, i) => {
											const rowBg =
												i % 2 === 0
													? 'bg-white dark:bg-gray-900'
													: 'bg-gray-50 dark:bg-gray-800/50';
											return (
												<Link
													key={`${row.market.symbol}-${row.side}-${i}`}
													to={`/events/${row.market.symbol}`}
													className={`grid grid-cols-[1fr_70px_70px_70px_110px_70px] gap-2 md:gap-4 px-6 py-5 items-center border-b border-gray-400/25 transition-colors ${rowBg} hover:opacity-80`}
												>
													<div className="flex items-center gap-3">
														{row.market?.thumbnail && (
															<img
																src={row.market.thumbnail || defaultThumbnail}
																alt=""
																className="w-8 h-8 rounded-md object-cover shrink-0"
															/>
														)}
														<div className="flex flex-col">
															<h3
																className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1"
																title={row.market?.title}
															>
																{row.market?.title || 'Unknown Market'}
															</h3>
															<span
																className={`text-[10px] font-bold mt-0.5 ${row.side === 'Yes' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
															>
																{row.side}
															</span>
														</div>
													</div>

													<div className="text-sm text-gray-900 dark:text-white font-medium">
														₹{row.avgPrice}
													</div>
													<div className="text-sm text-gray-900 dark:text-white font-medium">
														₹{row.currentPrice.toFixed(2)}
													</div>
													<div className="text-sm text-gray-900 dark:text-white font-medium">
														{row.qty}
													</div>
													<div className="text-sm font-medium flex flex-col justify-center">
														<span className="font-bold text-gray-900 dark:text-white">
															₹{row.currentValue.toFixed(2)}
														</span>
														<span
															className={`text-xs font-bold ${row.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}
														>
															{row.pnl >= 0 ? '+' : '-'}₹{Math.abs(row.pnl).toFixed(2)}
														</span>
													</div>
													<div className="flex justify-end">
														<span
															className={`text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
																row.market.status === 'OPEN'
																	? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
																	: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20'
															}`}
														>
															{row.market.status}
														</span>
													</div>
												</Link>
											);
										})}
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			{activeTab === 'activity' && (
				<div className="w-full overflow-x-auto scrollbar-hide pb-4">
					<div className="min-w-150 flex flex-col rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
						{(() => {
							const historyData = profile.recentActivity || [];
							const filteredHistory = historyData
								.filter((act) =>
									act.market?.title?.toLowerCase().includes(searchQuery.toLowerCase()),
								)
								.filter((act) => activityFilter === 'All' || act.orderType === activityFilter);

							if (filteredHistory.length === 0) {
								return (
									<>
										<div className="grid grid-cols-[80px_1fr_170px_80px] gap-2 md:gap-4 px-4 md:px-6 py-4 border-b border-gray-300 dark:border-gray-800">
											<div className="text-xs font-semibold text-gray-500 uppercase">TYPE</div>
											<div className="text-xs font-semibold text-gray-500 uppercase">MARKET</div>
											<div className="text-xs font-semibold text-gray-500 uppercase">TOTAL</div>
											<div className="text-xs font-semibold text-gray-500 uppercase">TIME</div>
										</div>
										<div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
											<div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
												<Search size={20} className="text-gray-400" />
											</div>
											<p className="text-gray-900 dark:text-white font-semibold text-sm">
												No activity found
											</p>
											<p className="text-gray-400 dark:text-gray-500 text-sm max-w-sm">
												Trade history will appear here.
											</p>
										</div>
									</>
								);
							}

							const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
							const paginatedHistory = filteredHistory.slice(
								(activityPage - 1) * itemsPerPage,
								activityPage * itemsPerPage,
							);

							return (
								<>
									<div className="grid grid-cols-[80px_1fr_170px_80px] gap-2 md:gap-4 px-4 md:px-6 py-4 border-b border-gray-300 dark:border-gray-800">
										<div className="text-xs font-semibold text-gray-500 uppercase">TYPE</div>
										<div className="text-xs font-semibold text-gray-500 uppercase">MARKET</div>
										<div className="text-xs font-semibold text-gray-500 uppercase">TOTAL</div>
										<div className="text-xs font-semibold text-gray-500 uppercase">TIME</div>
									</div>
									<div className="divide-y divide-gray-100 dark:divide-gray-800">
										{paginatedHistory.map((activity, i) => (
											<div
												key={activity.id}
												className={`grid grid-cols-[80px_1fr_170px_80px] gap-2 md:gap-4 px-4 md:px-6 py-4 items-center border-b border-gray-400/25 text-xs md:text-sm transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}`}
											>
												<div className="flex items-center">
													<span
														className={`text-xs font-bold flex items-center gap-1 ${activity.orderType === 'BUY' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
													>
														{activity.orderType === 'BUY' ? '+' : '-'} {activity.orderType}
													</span>
												</div>

												<div className="flex items-center gap-3">
													{activity.market?.thumbnail && (
														<img
															src={activity.market.thumbnail}
															alt=""
															className="w-8 h-8 rounded-md object-cover shrink-0"
														/>
													)}
													<div className="flex flex-col">
														<Link
															to={`/events/${activity.market?.symbol}`}
															className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1 hover:underline cursor-pointer"
															title={activity.market?.title}
														>
															{activity.market?.title || 'Unknown Market'}
														</Link>
														<span className="text-[11px] text-gray-500 mt-0.5">
															{activity.quantity} shares • {activity.stockType}
														</span>
													</div>
												</div>

												<div className="text-sm text-gray-900 dark:text-white font-medium">
													₹{(activity.quantity * Number(activity.price || 0)).toFixed(2)}
												</div>
												<div className="text-sm text-gray-500 flex">
													{new Date(activity.createdAt).toLocaleTimeString([], {
														hour: '2-digit',
														minute: '2-digit',
													})}
												</div>
											</div>
										))}
									</div>
									{totalPages > 1 && (
										<div className="flex items-center justify-center gap-4 px-6 py-4">
											<button
												onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
												disabled={activityPage === 1}
												className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
											>
												<ChevronLeft size={16} /> Previous
											</button>
											<span className="text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md">
												Page {activityPage} of {totalPages}
											</span>
											<button
												onClick={() => setActivityPage((p) => Math.min(totalPages, p + 1))}
												disabled={activityPage === totalPages}
												className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
											>
												Next <ChevronRight size={16} />
											</button>
										</div>
									)}
								</>
							);
						})()}
					</div>
				</div>
			)}
		</div>
	);
}
