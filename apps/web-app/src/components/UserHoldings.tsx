import { toast } from 'sonner';
import { api } from '@/lib/axios';
import { socket } from '@/socket';
import { cancelOrder } from '@/api/order';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { ArrowUpRight, ArrowDownRight, Package, Loader2, X } from 'lucide-react';

interface Position {
	yesQuantity: number;
	noQuantity: number;
	yesInvested: number;
	noInvested: number;
	yesLocked: number;
	noLocked: number;
	yesSellValue: number;
	noSellValue: number;
}

interface ActiveOrder {
	id: string;
	stockType: string;
	orderType: string;
	price: number;
	quantity: number;
	filledQuantity: number;
	status: string;
	createdAt: string;
}

interface UserHoldingsProps {
	marketId: string;
	yesPrice: number;
	noPrice: number;
}

export default function UserHoldings({ marketId, yesPrice, noPrice }: UserHoldingsProps) {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const [position, setPosition] = useState<Position | null>(null);
	const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [cancellingId, setCancellingId] = useState<string | null>(null);

	const fetchPosition = async () => {
		try {
			const res = await api.get(`/portfolio/position/${marketId}`);
			if (res.data?.success) {
				setPosition(res.data.data.position);
				setActiveOrders(res.data.data.activeOrders || []);
			}
		} catch {
			// silent fail
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!isAuthenticated || !marketId) return;
		fetchPosition();

		const handlePortfolioUpdate = () => {
			fetchPosition();
		};

		socket.on('PORTFOLIO_UPDATE', handlePortfolioUpdate);

		return () => {
			socket.off('PORTFOLIO_UPDATE', handlePortfolioUpdate);
		};
	}, [isAuthenticated, marketId]);

	if (!isAuthenticated) return null;

	const hasYes = position && (position.yesQuantity > 0 || position.yesLocked > 0);
	const hasNo = position && (position.noQuantity > 0 || position.noLocked > 0);
	const hasPosition = hasYes || hasNo;
	const hasOrders = activeOrders.length > 0;

	if (loading) {
		return (
			<div className="mb-6 bg-card border border-border rounded-xl p-5 shadow-sm">
				<div className="flex items-center gap-2">
					<div className="w-4 h-4 bg-muted rounded animate-pulse" />
					<div className="w-32 h-4 bg-muted rounded animate-pulse" />
				</div>
				<div className="mt-4 space-y-3">
					<div className="h-16 bg-muted/50 rounded-lg animate-pulse" />
				</div>
			</div>
		);
	}

	if (!hasPosition && !hasOrders) return null;

	const handleCancel = async (orderId: string) => {
		setCancellingId(orderId);
		try {
			const res = await cancelOrder(orderId, marketId);
			if (res.data?.success) {
				toast.success('Order cancelled');
				fetchPosition();
			} else {
				toast.error(res.data?.error || 'Failed to cancel');
			}
		} catch {
			toast.error('Failed to cancel order');
		} finally {
			setCancellingId(null);
		}
	};

	const yesAvailable = position?.yesQuantity || 0;
	const noAvailable = position?.noQuantity || 0;
	const yesLocked = position?.yesLocked || 0;
	const noLocked = position?.noLocked || 0;
	const yesInvested = position?.yesInvested || 0;
	const noInvested = position?.noInvested || 0;

	const yesCurrentValue = yesAvailable * yesPrice;
	const noCurrentValue = noAvailable * noPrice;
	const yesPnL = yesCurrentValue - yesInvested;
	const noPnL = noCurrentValue - noInvested;

	return (
		<div className="mb-6 bg-card dark:bg-[#111827] border border-border rounded-xl overflow-hidden shadow-sm">
			<div className="px-5 py-4 border-b border-border bg-muted/10 flex items-center justify-between">
				<div className="flex items-center gap-2.5">
					<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
						<Package size={16} className="text-primary" />
					</div>
					<span className="text-sm font-bold text-foreground tracking-wide">Your Portfolio</span>
				</div>
			</div>

			{hasPosition && (
				<div className="p-4 space-y-3">
					{hasYes && (
						<div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl transition-all hover:bg-emerald-500/10 gap-3">
							<div className="flex items-center gap-3.5">
								<div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shadow-sm shrink-0">
									<ArrowUpRight size={20} className="text-emerald-600 dark:text-emerald-400" />
								</div>
								<div>
									<div className="flex items-center gap-2">
										<div className="text-sm font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
											YES
										</div>
										{yesLocked > 0 && (
											<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
												{yesLocked} Locked
											</span>
										)}
									</div>
									<div className="text-xs font-semibold text-muted-foreground mt-0.5">
										{yesAvailable} Shares
									</div>
								</div>
							</div>
							<div className="flex flex-row sm:flex-col justify-between sm:text-right items-center sm:items-end border-t sm:border-t-0 border-border/50 pt-2 sm:pt-0">
								<div className="text-sm font-bold text-foreground">
									₹{yesCurrentValue.toFixed(1)}
								</div>
								<div
									className={`text-xs font-bold mt-0.5 flex items-center gap-1 ${yesPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
								>
									{yesPnL >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
									<span>
										{yesPnL >= 0 ? '+' : '-'}₹{Math.abs(yesPnL).toFixed(1)}
									</span>
								</div>
							</div>
						</div>
					)}

					{hasNo && (
						<div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-xl transition-all hover:bg-red-500/10 gap-3">
							<div className="flex items-center gap-3.5">
								<div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shadow-sm shrink-0">
									<ArrowDownRight size={20} className="text-red-600 dark:text-red-400" />
								</div>
								<div>
									<div className="flex items-center gap-2">
										<div className="text-sm font-black text-red-700 dark:text-red-400 uppercase tracking-wider">
											NO
										</div>
										{noLocked > 0 && (
											<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
												{noLocked} Locked
											</span>
										)}
									</div>
									<div className="text-xs font-semibold text-muted-foreground mt-0.5">
										{noAvailable} Shares
									</div>
								</div>
							</div>
							<div className="flex flex-row sm:flex-col justify-between sm:text-right items-center sm:items-end border-t sm:border-t-0 border-border/50 pt-2 sm:pt-0">
								<div className="text-sm font-bold text-foreground">
									₹{noCurrentValue.toFixed(1)}
								</div>
								<div
									className={`text-xs font-bold mt-0.5 flex items-center gap-1 ${noPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
								>
									{noPnL >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
									<span>
										{noPnL >= 0 ? '+' : '-'}₹{Math.abs(noPnL).toFixed(1)}
									</span>
								</div>
							</div>
						</div>
					)}
				</div>
			)}

			{hasOrders && (
				<div className="border-t border-border bg-muted/5">
					<div className="px-5 py-3 border-b border-border/50">
						<span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
							Active Orders
							<span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px]">
								{activeOrders.length}
							</span>
						</span>
					</div>
					<div className="p-4 space-y-2.5">
						{activeOrders.map((order) => (
							<div
								key={order.id}
								className="flex items-center justify-between py-3 px-4 bg-background border border-border rounded-xl shadow-sm hover:border-primary/30 transition-colors"
							>
								<div className="flex flex-col gap-1">
									<div className="flex items-center gap-2">
										<span
											className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
												order.orderType === 'SELL'
													? 'bg-red-500/10 text-red-500 border border-red-500/20'
													: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
											}`}
										>
											{order.orderType}
										</span>
										<span
											className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
												order.stockType === 'YES'
													? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
													: 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
											}`}
										>
											{order.stockType}
										</span>
									</div>
									<span className="text-xs font-semibold text-muted-foreground mt-0.5">
										{order.quantity - order.filledQuantity} shares @ ₹
										{Number(order.price).toFixed(1)}
									</span>
								</div>
								<button
									onClick={() => handleCancel(order.id)}
									disabled={cancellingId === order.id}
									className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/15 border border-red-500/10 text-red-500 transition-colors disabled:opacity-50 cursor-pointer"
									title="Cancel order"
								>
									{cancellingId === order.id ? (
										<Loader2 size={16} className="animate-spin" />
									) : (
										<X size={16} />
									)}
								</button>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
