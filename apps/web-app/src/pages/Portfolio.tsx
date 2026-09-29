import { toast } from 'sonner';
import api from '@/config/axios';
import { socket } from '@/socket';
import { useAuthStore } from '@/store/auth';
import { useEffect, useState } from 'react';
import logo from '@/assets/images/logo.avif';
import { placeOrder, cancelOrder } from '@/api/order';
import darkLogo from '@/assets/images/dark-logo.avif';
import { useBalanceQuery } from '@/hooks/queries/balance';
import emptyStateIcon from '@/assets/images/LogoutModal.svg';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import {
	Loader2,
	Eye,
	EyeOff,
	Search,
	Download,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PortfolioData {
	positions: any[];
	activeOrders: any[];
	recentActivity: any[];
	walletBalance?: number;
	walletLocked?: number;
	grossWinnings?: number;
	totalInvested?: number;
	totalCurrentValue?: number;
	totalPnL?: number;
	unrealizedPnL?: number;
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

export default function Portfolio() {
	const [data, setData] = useState<PortfolioData | null>(null);
	const [loading, setLoading] = useState(true);
	const [chartData] = useState(() => generateMockChartData());
	const user = useAuthStore((state) => state.user);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const { data: balanceData, refetch: refetchBalance } = useBalanceQuery();

	const [showBalance, setShowBalance] = useState(true);
	const [activeTab, setActiveTab] = useState('positions');
	const [searchQuery, setSearchQuery] = useState('');
	const [positionsPage, setPositionsPage] = useState(1);
	const [openOrdersPage, setOpenOrdersPage] = useState(1);
	const [historyPage, setHistoryPage] = useState(1);
	const itemsPerPage = 10;
	const [positionFilter, setPositionFilter] = useState('Active');
	const [historyFilter, setHistoryFilter] = useState('All');
	const [processing, setProcessing] = useState<string | null>(null);

	const handleSell = async (row: any) => {
		try {
			setProcessing(`sell-${row.uniqueId}`);
			// Default to limit order at current price to match the current engine implementation
			// Or we could use market order if engine supports it. We'll use MARKET to dump positions quickly
			await placeOrder(
				row.side,
				row.market.symbol,
				'SELL',
				row.currentPrice,
				'LIMIT',
				row.qty,
				row.marketId,
			);
			toast.success(`Sell order placed for ${row.qty} ${row.side} shares`);
		} catch (err: any) {
			toast.error(err.response?.data?.error || 'Failed to place sell order. Please try again');
		} finally {
			setProcessing(null);
		}
	};

	const handleCancel = async (order: any) => {
		try {
			setProcessing(`cancel-${order.id}`);
			await cancelOrder(order.id, order.marketId);
			toast.success('Order cancelled successfully');
		} catch (err: any) {
			toast.error(err.response?.data?.error || 'Failed to cancel order. Please try again');
		} finally {
			setProcessing(null);
		}
	};

	const handleExportHistory = () => {
		if (!data?.recentActivity || data.recentActivity.length === 0) return;

		const filteredData = data.recentActivity
			.filter((act) => act.market?.title?.toLowerCase().includes(searchQuery.toLowerCase()))
			.filter((act) => historyFilter === 'All' || act.orderType === historyFilter);

		if (filteredData.length === 0) {
			toast.error('No activity to export for current filters');
			return;
		}

		const csvRows = [];
		csvRows.push(['Date', 'Activity', 'Market', 'Shares', 'Type', 'Price', 'Value'].join(','));

		for (const activity of filteredData) {
			const date = `"${new Date(activity.createdAt).toLocaleString()}"`;
			const type = activity.orderType;
			const market = `"${(activity.market?.title || '').replace(/"/g, '""')}"`;
			const shares = activity.quantity;
			const stockType = activity.stockType;
			const price = Number(activity.price).toFixed(2);
			const value = (activity.quantity * Number(activity.price)).toFixed(2);

			csvRows.push([date, type, market, shares, stockType, price, value].join(','));
		}

		const csvString = csvRows.join('\n');
		const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);

		link.setAttribute('href', url);
		link.setAttribute('download', 'portfolio_history.csv');
		link.style.visibility = 'hidden';

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const walletBalance = Number(data?.walletBalance || balanceData?.data?.data?.amount || 0);
	const walletLocked = Number(data?.walletLocked || balanceData?.data?.data?.locked || 0);
	const totalCurrentValue = Number(data?.totalCurrentValue || 0);
	const portfolioValue = walletBalance + walletLocked + totalCurrentValue;
	const totalPnL = Number(data?.totalPnL ?? 0);
	const unrealizedPnL = Number(data?.unrealizedPnL || 0);
	const pnlColor = totalPnL > 0 ? '#10b981' : totalPnL < 0 ? '#ef4444' : '#6b7280';
	const [ordersLoaded, setOrdersLoaded] = useState(false);
	const [historyLoaded, setHistoryLoaded] = useState(false);

	useEffect(() => {
		const fetchInitial = async () => {
			try {
				const [summaryRes, positionsRes] = await Promise.all([
					api.get(`/portfolio/summary`),
					api.get(`/portfolio/positions`),
				]);

				if (summaryRes.data.success && positionsRes.data.success) {
					setData((prev) => ({
						...(prev ?? { positions: [], activeOrders: [], recentActivity: [] }),
						positions: positionsRes.data.data || [],
						walletBalance: summaryRes.data.data.walletBalance || 0,
						walletLocked: summaryRes.data.data.walletLocked || 0,
						grossWinnings: summaryRes.data.data.grossWinnings || 0,
						totalInvested: summaryRes.data.data.totalInvested || 0,
						totalCurrentValue: summaryRes.data.data.totalCurrentValue || 0,
						totalPnL: summaryRes.data.data.totalPnL ?? 0,
						unrealizedPnL: summaryRes.data.data.unrealizedPnL || 0,
					}));
				}
			} catch (err) {
				console.error('Failed to fetch portfolio', err);
			} finally {
				setLoading(false);
			}
		};

		if (isAuthenticated) fetchInitial();

		if (isAuthenticated && user?.id) {
			const onConnect = () => {
				socket.emit('SUBSCRIBE_USER', user.id);
			};

			if (socket.connected) {
				onConnect();
			} else {
				socket.connect();
			}

			socket.on('connect', onConnect);

			const handlePortfolioUpdate = async () => {
				try {
					const [summaryRes, positionsRes] = await Promise.all([
						api.get(`/portfolio/summary`),
						api.get(`/portfolio/positions`),
					]);
					if (summaryRes.data.success && positionsRes.data.success) {
						setData((prev) => ({
							...(prev ?? { positions: [], activeOrders: [], recentActivity: [] }),
							positions: positionsRes.data.data || [],
							walletBalance: summaryRes.data.data.walletBalance || 0,
							walletLocked: summaryRes.data.data.walletLocked || 0,
							grossWinnings: summaryRes.data.data.grossWinnings || 0,
							totalInvested: summaryRes.data.data.totalInvested || 0,
							totalCurrentValue: summaryRes.data.data.totalCurrentValue || 0,
							totalPnL: summaryRes.data.data.totalPnL ?? 0,
							unrealizedPnL: summaryRes.data.data.unrealizedPnL || 0,
						}));
					}
				} catch {}
				refetchBalance();
			};

			const handleMessage = (msgData: any) => {
				if (msgData?.type === 'PORTFOLIO_UPDATE') {
					handlePortfolioUpdate();
				}
			};

			socket.on('PORTFOLIO_UPDATE', handlePortfolioUpdate);
			socket.on('MESSAGE', handleMessage);

			return () => {
				socket.emit('UNSUBSCRIBE_USER', user.id);
				socket.off('PORTFOLIO_UPDATE', handlePortfolioUpdate);
				socket.off('MESSAGE', handleMessage);
				socket.off('connect', onConnect);
			};
		}
	}, [isAuthenticated, user?.id, refetchBalance]);

	useEffect(() => {
		if (activeTab === 'open' && !ordersLoaded && isAuthenticated) {
			api
				.get(`/portfolio/orders?ordersPage=1`)
				.then((res) => {
					if (res.data.success) {
						setData((prev) => (prev ? { ...prev, activeOrders: res.data.data || [] } : prev));
						setOrdersLoaded(true);
					}
				})
				.catch(() => {});
		}
		if (activeTab === 'history' && !historyLoaded && isAuthenticated) {
			api
				.get(`/portfolio/history?historyPage=1`)
				.then((res) => {
					if (res.data.success) {
						setData((prev) => (prev ? { ...prev, recentActivity: res.data.data || [] } : prev));
						setHistoryLoaded(true);
					}
				})
				.catch(() => {});
		}
	}, [activeTab, ordersLoaded, historyLoaded, isAuthenticated]);

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-[60vh]">
				<Loader2 className="animate-spin w-8 h-8 text-black dark:text-white" />
			</div>
		);
	}

	return (
		<div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6 font-sans w-full">
			<div className="grid md:grid-cols-2 gap-4 md:gap-6">
				<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col justify-between min-h-50">
					<div className="flex justify-between items-start">
						<div className="flex items-center gap-2 text-black dark:text-white font-medium">
							Portfolio
						</div>
						<div className="text-right">
							<div className="text-sm font-medium text-gray-500 dark:text-gray-400">
								Unrealized P&L
							</div>
							<div
								className={`text-base font-bold ${unrealizedPnL > 0 ? 'text-emerald-600 dark:text-emerald-500' : unrealizedPnL < 0 ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'}`}
							>
								{unrealizedPnL > 0 ? '+' : ''}₹{Math.abs(unrealizedPnL).toFixed(2)}
							</div>
						</div>
					</div>

					<div className="mt-8">
						<div className="text-3xl md:text-[33px] font-semibold tracking-tight text-gray-900 dark:text-white flex items-center gap-3 flex-wrap break-all">
							{showBalance ? `₹${portfolioValue.toFixed(2)}` : '*****'}
						</div>
						<div className="text-gray-500 dark:text-gray-400 font-medium mt-1.5 flex items-center gap-2">
							<button
								onClick={() => setShowBalance(!showBalance)}
								className="flex items-center gap-1.5 text-sm hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer"
							>
								{showBalance ? (
									<>
										<EyeOff size={16} />
										<span>Hide balance</span>
									</>
								) : (
									<>
										<Eye size={16} />
										<span>Unhide balance</span>
									</>
								)}
							</button>
						</div>
					</div>
				</div>

				<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 relative flex flex-col justify-between min-h-50">
					<div className="flex justify-between items-start mb-4">
						<div className="flex items-center gap-2 text-black dark:text-white font-medium whitespace-nowrap">
							<div
								className={`w-2 h-2 rounded-full animate-pulse ${totalPnL > 0 ? 'bg-emerald-500' : totalPnL < 0 ? 'bg-red-500' : 'bg-gray-400 dark:bg-gray-500'}`}
							></div>
							Profit/Loss
						</div>
						<div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 font-bold text-xl">
							<img src={logo} alt="Probstreet" className="h-6 md:h-9 dark:hidden" />
							<img src={darkLogo} alt="Probstreet" className="h-6 md:h-9 hidden dark:block" />
						</div>
					</div>

					<div className="flex justify-between items-end mt-6 relative z-10 gap-4">
						<div className="min-w-0">
							<div className="text-2xl md:mb-11 mb-12 md:text-[33px] font-semibold tracking-tight text-gray-900 dark:text-white flex items-center gap-2 truncate">
								<span
									className={
										totalPnL > 0
											? 'text-emerald-600 dark:text-emerald-500'
											: totalPnL < 0
												? 'text-red-600 dark:text-red-500'
												: 'text-gray-900 dark:text-white'
									}
								>
									{totalPnL > 0 ? '+' : ''}₹{Math.abs(totalPnL).toFixed(2)}
								</span>
							</div>
						</div>
					</div>

					<div className="absolute bottom-0 left-0 right-0 h-28 overflow-hidden rounded-b-xl opacity-30 pointer-events-none">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={chartData}>
								<defs>
									<linearGradient id="colorPvPortfolio" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor={pnlColor} stopOpacity={0.8} />
										<stop offset="95%" stopColor={pnlColor} stopOpacity={0} />
									</linearGradient>
								</defs>
								<Area
									type="monotone"
									dataKey="value"
									stroke={pnlColor}
									strokeWidth={2}
									fillOpacity={1}
									fill="url(#colorPvPortfolio)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			<div className="md:pt-6 pt-3">
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6 mt-2">
					<Tabs
						value={activeTab}
						onValueChange={(val: any) => setActiveTab(val)}
						className="w-full sm:w-auto shrink-0"
					>
						<TabsList
							variant="line"
							className="w-full sm:w-auto justify-start h-10 gap-5 bg-transparent p-0"
						>
							<TabsTrigger
								className="cursor-pointer text-sm md:text-base font-semibold data-[state=active]:text-black dark:data-[state=active]:text-white text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
								value="positions"
							>
								Positions
							</TabsTrigger>
							<TabsTrigger
								className="cursor-pointer text-sm md:text-base font-semibold data-[state=active]:text-black dark:data-[state=active]:text-white text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
								value="open"
							>
								Open Orders
							</TabsTrigger>
							<TabsTrigger
								className="cursor-pointer text-sm md:text-base font-semibold data-[state=active]:text-black dark:data-[state=active]:text-white text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
								value="history"
							>
								History
							</TabsTrigger>
						</TabsList>
					</Tabs>

					<div className="relative flex-1 min-w-50">
						<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							placeholder="Search markets..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full bg-[#F4F5F6] border dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-md pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-700 shadow-sm transition-all placeholder:text-gray-500"
						/>
					</div>

					<div className="flex items-center gap-2 shrink-0 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
						{activeTab === 'history' && (
							<div className="relative flex-1 sm:flex-none">
								<select
									className="w-full appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md pl-3 pr-8 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 cursor-pointer transition-colors hover:border-gray-300 dark:hover:border-gray-600"
									value={historyFilter}
									onChange={(e) => setHistoryFilter(e.target.value)}
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
						{activeTab === 'open' && (
							<div className="relative flex-1 sm:flex-none">
								<select className="w-full appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md pl-3 pr-8 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 cursor-pointer transition-colors hover:border-gray-300 dark:hover:border-gray-600">
									<option>Order Date</option>
									<option>Amount</option>
								</select>
								<ChevronDown
									size={14}
									className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
								/>
							</div>
						)}
						{activeTab === 'history' && (
							<button
								onClick={handleExportHistory}
								className="flex items-center justify-center gap-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shrink-0 shadow-sm"
							>
								<Download size={16} /> Export
							</button>
						)}
					</div>
				</div>

				{/* --- POSITIONS TAB --- */}
				{activeTab === 'positions' &&
					(() => {
						const filteredRows = (data?.positions || [])
							.map((pos) => {
								const market = pos.market;
								const qty = Number(pos.yesQuantity > 0 ? pos.yesQuantity : pos.noQuantity) || 0;
								const side = pos.yesQuantity > 0 ? 'YES' : 'NO';
								const invested =
									Number(pos.yesQuantity > 0 ? pos.yesInvested : pos.noInvested) || 0;
								const avg = qty > 0 ? invested / qty : 0;

								const isClosed = market?.status === 'CLOSED';
								const sellValue =
									side === 'YES' ? Number(pos.yesSellValue || 0) : Number(pos.noSellValue || 0);
								const livePrice =
									side === 'YES' ? Number(market?.yesPrice || 0) : Number(market?.noPrice || 0);

								const currentPrice = isClosed ? (qty > 0 ? sellValue / qty : 0) : livePrice;
								const currentValue = isClosed ? sellValue : qty * livePrice;
								const pnl = currentValue - invested;

								return {
									...pos,
									side,
									qty,
									invested,
									avgPrice: avg,
									currentPrice,
									currentValue,
									pnl,
								};
							})
							.filter((row) => {
								const matchesSearch = (row.market?.title || '')
									.toLowerCase()
									.includes(searchQuery.toLowerCase());
								if (!matchesSearch) return false;
								if (positionFilter === 'Active') return row.market?.status === 'OPEN';
								if (positionFilter === 'Closed') return row.market?.status === 'CLOSED';
								return true;
							});

						const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
						const paginatedRows = filteredRows.slice(
							(positionsPage - 1) * itemsPerPage,
							positionsPage * itemsPerPage,
						);

						return (
							<div className="w-full flex flex-col">
								<div className="w-full overflow-x-auto scrollbar-hide">
									<div className="min-w-150 flex flex-col rounded-t-xl overflow-hidden border border-gray-200 dark:border-gray-800">
										<div className="grid grid-cols-[1fr_70px_70px_70px_110px_70px] gap-2 md:gap-4 px-6 py-4 border-b border-gray-400/25 bg-gray-50 dark:bg-gray-800/50">
											<div className="text-xs font-semibold text-gray-500 uppercase">MARKET</div>
											<div className="text-xs font-semibold text-gray-500 uppercase">AVG</div>
											<div className="text-xs font-semibold text-gray-500 uppercase">NOW</div>
											<div className="text-xs font-semibold text-gray-500 uppercase">SHARES</div>
											<div className="text-xs font-semibold text-gray-500 uppercase">VALUE</div>
											<div className="text-xs font-semibold text-gray-500 uppercase">ACTION</div>
										</div>

										{filteredRows.length === 0 ? (
											<div className="py-20 flex flex-col items-center justify-center gap-3 text-center bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
												<img
													src={emptyStateIcon}
													alt="Empty"
													className="w-20 h-20 object-contain mb-2"
												/>
												<p className="text-gray-900 dark:text-white font-semibold text-sm">
													{positionFilter === 'Active'
														? 'No active positions'
														: positionFilter === 'Closed'
															? 'No closed positions'
															: 'No positions found'}
												</p>
											</div>
										) : (
											<div className="divide-y divide-gray-100 dark:divide-gray-800">
												{paginatedRows.map((row, i) => (
													<div
														key={row.uniqueId || i}
														className={`grid grid-cols-[1fr_70px_70px_70px_110px_70px] gap-2 md:gap-4 px-6 py-4 items-center transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}`}
													>
														{/* Market */}
														<Link
															to={`/market/${row.market?.symbol}`}
															className="flex items-center gap-3 min-w-0 group"
														>
															<div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-800 shrink-0 overflow-hidden hidden md:block">
																{row.market?.thumbnail && (
																	<img
																		src={row.market.thumbnail}
																		alt={row.market.title}
																		className="w-full h-full object-cover"
																	/>
																)}
															</div>
															<div className="flex flex-col min-w-0">
																<span className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 wrap-break-word group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
																	{row.market?.title}
																</span>
																<span className={`text-[11px] font-bold mt-0.5`}>{row.side}</span>
															</div>
														</Link>

														{/* Avg */}
														<div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">
															₹{row.avgPrice.toFixed(2)}
														</div>

														{/* Now */}
														<div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">
															₹{row.currentPrice.toFixed(2)}
														</div>

														{/* Shares */}
														<div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">
															{row.qty}
														</div>

														{/* Value */}
														<div className="flex flex-col">
															<span className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
																₹{row.currentValue.toFixed(2)}
															</span>
															<span
																className={`text-[10px] md:text-xs font-bold ${row.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}
															>
																{row.pnl >= 0 ? '+' : '-'}₹{Math.abs(row.pnl).toFixed(2)}
															</span>
														</div>

														<div className="flex">
															{row.market?.status === 'CLOSED' ? (
																<span
																	className={`text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
																		(row.market?.result || '').toUpperCase() ===
																		row.side.toUpperCase()
																			? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
																			: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
																	}`}
																>
																	{(row.market?.result || '').toUpperCase() ===
																	row.side.toUpperCase()
																		? 'Won'
																		: 'Lost'}
																</span>
															) : (
																<button
																	onClick={() => handleSell(row)}
																	disabled={processing === `sell-${row.uniqueId}`}
																	className="text-xs bg-gray-900 text-white dark:bg-white dark:text-black rounded-md px-4 py-1.5 font-bold hover:opacity-80 transition-opacity cursor-pointer shadow-sm disabled:opacity-50"
																>
																	{processing === `sell-${row.uniqueId}` ? 'Selling...' : 'Sell'}
																</button>
															)}
														</div>
													</div>
												))}
											</div>
										)}
									</div>
								</div>

								{/* Pagination Footer */}
								<div
									className={`w-full flex items-center justify-center gap-4 px-6 py-4 border border-t-0 border-gray-200 dark:border-gray-800 rounded-b-xl ${totalPages <= 1 ? 'hidden' : 'bg-white dark:bg-gray-900'}`}
								>
									<button
										onClick={() => setPositionsPage((p) => Math.max(1, p - 1))}
										disabled={positionsPage === 1}
										className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<ChevronLeft size={16} /> Previous
									</button>
									<span className="text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md">
										Page {positionsPage}
									</span>
									<button
										onClick={() => setPositionsPage((p) => Math.min(totalPages, p + 1))}
										disabled={positionsPage === totalPages}
										className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Next <ChevronRight size={16} />
									</button>
								</div>
							</div>
						);
					})()}

				{/* --- OPEN ORDERS TAB --- */}
				{activeTab === 'open' &&
					(() => {
						const filteredOpenOrders = (data?.activeOrders || []).filter((order) =>
							order.market?.title?.toLowerCase().includes(searchQuery.toLowerCase()),
						);
						const totalPages = Math.ceil(filteredOpenOrders.length / itemsPerPage);
						const paginatedOrders = filteredOpenOrders.slice(
							(openOrdersPage - 1) * itemsPerPage,
							openOrdersPage * itemsPerPage,
						);

						return (
							<div className="w-full flex flex-col">
								<div className="w-full overflow-x-auto scrollbar-hide">
									<div className="min-w-150 flex flex-col rounded-t-xl overflow-hidden border border-gray-200 dark:border-gray-800">
										<div className="grid grid-cols-[1fr_100px_100px_130px_70px] gap-2 md:gap-4 px-4 md:px-6 py-4 border-b border-gray-400/25 bg-gray-50 dark:bg-gray-800/50">
											<div className="text-xs font-semibold text-gray-500 uppercase">MARKET</div>
											<div className="text-xs font-semibold text-gray-500 uppercase">FILLED</div>
											<div className="text-xs font-semibold text-gray-500 uppercase">TOTAL</div>
											<div className="text-xs font-semibold text-gray-500 uppercase">
												EXPIRATION
											</div>
											<div className="text-xs font-semibold text-gray-500 uppercase">ACTION</div>
										</div>

										{filteredOpenOrders.length === 0 ? (
											<div className="py-20 flex flex-col items-center justify-center gap-3 text-center bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
												<img
													src={emptyStateIcon}
													alt="Empty"
													className="w-20 h-20 object-contain mb-2"
												/>
												<p className="text-gray-900 dark:text-white font-semibold text-sm">
													No open orders
												</p>
											</div>
										) : (
											<div className="divide-y divide-gray-100 dark:divide-gray-800">
												{paginatedOrders.map((order, i) => (
													<div
														key={order.id}
														className={`grid grid-cols-[1fr_100px_100px_130px_70px] gap-2 md:gap-4 px-4 md:px-6 py-4 items-center transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}`}
													>
														{/* Market */}
														<div className="flex items-center gap-3 min-w-0">
															<div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-800 shrink-0 overflow-hidden hidden md:block">
																{order.market?.thumbnail && (
																	<img
																		src={order.market.thumbnail}
																		alt={order.market.title}
																		className="w-full h-full object-cover"
																	/>
																)}
															</div>
															<div className="flex flex-col min-w-0">
																<span className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 wrap-break-word">
																	{order.market?.title}
																</span>
																<div className="flex items-center mt-0.5">
																	<span className={`text-[10px] mr-1 md:text-xs font-bold`}>
																		{order.stockType}
																	</span>
																	<span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
																		@ ₹{Number(order.price).toFixed(2)}
																	</span>
																</div>
															</div>
														</div>
														<div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">
															{order.filledQuantity || 0}
														</div>
														<div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">
															{order.quantity}
														</div>
														<div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">
															Never
														</div>
														<div className="flex">
															<button
																onClick={() => handleCancel(order)}
																disabled={processing === `cancel-${order.id}`}
																className="text-xs text-red-500 hover:text-red-600 font-bold px-2 py-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors disabled:opacity-50 cursor-pointer"
															>
																{processing === `cancel-${order.id}` ? 'Canceling' : 'Cancel'}
															</button>
														</div>
													</div>
												))}
											</div>
										)}
									</div>
								</div>

								<div
									className={`w-full flex items-center justify-center gap-4 px-6 py-4 border border-t-0 border-gray-200 dark:border-gray-800 rounded-b-xl ${totalPages <= 1 ? 'hidden' : 'bg-white dark:bg-gray-900'}`}
								>
									<button
										onClick={() => setOpenOrdersPage((p) => Math.max(1, p - 1))}
										disabled={openOrdersPage === 1}
										className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<ChevronLeft size={16} /> Previous
									</button>
									<span className="text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md">
										Page {openOrdersPage}
									</span>
									<button
										onClick={() => setOpenOrdersPage((p) => Math.min(totalPages, p + 1))}
										disabled={openOrdersPage === totalPages}
										className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Next <ChevronRight size={16} />
									</button>
								</div>
							</div>
						);
					})()}

				{/* --- HISTORY TAB --- */}
				{activeTab === 'history' &&
					(() => {
						const filteredHistory = (data?.recentActivity || [])
							.filter((act) => act.market?.title?.toLowerCase().includes(searchQuery.toLowerCase()))
							.filter((act) => historyFilter === 'All' || act.orderType === historyFilter);

						const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
						const paginatedHistory = filteredHistory.slice(
							(historyPage - 1) * itemsPerPage,
							historyPage * itemsPerPage,
						);

						return (
							<div className="w-full flex flex-col">
								<div className="w-full overflow-x-auto scrollbar-hide">
									<div className="min-w-150 flex flex-col rounded-t-xl overflow-hidden border border-gray-200 dark:border-gray-800">
										<div className="grid grid-cols-[80px_1fr_170px_80px] gap-2 md:gap-4 px-4 md:px-6 py-4 border-b border-gray-400/25 bg-gray-50 dark:bg-gray-800/50">
											<div className="text-xs font-semibold text-gray-500 uppercase">ACTIVITY</div>
											<div className="text-xs font-semibold text-gray-500 uppercase">MARKET</div>
											<div className="text-xs font-semibold text-gray-500 uppercase">VALUE</div>
											<div className="text-xs font-semibold text-gray-500 uppercase">TIME</div>
										</div>

										{filteredHistory.length === 0 ? (
											<div className="py-20 flex flex-col items-center justify-center gap-3 text-center bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
												<img
													src={emptyStateIcon}
													alt="Empty"
													className="w-20 h-20 object-contain mb-2"
												/>
												<p className="text-gray-900 dark:text-white font-semibold text-sm">
													No history found
												</p>
											</div>
										) : (
											<div className="divide-y divide-gray-100 dark:divide-gray-800">
												{paginatedHistory.map((activity, i) => (
													<div
														key={activity.id}
														className={`grid grid-cols-[80px_1fr_170px_80px] gap-2 md:gap-4 px-4 md:px-6 py-4 items-center transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}`}
													>
														<div className="flex items-center">
															<span
																className={`text-xs font-bold flex items-center gap-1 ${activity.orderType === 'BUY' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
															>
																{activity.orderType}
															</span>
														</div>
														<Link
															to={`/market/${activity.market?.symbol}`}
															className="flex items-center gap-3 min-w-0 group"
														>
															<div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-800 shrink-0 overflow-hidden hidden md:block">
																{activity.market?.thumbnail && (
																	<img
																		src={activity.market.thumbnail}
																		alt={activity.market.title}
																		className="w-full h-full object-cover"
																	/>
																)}
															</div>
															<div className="flex flex-col min-w-0">
																<span className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 wrap-break-word group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
																	{activity.market?.title}
																</span>
																<div className="flex items-start mt-0.5">
																	<span
																		className={`text-[10px] md:text-xs font-bold ${activity.type === 'YES' ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}
																	>
																		{activity.type}
																	</span>
																	<span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
																		{activity.quantity} shares @ ₹
																		{Number(activity.price).toFixed(2)}
																	</span>
																</div>
															</div>
														</Link>
														<div className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
															₹{(activity.quantity * Number(activity.price)).toFixed(2)}
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
										)}
									</div>
								</div>

								<div
									className={`w-full flex items-center justify-center gap-4 px-6 py-4 border border-t-0 border-gray-200 dark:border-gray-800 rounded-b-xl ${totalPages <= 1 ? 'hidden' : 'bg-white dark:bg-gray-900'}`}
								>
									<button
										onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
										disabled={historyPage === 1}
										className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<ChevronLeft size={16} /> Previous
									</button>
									<span className="text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md">
										Page {historyPage}
									</span>
									<button
										onClick={() => setHistoryPage((p) => Math.min(totalPages, p + 1))}
										disabled={historyPage === totalPages}
										className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Next <ChevronRight size={16} />
									</button>
								</div>
							</div>
						);
					})()}
			</div>
		</div>
	);
}
