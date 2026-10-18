/**
 * Generates the Probstreet PWA icons and Open Graph image from the real brand logo.
 *
 * The previous icons/og-image were placeholder "share" glyphs, not the brand mark.
 * This script derives the brand mark from `apps/web-app/src/assets/images/dark-logo.avif`
 * and emits:
 *   - public/icons/icon-192x192.png
 *   - public/icons/icon-512x512.png
 *   - public/icons/icon-maskable-192x192.png
 *   - public/icons/icon-maskable-512x512.png
 *   - public/icons/apple-touch-icon.png
 *   - public/icons/favicon-16x16.png
 *   - public/icons/favicon-32x32.png
 *   - public/favicon.ico               (multi-size ICO: 16/32/48, PNG-compressed)
 *   - public/og-image.png              (1200x630 Open Graph / Twitter card)
 *
 * Usage (from the repo root, requires `sharp`, which is already installed):
 *   bun scripts/generate-pwa-assets.mjs
 */

import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const webApp = path.join(root, 'apps/web-app');
const publicDir = path.join(webApp, 'public');
const iconsDir = path.join(publicDir, 'icons');

// Brand background matches the logo's own background (#090D19 == theme_color #090C1A).
const BRAND_BG = { r: 9, g: 13, b: 25, alpha: 1 };
const DARK_LOGO = path.join(webApp, 'src/assets/images/dark-logo.avif');

/** Extract the standalone brand mark (white/silver chevron on brand background). */
async function extractBrandMark() {
	const region = await sharp(DARK_LOGO)
		.extract({ left: 0, top: 0, width: 380, height: 511 })
		.png()
		.toBuffer();
	return sharp(region).trim({ threshold: 12 }).png().toBuffer();
}

/** Build a square icon with the mark centered at `ratio` of the icon height. */
async function makeIcon(markBuf, size, ratio) {
	const h = Math.max(1, Math.round(size * ratio));
	const mark = await sharp(markBuf).resize({ height: h, fit: 'contain' }).png().toBuffer();
	return sharp({ create: { width: size, height: size, channels: 4, background: BRAND_BG } })
		.composite([{ input: mark, gravity: 'center' }])
		.png({ compressionLevel: 9 })
		.toBuffer();
}

/** Assemble a multi-size ICO file from PNG buffers. */
function buildIco(entries) {
	const count = entries.length;
	const header = Buffer.alloc(6);
	header.writeUInt16LE(0, 0); // reserved
	header.writeUInt16LE(1, 2); // type: icon
	header.writeUInt16LE(count, 4);

	const dir = Buffer.alloc(16 * count);
	let offset = 6 + 16 * count;
	const dataParts = [];

	entries.forEach((entry, i) => {
		const b = i * 16;
		const dim = entry.size >= 256 ? 0 : entry.size;
		dir.writeUInt8(dim, b + 0); // width
		dir.writeUInt8(dim, b + 1); // height
		dir.writeUInt8(0, b + 2); // palette
		dir.writeUInt8(0, b + 3); // reserved
		dir.writeUInt16LE(1, b + 4); // planes
		dir.writeUInt16LE(32, b + 6); // bit depth
		dir.writeUInt32LE(entry.data.length, b + 8);
		dir.writeUInt32LE(offset, b + 12);
		offset += entry.data.length;
		dataParts.push(entry.data);
	});

	return Buffer.concat([header, dir, ...dataParts]);
}

const OG_W = 1200;
const OG_H = 630;
const OG_FONT = 'Helvetica, Arial, sans-serif';

/** Shared dark gradient background with a subtle blue glow and rounded frame. */
function ogBackgroundSvg() {
	return `
		<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}">
			<defs>
				<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stop-color="#0C1222"/>
					<stop offset="1" stop-color="#05070E"/>
				</linearGradient>
				<radialGradient id="glow" cx="0.5" cy="0.4" r="0.65">
					<stop offset="0" stop-color="#2563EB" stop-opacity="0.20"/>
					<stop offset="1" stop-color="#2563EB" stop-opacity="0"/>
				</radialGradient>
			</defs>
			<rect width="${OG_W}" height="${OG_H}" fill="url(#bg)"/>
			<rect width="${OG_W}" height="${OG_H}" fill="url(#glow)"/>
			<rect x="24" y="24" width="${OG_W - 48}" height="${OG_H - 48}" rx="28"
				fill="none" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="2"/>
		</svg>`;
}

/**
 * The wordmark (white on brand background) is composited with `lighten` so the
 * logo's own dark background disappears into the gradient with no visible seam.
 */
async function composeOg({ wordmarkWidth, wordmarkTop, wordmarkLeft, overlaySvg }) {
	const wordmark = await sharp(DARK_LOGO).resize({ width: wordmarkWidth }).png().toBuffer();
	return sharp(Buffer.from(ogBackgroundSvg()))
		.composite([
			{ input: wordmark, top: wordmarkTop, left: wordmarkLeft, blend: 'lighten' },
			{ input: Buffer.from(overlaySvg) },
		])
		.png({ compressionLevel: 9 })
		.toBuffer();
}

/** Open Graph / Twitter card image (1200x630) — centred wordmark + YES/NO pills. */
async function makeOgImage() {
	const wmWidth = 620;
	const overlay = `
		<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}">
			<text x="${OG_W / 2}" y="326" text-anchor="middle"
				font-family="${OG_FONT}" font-size="48" font-weight="700"
				fill="#F8FAFC">Every outcome has a price.</text>
			<text x="${OG_W / 2}" y="374" text-anchor="middle"
				font-family="${OG_FONT}" font-size="24"
				fill="#94A3B8">Buy YES or NO shares on real-world events.</text>

			<rect x="160" y="424" width="420" height="104" rx="16"
				fill="#10B981" fill-opacity="0.12" stroke="#10B981" stroke-opacity="0.45" stroke-width="2"/>
			<text x="192" y="466" font-family="${OG_FONT}" font-size="20" font-weight="700"
				fill="#34D399">YES</text>
			<text x="192" y="510" font-family="${OG_FONT}" font-size="38" font-weight="800"
				fill="#FFFFFF">62%</text>

			<rect x="620" y="424" width="420" height="104" rx="16"
				fill="#EF4444" fill-opacity="0.12" stroke="#EF4444" stroke-opacity="0.45" stroke-width="2"/>
			<text x="652" y="466" font-family="${OG_FONT}" font-size="20" font-weight="700"
				fill="#F87171">NO</text>
			<text x="652" y="510" font-family="${OG_FONT}" font-size="38" font-weight="800"
				fill="#FFFFFF">38%</text>
		</svg>`;
	return composeOg({
		wordmarkWidth: wmWidth,
		wordmarkTop: 76,
		wordmarkLeft: Math.round((OG_W - wmWidth) / 2),
		overlaySvg: overlay,
	});
}

async function main() {
	await mkdir(iconsDir, { recursive: true });

	const mark = await extractBrandMark();

	// Standard icons: mark occupies ~58% of the tile, comfortable margin all around.
	await writeFile(path.join(iconsDir, 'icon-192x192.png'), await makeIcon(mark, 192, 0.58));
	await writeFile(path.join(iconsDir, 'icon-512x512.png'), await makeIcon(mark, 512, 0.58));
	await writeFile(path.join(iconsDir, 'apple-touch-icon.png'), await makeIcon(mark, 180, 0.6));

	// Maskable icons: keep content inside the 80% safe zone (Android crops to a circle).
	await writeFile(
		path.join(iconsDir, 'icon-maskable-192x192.png'),
		await makeIcon(mark, 192, 0.45),
	);
	await writeFile(
		path.join(iconsDir, 'icon-maskable-512x512.png'),
		await makeIcon(mark, 512, 0.45),
	);

	// Favicons: slightly larger mark so it stays legible at tiny sizes.
	await writeFile(path.join(iconsDir, 'favicon-16x16.png'), await makeIcon(mark, 16, 0.78));
	await writeFile(path.join(iconsDir, 'favicon-32x32.png'), await makeIcon(mark, 32, 0.72));

	// Multi-size favicon.ico (PNG-compressed entries: supported by all modern browsers).
	const icoSizes = [16, 32, 48];
	const icoEntries = [];
	for (const size of icoSizes) {
		icoEntries.push({ size, data: await makeIcon(mark, size, size <= 16 ? 0.78 : 0.72) });
	}
	await writeFile(path.join(publicDir, 'favicon.ico'), buildIco(icoEntries));

	// Open Graph / Twitter card image (1200x630).
	await writeFile(path.join(publicDir, 'og-image.png'), await makeOgImage());

	console.log('Generated PWA icons + og-image (1200x630) + favicon.ico');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
