import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatAmount } from '@/lib/format';
import { useAuthStore } from '@/store/auth';
import { useLeaderboardQuery } from '@/hooks/queries/leaderboard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Award, User as UserIcon, ChevronDown } from 'lucide-react';

export default function LeaderboardPage() {
	const [timeframe, setTimeframe] = useState<'all_time' | 'monthly' | 'weekly' | 'today'>(
		'all_time',
	);
	const [isMobileSelectOpen, setIsMobileSelectOpen] = useState(false);
	const { data, isLoading } = useLeaderboardQuery(timeframe);
	const currentUser = useAuthStore((state) => state.user);

	const rawLeaderboard = data?.data?.leaderboard || [];

	const leaderboard = rawLeaderboard.filter((item) => item.profit > 0);

	const timeframeLabels: Record<string, string> = {
		today: 'Today',
		weekly: 'Weekly',
		monthly: 'Monthly',
		all_time: 'Overall',
	};

	return (
		<div className="w-full min-h-screen bg-[#f4f4f5] dark:bg-[#090C1A] flex justify-center md:pt-10 pt-8 pb-6 md:pb-8 transition-colors">
			<div className="w-full md:max-w-5xl px-6 md:px-6 flex flex-col gap-4">
				<div className="flex items-start justify-between mb-1 md:mb-5">
					<h1 className="md:text-2xl text-xl font-medium text-gray-900 dark:text-white tracking-tight">
						Leaderboard
					</h1>

					<div className="relative md:hidden">
						<button
							onClick={() => setIsMobileSelectOpen(!isMobileSelectOpen)}
							className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-[#161B26] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white flex items-center gap-1.5 cursor-pointer"
						>
							<span>{timeframeLabels[timeframe]}</span>
							<ChevronDown size={14} className="text-gray-500 dark:text-gray-400" />
						</button>

						{isMobileSelectOpen && (
							<div
								onMouseLeave={() => setIsMobileSelectOpen(false)}
								className="absolute right-0 top-9 w-32 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-xl py-1 z-50 overflow-hidden"
							>
								{(['today', 'weekly', 'monthly', 'all_time'] as const).map((tf) => (
									<button
										key={tf}
										onClick={() => {
											setTimeframe(tf);
											setIsMobileSelectOpen(false);
										}}
										className={`w-full text-left px-3 py-2 text-xs font-medium transition ${
											timeframe === tf
												? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold'
												: 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
										}`}
									>
										{timeframeLabels[tf]}
									</button>
								))}
							</div>
						)}
					</div>

					<div className="hidden md:inline-flex mb-2 w-70">
						<Tabs
							value={timeframe}
							onValueChange={(val: any) => setTimeframe(val)}
							className="w-full"
						>
							<TabsList variant="line" className="w-full justify-between">
								<TabsTrigger className="cursor-pointer" value="today">
									Today
								</TabsTrigger>
								<TabsTrigger className="cursor-pointer" value="weekly">
									Weekly
								</TabsTrigger>
								<TabsTrigger className="cursor-pointer" value="monthly">
									Monthly
								</TabsTrigger>
								<TabsTrigger className="cursor-pointer" value="all_time">
									Overall
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>
				</div>

				<div className="w-full">
					<div className="px-2 md:px-3 py-2.5 grid grid-cols-12 md:text-xs text-[10px] font-semibold text-black dark:text-white border-b border-gray-300 dark:border-white/10 uppercase tracking-wider">
						<div className="col-span-6 md:col-span-6 flex items-center gap-3 md:gap-4">
							<span className="w-5 md:w-6 text-center">#</span>
							<span>Trader</span>
						</div>
						<div className="col-span-3 md:col-span-3 text-right">Profit</div>
						<div className="col-span-3 md:col-span-3 text-right md:mr-8">Volume</div>
					</div>

					{isLoading ? (
						<div className="w-full divide-y divide-gray-200/80 dark:divide-white/5">
							{Array.from({ length: 10 }).map((_, i) => {
								const rankNum = i + 1;
								return (
									<div
										key={i}
										className="px-2 md:px-3 py-3 grid grid-cols-12 items-center animate-pulse"
									>
										<div className="col-span-6 md:col-span-6 flex items-center gap-3 md:gap-4">
											<div className="w-5 md:w-7 flex items-center justify-center shrink-0">
												{rankNum === 1 ? (
													<div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-linear-to-br from-yellow-300 via-amber-500 to-yellow-600 shadow-[0_0_10px_rgba(245,158,11,0.5)] flex items-center justify-center border border-yellow-200/50">
														<Crown size={14} className="text-white drop-shadow-md" />
													</div>
												) : rankNum === 2 ? (
													<div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-linear-to-br from-slate-200 via-slate-400 to-slate-500 shadow-[0_0_10px_rgba(148,163,184,0.4)] flex items-center justify-center border border-slate-100/50">
														<Award size={14} className="text-white drop-shadow-md" />
													</div>
												) : rankNum === 3 ? (
													<div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-linear-to-br from-orange-300 via-amber-700 to-orange-800 shadow-[0_0_10px_rgba(180,83,9,0.4)] flex items-center justify-center border border-orange-200/40">
														<Award size={14} className="text-white drop-shadow-md" />
													</div>
												) : (
													<span className="text-xs font-medium text-gray-500 dark:text-gray-400">
														{rankNum}
													</span>
												)}
											</div>
											<div className="w-6 h-6 md:w-9 md:h-9 rounded-full bg-gray-300 dark:bg-gray-700 shrink-0"></div>
											<div className="h-3 md:h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 md:w-28"></div>
										</div>
										<div className="col-span-3 md:col-span-3 flex justify-end">
											<div className="h-3 md:h-4 bg-gray-300 dark:bg-gray-700 rounded w-16 md:w-20"></div>
										</div>
										<div className="col-span-3 md:col-span-3 flex justify-end md:mr-8">
											<div className="h-3 md:h-4 bg-gray-300 dark:bg-gray-700 rounded w-16 md:w-20"></div>
										</div>
									</div>
								);
							})}
						</div>
					) : leaderboard.length === 0 ? (
						<div className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
							No profit-making leaderboard entries for this timeframe yet.
						</div>
					) : (
						<div className="divide-y divide-gray-200/80 dark:divide-white/5">
							{leaderboard.map((item, idx) => {
								const rankNum = idx + 1;
								const isMe = currentUser && currentUser.id === item.userId;
								const displayName = isMe ? 'You' : item.name;

								return (
									<Link
										to={`/profile/${item.username}`}
										key={item.userId}
										className={`px-2 md:px-3 py-3 grid grid-cols-12 items-center transition-colors ${
											isMe
												? 'bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20'
												: idx % 2 === 0
													? 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
													: 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50'
										}`}
									>
										<div className="col-span-6 md:col-span-6 flex items-center gap-3 md:gap-4 overflow-hidden">
											<div className="w-5 md:w-7 flex items-center justify-center shrink-0">
												{rankNum === 1 ? (
													<div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-linear-to-br from-yellow-300 via-amber-500 to-yellow-600 shadow-[0_0_10px_rgba(245,158,11,0.5)] flex items-center justify-center border border-yellow-200/50">
														<Crown size={14} className="text-white drop-shadow-md" />
													</div>
												) : rankNum === 2 ? (
													<div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-linear-to-br from-slate-200 via-slate-400 to-slate-500 shadow-[0_0_10px_rgba(148,163,184,0.4)] flex items-center justify-center border border-slate-100/50">
														<Award size={14} className="text-white drop-shadow-md" />
													</div>
												) : rankNum === 3 ? (
													<div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-linear-to-br from-orange-300 via-amber-700 to-orange-800 shadow-[0_0_10px_rgba(180,83,9,0.4)] flex items-center justify-center border border-orange-200/40">
														<Award size={14} className="text-white drop-shadow-md" />
													</div>
												) : (
													<span className="text-xs font-medium text-gray-500 dark:text-gray-400">
														{rankNum}
													</span>
												)}
											</div>

											<div className="w-6 h-6 md:w-9 md:h-9 rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs md:text-sm shadow-sm overflow-hidden shrink-0">
												{item.avatar ? (
													<img
														src={item.avatar}
														alt={displayName}
														className="w-full h-full object-cover"
													/>
												) : (
													displayName.charAt(0).toUpperCase() || <UserIcon size={14} />
												)}
											</div>

											<div className="truncate">
												<span
													className={`text-[10px] md:text-sm font-semibold truncate block ${
														isMe
															? 'text-blue-600 dark:text-blue-400 font-bold'
															: 'text-gray-900 dark:text-white'
													}`}
												>
													{displayName}
												</span>
											</div>
										</div>

										<div className="col-span-3 md:col-span-3 text-right">
											<span className="text-[10px] md:text-sm font-medium text-black dark:text-white tracking-tight md:tracking-normal">
												+₹{formatAmount(item.profit)}
											</span>
										</div>

										<div className="col-span-3 md:col-span-3 text-right md:mr-8">
											<span className="text-[10px] md:text-sm font-medium text-black dark:text-white tracking-tight md:tracking-normal">
												₹{formatAmount(item.volume || 0)}
											</span>
										</div>
									</Link>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
