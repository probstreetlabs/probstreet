import React from 'react';

export const getCategoryIcon = (categoryName: string, className?: string): React.ReactNode => {
	const name = categoryName.toLowerCase();
	const invertClass = className ? `${className} dark:invert opacity-80 dark:opacity-100` : 'dark:invert opacity-80 dark:opacity-100';
	
	if (name.includes('crypto') || name.includes('web3') || name.includes('blockchain') || name.includes('bitcoin')) {
		// Bitcoin is already colored, so we don't invert it
		return <img src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/bitcoin/default.svg" className={className} alt="Crypto" />;
	}
	if (name.includes('sport') || name.includes('football') || name.includes('cricket') || name.includes('tennis') || name.includes('basketball')) {
		return <img src="https://cdn.jsdelivr.net/npm/remixicon@4.9.1/icons/Game%20%26%20Sports/football-fill.svg" className={invertClass} alt="Sports" />;
	}
	if (name.includes('weather') || name.includes('climate')) {
		return <img src="https://cdn.jsdelivr.net/npm/remixicon@4.9.1/icons/Business/cloud-fill.svg" className={invertClass} alt="Weather" />;
	}
	if (name.includes('politic') || name.includes('election') || name.includes('government')) {
		return <img src="https://cdn.jsdelivr.net/npm/remixicon@4.9.1/icons/Buildings/government-fill.svg" className={invertClass} alt="Politics" />;
	}
	if (name.includes('entertainment') || name.includes('movie') || name.includes('music') || name.includes('pop') || name.includes('tv')) {
		return <img src="https://cdn.jsdelivr.net/npm/remixicon@4.9.1/icons/Media/clapperboard-fill.svg" className={invertClass} alt="Entertainment" />;
	}
	if (name.includes('finance') || name.includes('econ') || name.includes('stock') || name.includes('market')) {
		return <img src="https://cdn.jsdelivr.net/npm/remixicon@4.9.1/icons/Finance/stock-fill.svg" className={invertClass} alt="Finance" />;
	}
	if (name.includes('news') || name.includes('world') || name.includes('global')) {
		return <img src="https://cdn.jsdelivr.net/npm/remixicon@4.9.1/icons/Document/newspaper-fill.svg" className={invertClass} alt="News" />;
	}
	if (name.includes('tech') || name.includes('science') || name.includes('space')) {
		return <img src="https://cdn.jsdelivr.net/npm/remixicon@4.9.1/icons/Device/macbook-fill.svg" className={invertClass} alt="Technology" />;
	}
	if (name.includes('game') || name.includes('esport')) {
		return <img src="https://cdn.jsdelivr.net/npm/remixicon@4.9.1/icons/Game%20%26%20Sports/gamepad-fill.svg" className={invertClass} alt="Gaming" />;
	}
	if (name.includes('trending') || name.includes('hot')) {
		return <img src="https://cdn.jsdelivr.net/npm/remixicon@4.9.1/icons/Weather/fire-fill.svg" className={invertClass} alt="Trending" />;
	}
	
	// Default icon
	return <img src="https://cdn.jsdelivr.net/npm/remixicon@4.9.1/icons/System/hashtag.svg" className={invertClass} alt="Category" />;
};
