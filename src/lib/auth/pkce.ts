/**
 * PKCE (Proof Key for Code Exchange) utilities for OAuth 2.0.
 * Uses Web Crypto API — works in all modern browsers.
 */

function base64urlEncode(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = '';
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Generate a cryptographically random code verifier (43 chars from 32 bytes). */
export function generateCodeVerifier(): string {
	const buffer = new Uint8Array(32);
	crypto.getRandomValues(buffer);
	return base64urlEncode(buffer.buffer);
}

/** Compute SHA-256 code challenge from a verifier (S256 method). */
export async function generateCodeChallenge(verifier: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(verifier);
	const hash = await crypto.subtle.digest('SHA-256', data);
	return base64urlEncode(hash);
}
