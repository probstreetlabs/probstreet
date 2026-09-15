import { Link } from 'react-router-dom';
import NotFoundIcon from '@/assets/images/404.avif';

export default function NotFoundPage() {
	return (
		<div className="flex flex-col items-center justify-center md:min-h-[88vh] min-h-[84vh] text-center px-2 bg-[#f4f4f5] dark:bg-[#090C1A]">
			<img src={NotFoundIcon} alt="404 Not Found" className="md:w-80 w-70 mb-6" />
			<h1 className="md:text-4xl text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
				Uh oh!
			</h1>
			<p className="mb-6 md:text-base text-xs text-[#757575] dark:text-gray-400">
				Sorry, the page you were looking for was not found
			</p>
			<Link
				to="/"
				className="px-8 py-2.5 md:text-sm text-xs font-semibold bg-[#262626] dark:bg-white text-white dark:text-black rounded-md transition duration-200"
			>
				Go to Home
			</Link>
		</div>
	);
}
