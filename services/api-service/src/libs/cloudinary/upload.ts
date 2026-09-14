import { cloudinary } from './client';

export const generateUploadSignature = (folder: string) => {
	const timestamp = Math.round(new Date().getTime() / 1000);
	const signature = cloudinary.utils.api_sign_request(
		{
			timestamp,
			folder,
		},
		cloudinary.config().api_secret as string,
	);

	return {
		timestamp,
		signature,
		cloudName: cloudinary.config().cloud_name,
		apiKey: cloudinary.config().api_key,
		folder,
	};
};

export const generateThumbnailUploadSignature = () => {
	return generateUploadSignature('probstreet/market-thumbnails');
};

export const generateAvatarUploadSignature = () => {
	return generateUploadSignature('probstreet/user-avatars');
};
