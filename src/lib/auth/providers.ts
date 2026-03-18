/**
 * AI provider definitions. Both OpenRouter and OpenAI use the
 * OpenAI-compatible /v1/chat/completions format.
 */

export type AIProvider = 'openrouter' | 'openai';

export interface ModelOption {
	id: string;
	name: string;
}

export interface ProviderConfig {
	name: string;
	apiUrl: string;
	models: ModelOption[];
	authMethod: 'oauth' | 'apikey';
	keyHelpUrl: string;
}

export const PROVIDERS: Record<AIProvider, ProviderConfig> = {
	openrouter: {
		name: 'OpenRouter',
		apiUrl: 'https://openrouter.ai/api/v1',
		models: [
			{ id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4' },
			{ id: 'anthropic/claude-haiku-4', name: 'Claude Haiku 4' },
			{ id: 'openai/gpt-4o', name: 'GPT-4o' },
			{ id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' },
			{ id: 'google/gemini-2.5-pro-preview', name: 'Gemini 2.5 Pro' },
			{ id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B' }
		],
		authMethod: 'oauth',
		keyHelpUrl: 'https://openrouter.ai/keys'
	},
	openai: {
		name: 'OpenAI',
		apiUrl: 'https://api.openai.com/v1',
		models: [
			{ id: 'gpt-4o', name: 'GPT-4o' },
			{ id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
			{ id: 'o3-mini', name: 'o3-mini' }
		],
		authMethod: 'apikey',
		keyHelpUrl: 'https://platform.openai.com/api-keys'
	}
};

/** Settings keys for each provider's token in IndexedDB */
export const TOKEN_KEYS: Record<AIProvider, string> = {
	openrouter: 'openrouter-token',
	openai: 'openai-token'
};

export const SETTINGS_KEYS = {
	PROVIDER: 'ai-provider',
	MODEL: 'ai-model'
} as const;
