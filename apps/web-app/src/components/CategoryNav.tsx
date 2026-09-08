import { useAuthStore } from '@/store/auth';
import { useModalStore } from '@/store/modal';
import { getAllCategoary } from '@/api/category';
import { Archive, Bookmark } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';

interface Category {
	id: string;
	categoryName: string;
}

export default function CategoryNav() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const location = useLocation();
	const selectedCategoryName = searchParams.get('category') || 'All Events';

	const { isAuthenticated } = useAuthStore();
	const { openOnboardModal } = useModalStore();

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const response = await getAllCategoary();
				setCategories([{ id: 'all', categoryName: 'All Events' }, ...response.data.data]);
			} catch (err) {
				console.error('Error fetching categories:', err);
			}
		};

		fetchCategories();
	}, []);

	const handleCategoryChange = (name: string) => {
		if (name === 'Wishlist' && !isAuthenticated) {
			openOnboardModal();
			return;
		}

		if (name === 'All Events') {
			if (location.pathname !== '/events') {
				navigate('/events');
			} else {
				navigate('/events', { replace: true });
			}
		} else {
			if (location.pathname !== '/events') {
				navigate(`/events?category=${encodeURIComponent(name)}`);
			} else {
				navigate(`/events?category=${encodeURIComponent(name)}`, { replace: true });
			}
		}
	};

	return (
		<div className="w-full dark:bg-[#090C1A] border-b border-gray-100 dark:border-gray-800 transition-colors">
			<div className="w-full px-6">
				<div className="max-w-7xl mx-auto h-12 flex items-center gap-6 overflow-x-auto scrollbar-hide">
					{categories.map((cat, index) => (
						<React.Fragment key={cat.id}>
							<button
								onClick={() => handleCategoryChange(cat.categoryName)}
								className={`relative h-full flex items-center md:text-sm text-xs whitespace-nowrap transition-colors duration-300 cursor-pointer ${
									selectedCategoryName === cat.categoryName
										? 'text-black dark:text-white font-medium'
										: 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
								}`}
							>
								{cat.categoryName}
								{selectedCategoryName === cat.categoryName && (
									<span className="absolute left-0 right-0 bottom-0 h-0.5 bg-black dark:bg-white transition-colors" />
								)}
							</button>
							{index === 0 && <div className="h-5 w-px bg-gray-300 dark:bg-gray-700 shrink-0" />}
						</React.Fragment>
					))}

					<div className="h-5 w-px bg-gray-300 dark:bg-gray-700 shrink-0" />

					<button
						onClick={() => handleCategoryChange('Wishlist')}
						className={`relative h-full flex items-center gap-2 md:text-sm text-xs whitespace-nowrap transition-colors duration-300 cursor-pointer shrink-0 ${
							selectedCategoryName === 'Wishlist'
								? 'text-black dark:text-white font-medium'
								: 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
						}`}
					>
						<Bookmark size={16} />
						Wishlist
						{selectedCategoryName === 'Wishlist' && (
							<span className="absolute left-0 right-0 bottom-0 h-0.5 bg-black dark:bg-white transition-colors" />
						)}
					</button>

					<div className="h-5 w-px bg-gray-300 dark:bg-gray-700 shrink-0" />

					<button
						onClick={() => handleCategoryChange('Resolved Events')}
						className={`relative h-full flex items-center gap-2 md:text-sm text-xs whitespace-nowrap transition-colors duration-300 cursor-pointer shrink-0 ${
							selectedCategoryName === 'Resolved Events'
								? 'text-black dark:text-white font-medium'
								: 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
						}`}
					>
						<Archive size={16} />
						Resolved Events
						{selectedCategoryName === 'Resolved Events' && (
							<span className="absolute left-0 right-0 bottom-0 h-0.5 bg-black dark:bg-white transition-colors" />
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
