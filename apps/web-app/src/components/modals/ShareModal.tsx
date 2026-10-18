import { toast } from 'sonner';
import { useState } from 'react';
import defaultThumbnail from '@/assets/images/logo.avif';
import barChartIcon from '@/assets/images/Bar_Chart.avif';
import { X, Check, Link as LinkIcon, Share2, Download, Copy, Loader2 } from 'lucide-react';

interface ShareModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	url: string;
	yesPrice?: number;
	noPrice?: number;
	category?: string;
	volume?: number | string;
	traders?: number;
	thumbnail?: string;
}

function roundRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
) {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
	const words = text.split(' ');
	const lines: string[] = [];
	let currentLine = words[0] || '';

	for (let i = 1; i < words.length; i++) {
		const word = words[i];
		const width = ctx.measureText(currentLine + ' ' + word).width;
		if (width < maxWidth) {
			currentLine += ' ' + word;
		} else {
			lines.push(currentLine);
			currentLine = word;
		}
	}
	if (currentLine) lines.push(currentLine);
	return lines;
}

export default function ShareModal({
	isOpen,
	onClose,
	title,
	url,
	yesPrice = 5.0,
	noPrice = 5.0,
	category,
	volume = 0,
	traders = 0,
	thumbnail,
}: ShareModalProps) {
	const [copiedLink, setCopiedLink] = useState(false);
	const [copiedImage, setCopiedImage] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);

	if (!isOpen) return null;

	const formattedVolume =
		typeof volume === 'number'
			? volume.toLocaleString('en-IN')
			: isNaN(Number(volume))
				? volume
				: Number(volume).toLocaleString('en-IN');

	const yesNum = Number(yesPrice) || 5.0;
	const noNum = Number(noPrice) || 5.0;
	const yesPercent = Math.round((yesNum / 10) * 100) || 50;
	const noPercent = 100 - yesPercent;

	const generateCanvasBlob = async (): Promise<Blob | null> => {
		const canvas = document.createElement('canvas');
		canvas.width = 1200;
		canvas.height = 630;
		const ctx = canvas.getContext('2d');
		if (!ctx) return null;

		// Premium Dark Background
		const bgGrad = ctx.createLinearGradient(0, 0, 1200, 630);
		bgGrad.addColorStop(0, '#070913');
		bgGrad.addColorStop(0.5, '#0D1224');
		bgGrad.addColorStop(1, '#05070E');
		ctx.fillStyle = bgGrad;
		ctx.fillRect(0, 0, 1200, 630);

		// Subtle radial glow
		const glow = ctx.createRadialGradient(600, 315, 30, 600, 315, 520);
		glow.addColorStop(0, 'rgba(59, 130, 246, 0.09)');
		glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
		ctx.fillStyle = glow;
		ctx.fillRect(0, 0, 1200, 630);

		// Outer card border
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
		ctx.lineWidth = 2;
		roundRect(ctx, 30, 30, 1140, 570, 24);
		ctx.stroke();

		// Branding: PROBSTREET
		ctx.fillStyle = '#FFFFFF';
		ctx.font = 'bold 32px Inter, system-ui, sans-serif';
		ctx.fillText('PROBSTREET', 70, 95);

		// Badge: PREDICTION MARKET
		ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
		roundRect(ctx, 290, 68, 175, 34, 8);
		ctx.fill();
		ctx.fillStyle = '#94A3B8';
		ctx.font = '600 13px Inter, system-ui, sans-serif';
		ctx.fillText('PREDICTION MARKET', 305, 90);

		// Category badge (if available)
		if (category) {
			ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
			roundRect(ctx, 990, 66, 140, 38, 19);
			ctx.fill();
			ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
			ctx.lineWidth = 1.5;
			roundRect(ctx, 990, 66, 140, 38, 19);
			ctx.stroke();
			ctx.fillStyle = '#60A5FA';
			ctx.font = 'bold 15px Inter, system-ui, sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(category.toUpperCase(), 1060, 91);
			ctx.textAlign = 'left';
		}

		// Market Title / Question (wrapped text)
		ctx.fillStyle = '#F8FAFC';
		ctx.font = 'bold 40px Inter, system-ui, sans-serif';
		const titleLines = wrapText(ctx, title, 1060);
		let currentY = 175;
		for (const line of titleLines.slice(0, 3)) {
			ctx.fillText(line, 70, currentY);
			currentY += 50;
		}

		// Boxes placement
		const boxY = Math.max(currentY + 20, 310);
		const boxW = 510;
		const boxH = 145;

		// YES Box (Green)
		const yesBoxX = 70;
		ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
		roundRect(ctx, yesBoxX, boxY, boxW, boxH, 16);
		ctx.fill();
		ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
		ctx.lineWidth = 2;
		roundRect(ctx, yesBoxX, boxY, boxW, boxH, 16);
		ctx.stroke();

		ctx.fillStyle = '#10B981';
		ctx.font = 'bold 22px Inter, system-ui, sans-serif';
		ctx.fillText('YES PRICE', yesBoxX + 28, boxY + 42);

		ctx.fillStyle = '#FFFFFF';
		ctx.font = 'bold 50px Inter, system-ui, sans-serif';
		ctx.fillText(`₹${yesNum.toFixed(2)}`, yesBoxX + 28, boxY + 105);

		ctx.fillStyle = '#34D399';
		ctx.font = 'bold 36px Inter, system-ui, sans-serif';
		ctx.textAlign = 'right';
		ctx.fillText(`${yesPercent}%`, yesBoxX + boxW - 28, boxY + 105);
		ctx.textAlign = 'left';

		// NO Box (Red)
		const noBoxX = 620;
		ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
		roundRect(ctx, noBoxX, boxY, boxW, boxH, 16);
		ctx.fill();
		ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
		ctx.lineWidth = 2;
		roundRect(ctx, noBoxX, boxY, boxW, boxH, 16);
		ctx.stroke();

		ctx.fillStyle = '#EF4444';
		ctx.font = 'bold 22px Inter, system-ui, sans-serif';
		ctx.fillText('NO PRICE', noBoxX + 28, boxY + 42);

		ctx.fillStyle = '#FFFFFF';
		ctx.font = 'bold 50px Inter, system-ui, sans-serif';
		ctx.fillText(`₹${noNum.toFixed(2)}`, noBoxX + 28, boxY + 105);

		ctx.fillStyle = '#F87171';
		ctx.font = 'bold 36px Inter, system-ui, sans-serif';
		ctx.textAlign = 'right';
		ctx.fillText(`${noPercent}%`, noBoxX + boxW - 28, boxY + 105);
		ctx.textAlign = 'left';

		// Bottom Bar
		const footerY = 550;
		ctx.fillStyle = '#64748B';
		ctx.font = '500 18px Inter, system-ui, sans-serif';
		ctx.fillText(`₹${formattedVolume} Volume  •  ${traders || 0} Traders`, 70, footerY);

		ctx.fillStyle = '#94A3B8';
		ctx.textAlign = 'right';
		ctx.font = 'bold 18px Inter, system-ui, sans-serif';
		ctx.fillText('Trade live on probstreet.com', 1130, footerY);
		ctx.textAlign = 'left';

		return new Promise((resolve) => {
			canvas.toBlob((blob) => resolve(blob), 'image/png');
		});
	};

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopiedLink(true);
			toast.success('Market link copied to clipboard!');
			setTimeout(() => setCopiedLink(false), 2500);
		} catch (err) {
			console.error('Failed to copy link', err);
			toast.error('Failed to copy link');
		}
	};

	const handleCopyImage = async () => {
		try {
			setIsGenerating(true);
			const blob = await generateCanvasBlob();
			if (!blob) throw new Error('Could not create image blob');

			if (navigator.clipboard && window.ClipboardItem) {
				await navigator.clipboard.write([
					new ClipboardItem({
						'image/png': blob,
					}),
				]);
				setCopiedImage(true);
				toast.success(
					'Preview image copied! You can paste it directly into WhatsApp, Discord, or Slack.',
				);
				setTimeout(() => setCopiedImage(false), 2500);
			} else {
				// Fallback download if clipboard image isn't supported in browser
				const imgUrl = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = imgUrl;
				a.download = `${title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}-preview.png`;
				a.click();
				URL.revokeObjectURL(imgUrl);
				toast.success('Preview card downloaded to your device!');
			}
		} catch (err) {
			console.error('Failed to copy image', err);
			toast.error('Could not copy image to clipboard.');
		} finally {
			setIsGenerating(false);
		}
	};

	const handleDownloadImage = async () => {
		try {
			setIsGenerating(true);
			const blob = await generateCanvasBlob();
			if (!blob) throw new Error('Could not generate image');

			const imgUrl = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = imgUrl;
			a.download = `probstreet-${title.slice(0, 25).replace(/[^a-zA-Z0-9]/g, '_')}.png`;
			a.click();
			URL.revokeObjectURL(imgUrl);
			toast.success('Share card downloaded!');
		} catch (err) {
			console.error('Download failed', err);
			toast.error('Could not download preview image');
		} finally {
			setIsGenerating(false);
		}
	};

	const handleNativeShare = async () => {
		try {
			setIsGenerating(true);
			const blob = await generateCanvasBlob();
			const file = blob ? new File([blob], 'probstreet-market.png', { type: 'image/png' }) : null;

			const shareData: ShareData = {
				title: `${title} | ProbStreet`,
				text: `🔥 ProbStreet Prediction Market:\n"${title}"\nYes: ₹${yesNum} (${yesPercent}%) • No: ₹${noNum} (${noPercent}%)\n`,
				url: url,
			};

			if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
				shareData.files = [file];
			}

			if (navigator.share) {
				await navigator.share(shareData);
				toast.success('Shared successfully!');
			} else {
				handleCopyLink();
			}
		} catch (err) {
			if ((err as Error).name !== 'AbortError') {
				console.error('Share error', err);
				handleCopyLink();
			}
		} finally {
			setIsGenerating(false);
		}
	};

	const shareText = encodeURIComponent(
		`🔥 Check out this prediction market on ProbStreet:\n"${title}"\n\nTrade YES (₹${yesNum} · ${yesPercent}%) or NO (₹${noNum} · ${noPercent}%) now 👇`,
	);
	const shareUrl = encodeURIComponent(url);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
			onClick={onClose}
		>
			<div
				className="bg-gray-50 dark:bg-[#090C1A] w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-white/5">
					<div className="flex items-center gap-2">
						<Share2 className="w-4 h-4 text-primary" />
						<h2 className="text-sm font-semibold text-gray-900 dark:text-white">Share Market</h2>
					</div>
					<button
						onClick={onClose}
						className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 transition cursor-pointer"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				<div className="p-5 space-y-4">
					{/* Interactive Preview Card */}
					<div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-linear-to-br from-white dark:from-[#0C1024] to-gray-50 dark:to-[#070914] p-4.5 shadow-inner">
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
								<img src={barChartIcon} className="w-3.5 h-3.5" alt="traders" />
								<span>{traders || 0} active traders</span>
							</div>
							{category && (
								<span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
									{category}
								</span>
							)}
						</div>

						<div className="flex gap-3 items-start mb-3">
							<img
								src={thumbnail || defaultThumbnail}
								alt={title}
								className="w-11 h-11 object-cover rounded-lg border border-gray-200 dark:border-white/10 shrink-0"
							/>
							<h3 className="text-sm font-semibold leading-snug text-gray-900 dark:text-white line-clamp-2">
								{title}
							</h3>
						</div>

						{/* Live Probability Boxes */}
						<div className="grid grid-cols-2 gap-2.5 my-3">
							<div className="p-2.5 rounded-lg border border-green-500/30 bg-green-500/10 dark:bg-green-950/20">
								<div className="flex justify-between items-center text-[11px] font-bold text-green-700 dark:text-green-400 mb-0.5">
									<span>YES</span>
									<span>{yesPercent}%</span>
								</div>
								<div className="text-base font-extrabold text-green-700 dark:text-green-300">
									₹{yesNum.toFixed(2)}
								</div>
							</div>
							<div className="p-2.5 rounded-lg border border-red-500/30 bg-red-500/10 dark:bg-red-950/20">
								<div className="flex justify-between items-center text-[11px] font-bold text-red-700 dark:text-red-400 mb-0.5">
									<span>NO</span>
									<span>{noPercent}%</span>
								</div>
								<div className="text-base font-extrabold text-red-700 dark:text-red-300">
									₹{noNum.toFixed(2)}
								</div>
							</div>
						</div>

						{/* Probability progress bar */}
						<div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden flex mb-2.5">
							<div className="bg-green-500 h-full" style={{ width: `${yesPercent}%` }} />
							<div className="bg-red-500 h-full" style={{ width: `${noPercent}%` }} />
						</div>

						{/* Volume & Watermark */}
						<div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-1">
							<span>
								<strong className="text-gray-900 dark:text-white">₹{formattedVolume}</strong> Vol.
							</span>
							<span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">
								probstreet.com
							</span>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="space-y-2">
						{/* Primary Action Row: Copy Image / Download Card */}
						<div className="grid grid-cols-2 gap-2">
							<button
								onClick={handleCopyImage}
								disabled={isGenerating}
								className="flex items-center justify-center gap-2 py-2.5 px-3 bg-primary text-white font-semibold text-xs rounded-xl hover:bg-primary/90 transition shadow-sm cursor-pointer disabled:opacity-50"
							>
								{isGenerating ? (
									<Loader2 className="w-3.5 h-3.5 animate-spin" />
								) : copiedImage ? (
									<Check className="w-3.5 h-3.5 text-white" />
								) : (
									<Copy className="w-3.5 h-3.5" />
								)}
								<span>{copiedImage ? 'Image Copied!' : 'Copy Preview Card'}</span>
							</button>

							<button
								onClick={handleDownloadImage}
								disabled={isGenerating}
								className="flex items-center justify-center gap-2 py-2.5 px-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-semibold text-xs rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition cursor-pointer disabled:opacity-50"
							>
								<Download className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
								<span>Download PNG</span>
							</button>
						</div>

						{/* Secondary Action Row: Copy Link, Share to X, Mobile Native Share */}
						<div className="grid grid-cols-3 gap-2 pt-1">
							<button
								onClick={handleCopyLink}
								className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-medium text-xs rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition cursor-pointer"
							>
								{copiedLink ? (
									<Check className="w-3.5 h-3.5 text-green-500" />
								) : (
									<LinkIcon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
								)}
								<span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
							</button>

							<a
								href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
								target="_blank"
								rel="noreferrer"
								className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 font-medium text-xs rounded-xl transition cursor-pointer"
							>
								<Share2 className="w-3.5 h-3.5" />
								<span>Share on X</span>
							</a>

							<button
								onClick={handleNativeShare}
								disabled={isGenerating}
								className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-medium text-xs rounded-xl transition cursor-pointer"
							>
								<Share2 className="w-3.5 h-3.5" />
								<span>WhatsApp / Apps</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
