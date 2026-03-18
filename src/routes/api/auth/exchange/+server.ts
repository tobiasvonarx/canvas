import type { RequestHandler } from './$types';

/**
 * Server-side OAuth code exchange for OpenRouter.
 * Receives the authorization code + PKCE verifier from the client,
 * exchanges them with OpenRouter for an API key.
 */
export const POST: RequestHandler = async ({ request }) => {
	let body: { code: string; code_verifier: string };
	try {
		body = await request.json();
	} catch {
		return new Response('Invalid JSON', { status: 400 });
	}

	const { code, code_verifier } = body;
	if (!code || !code_verifier) {
		return new Response('Missing code or code_verifier', { status: 400 });
	}

	try {
		const res = await fetch('https://openrouter.ai/api/v1/auth/keys', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				code,
				code_verifier,
				code_challenge_method: 'S256'
			})
		});

		if (!res.ok) {
			const errText = await res.text();
			return new Response(errText, { status: res.status });
		}

		const data = await res.json();
		return new Response(JSON.stringify({ key: data.key }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e) {
		return new Response(`Exchange failed: ${(e as Error).message}`, { status: 502 });
	}
};
