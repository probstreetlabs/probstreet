import { prisma } from './index';

async function seedDB() {
	const data = [
		{ id: '11111111-1111-1111-1111-111111111111', categoryName: 'Sports' },
		{ id: '22222222-2222-2222-2222-222222222222', categoryName: 'Crypto' },
		{ id: '33333333-3333-3333-3333-333333333333', categoryName: 'Tech' },
		{ id: '44444444-4444-4444-4444-444444444444', categoryName: 'Stocks' },
		{ id: '55555555-5555-5555-5555-555555555555', categoryName: 'Politics' },
		{ id: '66666666-6666-6666-6666-666666666666', categoryName: 'Economy' },
		{ id: '77777777-7777-7777-7777-777777777777', categoryName: 'Weather' },
		{ id: '88888888-8888-8888-8888-888888888888', categoryName: 'Science' },
	];

	for (const item of data) {
		await prisma.category.upsert({
			where: { id: item.id },
			update: {},
			create: item,
		});
	}

	console.log('✅ Categories seeded successfully');
}

seedDB().then(() => process.exit(0));
