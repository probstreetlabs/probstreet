import { useEffect } from 'react';
import { IndianRupee, ShieldCheck, Trophy } from 'lucide-react';

export default function AboutPage() {
	useEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
	}, []);

	const features = [
		[
			'Real Order Book',
			'All trades on a central limit order book — no house edge, no spread manipulation.',
		],
		['Instant Matching', 'Our high-performance matching engine settles orders in milliseconds.'],
		[
			'Risk-Free Practice',
			'Currently operating in paper-trading mode. Test your skills with zero financial risk.',
		],
		[
			'Transparent Settlement',
			'Crypto and stocks resolve instantly. Other markets are verified using reliable sources and our AI judges.',
		],
		[
			'Referral Rewards',
			'Invite friends to join the platform, compete on the leaderboard, and earn virtual rewards.',
		],
	];

	return (
		<div
			className="w-full min-h-screen bg-[#f4f4f5] dark:bg-[#090C1A] transition-colors"
			style={{ animation: 'pageEnter 0.4s ease-out both' }}
		>
			<style>{`
				@keyframes pageEnter {
					from { opacity: 0; transform: translateY(16px); }
					to   { opacity: 1; transform: translateY(0); }
				}
			`}</style>
			<div className="max-w-4xl mx-auto px-6 py-10 md:py-14">
				<div className="mb-8">
					<h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight mb-1">
						About Probstreet
					</h1>
					<p className="md:text-base text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
						A simple, transparent prediction market for everyone. (Currently in Paper Trading Mode)
					</p>
				</div>

				<div className="flex flex-col gap-3">
					<div className="bg-white dark:bg-[#0F1225] border border-gray-200 dark:border-white/6 rounded-xl p-5 md:p-6">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 tracking-tight">
							Our Mission
						</h2>
						<p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
							We believe that crowds make better predictions than any single expert. Probstreet is a
							fair and transparent platform where you can forecast real-world events. Right now, we
							are operating strictly as a <strong>paper trading</strong> platform. No real money is
							involved, allowing you to build trust with our system and test your skills completely
							risk-free!
						</p>
					</div>

					<div className="bg-white dark:bg-[#0F1225] border border-gray-200 dark:border-white/6 rounded-xl p-5 md:p-6">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 tracking-tight">
							How It Works
						</h2>
						<div className="grid gap-4 sm:grid-cols-3">
							{[
								[
									<ShieldCheck size={24} />,
									'Pick an Event',
									'Browse live markets across sports, politics, Crypto, and more. Each is a Yes/No question on a real outcome.',
								],
								[
									<IndianRupee size={20} />,
									'Place Your Order',
									'Buy YES or NO shares between ₹0.5 and ₹9.5. Your price is your probability estimate.',
								],
								[
									<Trophy size={20} />,
									'Collect Returns',
									'Winning shares pay ₹10 each at settlement. Withdraw profits directly to your bank account.',
								],
							].map(([icon, title, desc]) => (
								<div
									key={title as string}
									className="bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/4 rounded-lg p-4"
								>
									<div className="text-xl mb-2.5">{icon}</div>
									<p className="text-sm font-medium text-gray-900 dark:text-white mb-1.5">
										{title}
									</p>
									<p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{desc}</p>
								</div>
							))}
						</div>
					</div>

					<div className="bg-white dark:bg-[#0F1225] border border-gray-200 dark:border-white/6 rounded-xl p-5 md:p-6">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 tracking-tight">
							Why Probstreet?
						</h2>
						<ul className="space-y-3">
							{features.map(([title, desc]) => (
								<li key={title} className="flex items-start gap-3">
									<span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[10px] text-gray-600 dark:text-gray-300 font-bold">
										✓
									</span>
									<span className="text-sm text-gray-600 dark:text-gray-300">
										<span className="font-medium text-gray-900 dark:text-white">{title}: </span>
										{desc}
									</span>
								</li>
							))}
						</ul>
					</div>

					<div className="bg-white dark:bg-[#0F1225] border border-gray-200 dark:border-white/6 rounded-xl p-5 md:p-6">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 tracking-tight">
							Legal & Compliance
						</h2>
						<p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
							Probstreet is currently operating as a simulated paper-trading platform for
							educational and entertainment purposes. No real money deposits or withdrawals are
							supported at this time. However, to maintain a responsible community, the platform
							remains restricted to users aged 18 and above.
						</p>
					</div>

					<div className="bg-white dark:bg-[#0F1225] border border-gray-200 dark:border-white/6 rounded-xl p-5 md:p-6">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 tracking-tight">
							Our Technology Stack
						</h2>
						<p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
							We build on a robust, high-performance tech stack designed for speed, scale, and
							reliability to give you the best trading experience.
						</p>
						<div className="grid gap-6 sm:grid-cols-2">
							<div className="bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/4 rounded-lg p-4">
								<h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
									Frontend
								</h3>
								<div className="flex flex-wrap gap-5 items-center">
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/typescript/default.svg"
										alt="TypeScript"
										className="h-6 object-contain"
										title="TypeScript"
									/>
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/react/default.svg"
										alt="React"
										className="h-6 object-contain"
										title="React"
									/>
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/vitejs/default.svg"
										alt="Vite"
										className="h-6 object-contain"
										title="Vite"
									/>
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/tailwind-css/default.svg"
										alt="Tailwind CSS"
										className="h-5 object-contain"
										title="Tailwind CSS"
									/>
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/tanstack/default.svg"
										alt="TanStack"
										className="h-7.5 object-contain"
										title="TanStack"
									/>
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/posthog/default.svg"
										alt="PostHog"
										className="h-6 object-contain"
										title="PostHog"
									/>
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/vercel/mono.svg"
										alt="Vercel"
										className="h-6 object-contain dark:invert"
										title="Vercel"
									/>
								</div>
							</div>

							<div className="bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/4 rounded-lg p-4">
								<h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
									Backend
								</h3>
								<div className="flex flex-wrap gap-5 items-center">
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/typescript/default.svg"
										alt="TypeScript"
										className="h-6 object-contain"
										title="TypeScript"
									/>
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/bun/default.svg"
										alt="Bun"
										className="h-7 object-contain"
										title="Bun"
									/>
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/hono/default.svg"
										alt="Hono"
										className="h-7 object-contain"
										title="Hono"
									/>
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/go/default.svg"
										alt="Go"
										className="h-5 object-contain"
										title="Go"
									/>
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/zod/default.svg"
										alt="Zod"
										className="h-7 object-contain"
										title="Zod"
									/>
								</div>
							</div>

							<div className="bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/4 rounded-lg p-4">
								<h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
									Data & Infrastructure
								</h3>
								<div className="flex flex-wrap gap-5 items-center">
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/postgresql/default.svg"
										alt="PostgreSQL"
										className="h-7 object-contain"
										title="PostgreSQL"
									/>
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/prisma/light.svg"
										alt="Prisma"
										className="h-7 object-contain"
										title="Prisma"
									/>
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/influxdb/default.svg"
										alt="InfluxDB"
										className="h-7 object-contain"
										title="InfluxDB"
									/>
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/redis/default.svg"
										alt="Redis"
										className="h-7 object-contain"
										title="Redis"
									/>
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/kafka/default.svg"
										alt="Kafka"
										className="h-7 object-contain dark:invert"
										title="Kafka"
									/>
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/docker-badge/default.svg"
										alt="Docker"
										className="h-8 object-contain"
										title="Docker"
									/>
								</div>
							</div>
							<div className="bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/4 rounded-lg p-4">
								<h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
									Partners & Services
								</h3>
								<div className="flex flex-wrap gap-5 items-center">
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/cloudflare/default.svg"
										alt="Cloudflare"
										className="h-4 object-contain"
										title="Cloudflare"
									/>
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/sentry/mono.svg"
										alt="Sentry"
										className="h-5.5 object-contain dark:invert"
										title="Sentry"
									/>
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/neon/default.svg"
										alt="Neon"
										className="h-5.5 object-contain"
										title="Neon"
									/>
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/cloudinary-badge/default.svg"
										alt="Cloudinary"
										className="h-7 object-contain"
										title="Cloudinary"
									/>
									<img
										src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/firebase/default.svg"
										alt="Firebase"
										className="h-7 object-contain"
										title="Firebase"
									/>
									<img
										src="https://cashfreelogo.cashfree.com/website/NavFooter/Cashfree-Dark.svg"
										alt="Cashfree"
										className="h-6 object-contain dark:invert"
										title="Cashfree"
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="bg-white dark:bg-[#0F1225] border border-gray-200 dark:border-white/6 rounded-xl p-5 md:p-6">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 tracking-tight">
							Get in Touch
						</h2>
						<p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
							Have a question, partnership inquiry, or feedback? We'd love to hear from you.
						</p>
						<div className="flex flex-col gap-1.5 text-sm">
							{[
								['Legal', 'official.rehan.me@gmail.com'],
								['General', 'official.rehan.me@gmail.com'],
								['Support', 'official.rehan.me@gmail.com'],
							].map(([label, email]) => (
								<p key={label} className="text-gray-500 dark:text-gray-400">
									<span className="text-gray-700 dark:text-gray-300 font-medium">{label}: </span>
									<a
										href={`mailto:${email}`}
										className="text-gray-900 dark:text-white underline underline-offset-2"
									>
										{email}
									</a>
								</p>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
