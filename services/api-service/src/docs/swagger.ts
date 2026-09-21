export const swaggerDocument = {
	openapi: '3.0.0',
	info: {
		title: 'Probstreet API',
		version: '1.0.0',
		description: 'All APIs for ProbStreet API service',
	},
	servers: [
		{
			url: 'http://localhost:8000',
			description: 'Local server',
		},
		{
			url: 'https://api.probstreet.com',
			description: 'Production server',
		},
	],
	paths: {
		'/api/v1/capi/referral': {
			get: {
				summary: 'GET /api/v1/capi/referral',
				tags: ['referral'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/referral/info': {
			get: {
				summary: 'GET /api/v1/capi/referral/info',
				tags: ['referral'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/referral/submit': {
			post: {
				summary: 'POST /api/v1/capi/referral/submit',
				tags: ['referral'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/referral/leaderboard': {
			get: {
				summary: 'GET /api/v1/capi/referral/leaderboard',
				tags: ['referral'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/payments/webhook': {
			post: {
				summary: 'POST /api/v1/capi/payments/webhook',
				tags: ['payment'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/payments/payout-webhook': {
			post: {
				summary: 'POST /api/v1/capi/payments/payout-webhook',
				tags: ['payment'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/payments/init': {
			post: {
				summary: 'POST /api/v1/capi/payments/init',
				tags: ['payment'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/payments/verify/{orderId}': {
			get: {
				summary: 'GET /api/v1/capi/payments/verify/{orderId}',
				tags: ['payment'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				parameters: [
					{
						name: 'orderId',
						in: 'path',
						required: true,
						schema: {
							type: 'string',
						},
					},
				],
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/balance/get': {
			get: {
				summary: 'GET /api/v1/capi/balance/get',
				tags: ['balance'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/balance/deposit': {
			post: {
				summary: 'POST /api/v1/capi/balance/deposit',
				tags: ['balance'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			get: {
				summary: 'GET /api/v1/capi/balance/deposit',
				tags: ['balance'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/balance/withdraw': {
			post: {
				summary: 'POST /api/v1/capi/balance/withdraw',
				tags: ['balance'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/portfolio': {
			get: {
				summary: 'GET /api/v1/capi/portfolio',
				tags: ['portfolio'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/portfolio/position/{marketId}': {
			get: {
				summary: 'GET /api/v1/capi/portfolio/position/{marketId}',
				tags: ['portfolio'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				parameters: [
					{
						name: 'marketId',
						in: 'path',
						required: true,
						schema: {
							type: 'string',
						},
					},
				],
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/notifications': {
			get: {
				summary: 'GET /api/v1/capi/notifications',
				tags: ['notifications'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/notifications/read': {
			patch: {
				summary: 'PATCH /api/v1/capi/notifications/read',
				tags: ['notifications'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/settings': {
			get: {
				summary: 'GET /api/v1/capi/settings',
				tags: ['settings'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/settings/profile': {
			put: {
				summary: 'PUT /api/v1/capi/settings/profile',
				tags: ['settings'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/settings/account': {
			delete: {
				summary: 'DELETE /api/v1/capi/settings/account',
				tags: ['settings'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/settings/notifications': {
			put: {
				summary: 'PUT /api/v1/capi/settings/notifications',
				tags: ['settings'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/settings/avatar-signature': {
			get: {
				summary: 'GET /api/v1/capi/settings/avatar-signature',
				tags: ['settings'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/aapi/users': {
			get: {
				summary: 'GET /api/v1/aapi/users',
				tags: ['aapi'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/aapi/markets': {
			get: {
				summary: 'GET /api/v1/aapi/markets',
				tags: ['aapi'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/aapi/transactions': {
			get: {
				summary: 'GET /api/v1/aapi/transactions',
				tags: ['aapi'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/aapi/analytics/dashboard': {
			get: {
				summary: 'GET /api/v1/aapi/analytics/dashboard',
				tags: ['aapi'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/aapi/markets/resolve': {
			post: {
				summary: 'POST /api/v1/aapi/markets/resolve',
				tags: ['aapi'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/aapi/oracle/pending': {
			get: {
				summary: 'GET /api/v1/aapi/oracle/pending',
				tags: ['aapi'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/aapi/oracle/confirm': {
			post: {
				summary: 'POST /api/v1/aapi/oracle/confirm',
				tags: ['aapi'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/aapi/sports/fixtures': {
			get: {
				summary: 'GET /api/v1/aapi/sports/fixtures',
				tags: ['aapi'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/aapi/verification/pending': {
			get: {
				summary: 'GET /api/v1/aapi/verification/pending',
				tags: ['aapi'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/aapi/verification/verify': {
			post: {
				summary: 'POST /api/v1/aapi/verification/verify',
				tags: ['aapi'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/aapi/verification/{userId}': {
			get: {
				summary: 'GET /api/v1/aapi/verification/{userId}',
				tags: ['aapi'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				parameters: [
					{
						name: 'userId',
						in: 'path',
						required: true,
						schema: {
							type: 'string',
						},
					},
				],
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/price-alerts': {
			get: {
				summary: 'GET /api/v1/capi/price-alerts',
				tags: ['priceAlerts'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			post: {
				summary: 'POST /api/v1/capi/price-alerts',
				tags: ['priceAlerts'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/price-alerts/{id}': {
			delete: {
				summary: 'DELETE /api/v1/capi/price-alerts/{id}',
				tags: ['priceAlerts'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				parameters: [
					{
						name: 'id',
						in: 'path',
						required: true,
						schema: {
							type: 'string',
						},
					},
				],
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/order/buy': {
			post: {
				summary: 'POST /api/v1/capi/order/buy',
				tags: ['order'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/order/sell': {
			post: {
				summary: 'POST /api/v1/capi/order/sell',
				tags: ['order'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/order/cancel': {
			post: {
				summary: 'POST /api/v1/capi/order/cancel',
				tags: ['order'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/profile/get': {
			get: {
				summary: 'GET /api/v1/capi/profile/get',
				tags: ['profile'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/profile/update': {
			patch: {
				summary: 'PATCH /api/v1/capi/profile/update',
				tags: ['profile'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/profile/watchlist': {
			post: {
				summary: 'POST /api/v1/capi/profile/watchlist',
				tags: ['profile'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			get: {
				summary: 'GET /api/v1/capi/profile/watchlist',
				tags: ['profile'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/profile/watchlist/{marketId}': {
			delete: {
				summary: 'DELETE /api/v1/capi/profile/watchlist/{marketId}',
				tags: ['profile'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				parameters: [
					{
						name: 'marketId',
						in: 'path',
						required: true,
						schema: {
							type: 'string',
						},
					},
				],
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/profile/trades': {
			get: {
				summary: 'GET /api/v1/capi/profile/trades',
				tags: ['profile'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/profile/{username}': {
			get: {
				summary: 'GET /api/v1/capi/profile/{username}',
				tags: ['profile'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				parameters: [
					{
						name: 'username',
						in: 'path',
						required: true,
						schema: {
							type: 'string',
						},
					},
				],
			},
		},
		'/api/v1/capi/onboarding/username/check': {
			get: {
				summary: 'GET /api/v1/capi/onboarding/username/check',
				tags: ['onboarding'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/onboarding/username': {
			post: {
				summary: 'POST /api/v1/capi/onboarding/username',
				tags: ['onboarding'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/onboarding/preferences': {
			post: {
				summary: 'POST /api/v1/capi/onboarding/preferences',
				tags: ['onboarding'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/categories': {
			get: {
				summary: 'GET /api/v1/capi/categories',
				tags: ['categories'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
			},
		},
		'/api/v1/capi/transaction': {
			get: {
				summary: 'GET /api/v1/capi/transaction',
				tags: ['transaction'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/papi/health': {
			get: {
				summary: 'GET /api/v1/papi/health',
				tags: ['health'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
			},
		},
		'/api/v1/papi/health/sentry-test': {
			get: {
				summary: 'GET /api/v1/papi/health/sentry-test',
				tags: ['health'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
			},
		},
		'/api/v1/capi/market': {
			get: {
				summary: 'GET /api/v1/capi/market',
				tags: ['market'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
			},
		},
		'/api/v1/capi/market/category/{categoryParam}': {
			get: {
				summary: 'GET /api/v1/capi/market/category/{categoryParam}',
				tags: ['market'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				parameters: [
					{
						name: 'categoryParam',
						in: 'path',
						required: true,
						schema: {
							type: 'string',
						},
					},
				],
			},
		},
		'/api/v1/capi/market/create': {
			post: {
				summary: 'POST /api/v1/capi/market/create',
				tags: ['market'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/market/liquidity-add': {
			post: {
				summary: 'POST /api/v1/capi/market/liquidity-add',
				tags: ['market'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/market/resolve': {
			post: {
				summary: 'POST /api/v1/capi/market/resolve',
				tags: ['market'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/market/generate-url': {
			post: {
				summary: 'POST /api/v1/capi/market/generate-url',
				tags: ['market'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/market/{symbol}/split': {
			post: {
				summary: 'POST /api/v1/capi/market/{symbol}/split',
				tags: ['market'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				parameters: [
					{
						name: 'symbol',
						in: 'path',
						required: true,
						schema: {
							type: 'string',
						},
					},
				],
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/market/{symbol}/merge': {
			post: {
				summary: 'POST /api/v1/capi/market/{symbol}/merge',
				tags: ['market'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				parameters: [
					{
						name: 'symbol',
						in: 'path',
						required: true,
						schema: {
							type: 'string',
						},
					},
				],
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/market/search': {
			get: {
				summary: 'GET /api/v1/capi/market/search',
				tags: ['market'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
			},
		},
		'/api/v1/capi/market/{symbol}': {
			get: {
				summary: 'GET /api/v1/capi/market/{symbol}',
				tags: ['market'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				parameters: [
					{
						name: 'symbol',
						in: 'path',
						required: true,
						schema: {
							type: 'string',
						},
					},
				],
			},
		},
		'/api/v1/capi/market/{symbol}/live': {
			get: {
				summary: 'GET /api/v1/capi/market/{symbol}/live',
				tags: ['market'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				parameters: [
					{
						name: 'symbol',
						in: 'path',
						required: true,
						schema: {
							type: 'string',
						},
					},
				],
			},
		},
		'/api/v1/capi/market/{symbol}/klines': {
			get: {
				summary: 'GET /api/v1/capi/market/{symbol}/klines',
				tags: ['market'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				parameters: [
					{
						name: 'symbol',
						in: 'path',
						required: true,
						schema: {
							type: 'string',
						},
					},
				],
			},
		},
		'/api/v1/capi/market/{symbol}/proxy-klines': {
			get: {
				summary: 'GET /api/v1/capi/market/{symbol}/proxy-klines',
				tags: ['market'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				parameters: [
					{
						name: 'symbol',
						in: 'path',
						required: true,
						schema: {
							type: 'string',
						},
					},
				],
			},
		},
		'/api/v1/capi/market/{symbol}/trades': {
			get: {
				summary: 'GET /api/v1/capi/market/{symbol}/trades',
				tags: ['market'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				parameters: [
					{
						name: 'symbol',
						in: 'path',
						required: true,
						schema: {
							type: 'string',
						},
					},
				],
			},
		},
		'/api/v1/capi/market/{symbol}/stats': {
			get: {
				summary: 'GET /api/v1/capi/market/{symbol}/stats',
				tags: ['market'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				parameters: [
					{
						name: 'symbol',
						in: 'path',
						required: true,
						schema: {
							type: 'string',
						},
					},
				],
			},
		},
		'/api/v1/capi/market/{symbol}/news': {
			get: {
				summary: 'GET /api/v1/capi/market/{symbol}/news',
				tags: ['market'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				parameters: [
					{
						name: 'symbol',
						in: 'path',
						required: true,
						schema: {
							type: 'string',
						},
					},
				],
			},
		},
		'/api/v1/capi/market/{symbol}/comments': {
			get: {
				summary: 'GET /api/v1/capi/market/{symbol}/comments',
				tags: ['market'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				parameters: [
					{
						name: 'symbol',
						in: 'path',
						required: true,
						schema: {
							type: 'string',
						},
					},
				],
				security: [
					{
						bearerAuth: [],
					},
				],
			},
			post: {
				summary: 'POST /api/v1/capi/market/{symbol}/comments',
				tags: ['market'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				parameters: [
					{
						name: 'symbol',
						in: 'path',
						required: true,
						schema: {
							type: 'string',
						},
					},
				],
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/market/{symbol}/comments/{commentId}': {
			delete: {
				summary: 'DELETE /api/v1/capi/market/{symbol}/comments/{commentId}',
				tags: ['market'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				parameters: [
					{
						name: 'symbol',
						in: 'path',
						required: true,
						schema: {
							type: 'string',
						},
					},
					{
						name: 'commentId',
						in: 'path',
						required: true,
						schema: {
							type: 'string',
						},
					},
				],
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/leaderboard': {
			get: {
				summary: 'GET /api/v1/capi/leaderboard',
				tags: ['leaderboard'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/auth/init-signin': {
			post: {
				summary: 'POST /api/v1/capi/auth/init-signin',
				tags: ['auth'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
			},
		},
		'/api/v1/capi/auth/verify-otp': {
			post: {
				summary: 'POST /api/v1/capi/auth/verify-otp',
				tags: ['auth'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
			},
		},
		'/api/v1/capi/auth/google/callback': {
			post: {
				summary: 'POST /api/v1/capi/auth/google/callback',
				tags: ['auth'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
			},
		},
		'/api/v1/capi/auth/discord/callback': {
			post: {
				summary: 'POST /api/v1/capi/auth/discord/callback',
				tags: ['auth'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
			},
		},
		'/api/v1/capi/auth/telegram/callback': {
			post: {
				summary: 'POST /api/v1/capi/auth/telegram/callback',
				tags: ['auth'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
			},
		},
		'/api/v1/capi/auth/logout': {
			post: {
				summary: 'POST /api/v1/capi/auth/logout',
				tags: ['auth'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/auth/refresh': {
			post: {
				summary: 'POST /api/v1/capi/auth/refresh',
				tags: ['auth'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/auth/me': {
			get: {
				summary: 'GET /api/v1/capi/auth/me',
				tags: ['auth'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/auth/sessions': {
			get: {
				summary: 'GET /api/v1/capi/auth/sessions',
				tags: ['auth'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/auth/logout-all': {
			post: {
				summary: 'POST /api/v1/capi/auth/logout-all',
				tags: ['auth'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/referral/referral-earnings': {
			get: {
				summary: 'GET /api/v1/capi/referral/referral-earnings',
				tags: ['referral'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/verification': {
			get: {
				summary: 'GET /api/v1/capi/verification',
				tags: ['verification'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/verification/status': {
			get: {
				summary: 'GET /api/v1/capi/verification/status',
				tags: ['verification'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/verification/kyc/submit': {
			post: {
				summary: 'POST /api/v1/capi/verification/kyc/submit',
				tags: ['verification'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/verification/payment-method/submit': {
			post: {
				summary: 'POST /api/v1/capi/verification/payment-method/submit',
				tags: ['verification'],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/GenericRequest',
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
		'/api/v1/capi/verification/payment-method/{id}': {
			delete: {
				summary: 'DELETE /api/v1/capi/verification/payment-method/{id}',
				tags: ['verification'],
				parameters: [
					{
						name: 'id',
						in: 'path',
						required: true,
						schema: {
							type: 'string',
						},
					},
				],
				responses: {
					'200': {
						description: 'Successful response',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/SuccessResponse',
								},
							},
						},
					},
					'400': {
						description: 'Bad Request / Validation Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
					'500': {
						description: 'Internal Server Error',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/ErrorResponse',
								},
							},
						},
					},
				},
				security: [
					{
						bearerAuth: [],
					},
				],
			},
		},
	},
	components: {
		securitySchemes: {
			bearerAuth: {
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
			},
		},
		schemas: {
			SuccessResponse: {
				type: 'object',
				properties: {
					success: {
						type: 'boolean',
						example: true,
					},
					data: {
						type: 'object',
						additionalProperties: true,
						description: 'Response payload',
					},
					message: {
						type: 'string',
						example: 'Operation successful',
					},
				},
			},
			ErrorResponse: {
				type: 'object',
				properties: {
					success: {
						type: 'boolean',
						example: false,
					},
					message: {
						type: 'string',
						example: 'An error occurred',
					},
					error: {
						type: 'string',
						example: 'Error details',
					},
				},
			},
			GenericRequest: {
				type: 'object',
				description:
					'Generic request payload. Please refer to API documentation for specific fields.',
				additionalProperties: true,
			},
		},
	},
};
