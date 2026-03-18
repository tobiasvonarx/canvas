/**
 * OpenRouter OAuth PKCE flow initiation.
 * Generates a PKCE pair, stores the verifier in sessionStorage,
 * and redirects the user to OpenRouter's auth page.
 */
import { generateCodeVerifier, generateCodeChallenge } from './pkce';

const SESSION_KEY = 'openrouter-pkce-verifier';

export async function startOpenRouterAuth(): Promise<void> {
	const verifier = generateCodeVerifier();
	const challenge = await generateCodeChallenge(verifier);

	// Store verifier in sessionStorage (tab-scoped, survives redirect)
	sessionStorage.setItem(SESSION_KEY, verifier);

	const callbackUrl = `${window.location.origin}/auth/callback`;
	const params = new URLSearchParams({
		callback_url: callbackUrl,
		code_challenge: challenge,
		code_challenge_method: 'S256'
	});

	window.location.href = `https://openrouter.ai/auth?${params.toString()}`;
}

/** Retrieve and clear the stored PKCE verifier after redirect. */
export function consumeCodeVerifier(): string | null {
	const verifier = sessionStorage.getItem(SESSION_KEY);
	if (verifier) {
		sessionStorage.removeItem(SESSION_KEY);
	}
	return verifier;
}
