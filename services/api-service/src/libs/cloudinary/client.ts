import { ENV } from '@/config/env';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
	cloudinary_url: ENV.CLOUDINARY_URL,
});

export { cloudinary };
