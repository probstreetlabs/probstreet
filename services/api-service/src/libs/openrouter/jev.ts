import { ENV } from '@/config/env';
import { OpenRouter } from '@openrouter/sdk';
import { Market } from '@probstreet/database';
import { AIEvaluation } from '@/libs/oracle/types';

let openrouterClient: OpenRouter | null = null;

function getOpenRouterClient() {
	if (!openrouterClient) {
		if (!ENV.OPENROUTER_API_KEY) {
			throw new Error('OPENROUTER_API_KEY is required when USE_JEV_ORACLE_RESOLVER is true');
		}
		openrouterClient = new OpenRouter({
			apiKey: ENV.OPENROUTER_API_KEY,
		});
	}
	return openrouterClient;
}

export async function evaluateWithJev(evidence: string, market: Market): Promise<AIEvaluation> {
	const openrouter = getOpenRouterClient();

	const rules = market.rules || market.eos || 'No specific rules provided.';
	const sourceOfTruth = market.sourceOfTruth || 'General web search';
	const stateContext = `MARKET TITLE: "${market.title}"\nRESOLUTION RULES: "${rules}"\nSOURCE OF TRUTH: "${sourceOfTruth}"\nEVIDENCE:\n${evidence}`;

	try {
		const decision = await openrouter.alpha.decisions.create({
			decisionsRequest: {
				model: '~typesafe/jev-latest',
				state: stateContext,
				questions: {
					verdict: {
						type: 'choice',
						instructions: 'Based on the evidence, what is the definitive outcome of the market?',
						criteria: {
							YES: 'The evidence conclusively proves the YES condition.',
							NO: 'The evidence conclusively proves the NO condition.',
							INCONCLUSIVE: 'The evidence is ambiguous, contradictory, or insufficient.',
						},
					},
				},
			},
		});

		const verdictAnswer = decision.answers.verdict;

		if (verdictAnswer.type !== 'choice') {
			throw new Error('Jev API returned an unexpected answer type for verdict');
		}

		const choice = verdictAnswer.choice;

		const probability = verdictAnswer.probabilities?.[choice] ?? 0;
		const totalScore = probability * 100;

		return {
			verdict: choice as 'YES' | 'NO' | 'INCONCLUSIVE',
			totalScore: totalScore,
			rubricScores: {
				eventCompletion: 0,
				sourceAuthority: 0,
				ruleMatch: 0,
				dataClarity: 0,
				corroboration: 0,
			},
			reasoning: `Resolved via Jev probabilistic evaluation. Selected ${choice} with ${totalScore.toFixed(2)}% confidence.`,
		};
	} catch (error: any) {
		throw new Error(`Failed to evaluate with Jev: ${error.message}`);
	}
}
