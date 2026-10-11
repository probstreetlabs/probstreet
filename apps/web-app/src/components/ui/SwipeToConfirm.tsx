import { ArrowRight, Check } from 'lucide-react';
import { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface SwipeToConfirmProps {
	label: string;
	onConfirmed: (idempotencyKey: string) => void;
	disabled?: boolean;
	isPending?: boolean;
	variant?: 'buy' | 'sell' | 'default' | 'yes' | 'no';
}

const generateKey = () => {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export default function SwipeToConfirm({
	label,
	onConfirmed,
	disabled = false,
	variant = 'default',
}: SwipeToConfirmProps) {
	const trackRef = useRef<HTMLDivElement>(null);
	const x = useMotionValue(0);
	const [confirmed, setConfirmed] = useState(false);
	const [dragging, setDragging] = useState(false);
	const keyRef = useRef<string>('');

	const THUMB_SIZE = 52;
	const maxX = useRef(0);

	const bgOpacity = useTransform(x, [0, 200], [0, 1]);
	const arrowOpacity = useTransform(x, [0, 60], [1, 0]);
	const checkOpacity = useTransform(x, [60, 120], [0, 1]);

	const isYes = variant === 'buy' || variant === 'yes';
	const isNo = variant === 'sell' || variant === 'no';

	const onDragStart = useCallback(() => {
		if (disabled || confirmed) return;
		// Generate the key here — one unique key per physical swipe attempt
		keyRef.current = generateKey();
		setDragging(true);
		if (trackRef.current) {
			maxX.current = trackRef.current.offsetWidth - THUMB_SIZE - 8;
		}
	}, [disabled, confirmed]);

	const onDragEnd = useCallback(() => {
		setDragging(false);
		const currentX = x.get();
		const threshold = maxX.current * 0.8; // 80% of track

		if (currentX >= threshold) {
			// Snap to end, mark confirmed
			animate(x, maxX.current, { duration: 0.15 });
			setConfirmed(true);
			onConfirmed(keyRef.current);
			// Auto-reset after 1.8s so the panel is reusable
			setTimeout(() => {
				setConfirmed(false);
				x.set(0);
			}, 1800);
		} else {
			animate(x, 0, { duration: 0.35, type: 'spring', stiffness: 300, damping: 25 });
		}
	}, [x, onConfirmed]);

	const trackBg = isYes
		? 'bg-[#22c55e]/15 border border-[#22c55e]/30'
		: isNo
			? 'bg-[#ef4444]/15 border border-[#ef4444]/30'
			: 'bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800';

	const fillBg = isYes ? 'bg-[#22c55e]' : isNo ? 'bg-[#ef4444]' : 'bg-black dark:bg-white';

	const thumbBg = isYes ? 'bg-[#22c55e]' : isNo ? 'bg-[#ef4444]' : 'bg-black dark:bg-white';

	const textColor = isYes
		? 'text-[#16a34a] dark:text-[#4ade80]'
		: isNo
			? 'text-[#dc2626] dark:text-[#f87171]'
			: 'text-neutral-900 dark:text-neutral-100';

	const iconColor = isYes || isNo ? 'text-white' : 'text-white dark:text-black';

	const confirmedTextColor = isYes || isNo ? 'text-white' : 'text-white dark:text-black';

	const isDisabled = disabled && !confirmed;

	return (
		<div
			ref={trackRef}
			aria-label={label}
			className={`relative w-full mt-8 h-13 rounded-full overflow-hidden select-none transition-opacity duration-150 ${
				isDisabled ? 'opacity-80 pointer-events-none' : 'opacity-100'
			} ${trackBg}`}
		>
			<motion.div
				className={`absolute inset-0 rounded-full ${fillBg}`}
				style={{
					opacity: bgOpacity,
				}}
			/>

			{confirmed && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.12 }}
					className={`absolute inset-0 rounded-full ${fillBg}`}
				/>
			)}

			<div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
				{!confirmed ? (
					<span
						className={`text-[14px] font-semibold transition-opacity duration-200 ${textColor} ${
							dragging ? 'opacity-40' : 'opacity-100'
						}`}
					>
						{label}
					</span>
				) : (
					<motion.span
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.12 }}
						className={`text-[15px] font-semibold ${confirmedTextColor} opacity-100 flex items-center justify-center gap-1.5`}
					>
						Confirmed ✓
					</motion.span>
				)}
			</div>

			<motion.div
				drag={confirmed ? false : 'x'}
				dragConstraints={{ left: 0, right: maxX.current }}
				dragElastic={0.05}
				dragMomentum={false}
				onDragStart={onDragStart}
				onDragEnd={onDragEnd}
				style={{ x }}
				animate={{
					opacity: confirmed ? 0 : 1,
					scale: confirmed ? 0.6 : 1,
				}}
				transition={{ duration: 0.15 }}
				className={`absolute top-0.75 left-0.75 w-11 h-11 rounded-full ${thumbBg} flex items-center justify-center cursor-grab active:cursor-grabbing z-10 ${
					confirmed ? 'opacity-0 pointer-events-none invisible' : 'opacity-100 visible'
				}`}
			>
				<motion.div style={{ opacity: arrowOpacity }} className="absolute">
					<ArrowRight size={18} className={iconColor} />
				</motion.div>
				<motion.div style={{ opacity: checkOpacity }} className="absolute">
					<Check size={18} className={iconColor} />
				</motion.div>
			</motion.div>
		</div>
	);
}
