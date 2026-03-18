<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { consumeCodeVerifier } from '$lib/auth/openrouter';
	import { setSetting } from '$lib/auth/settings';
	import { TOKEN_KEYS } from '$lib/auth/providers';

	let status = $state<'loading' | 'error'>('loading');
	let errorMessage = $state('');

	onMount(async () => {
		const code = $page.url.searchParams.get('code');
		const codeVerifier = consumeCodeVerifier();

		if (!code) {
			status = 'error';
			errorMessage = 'No authorization code received from OpenRouter.';
			return;
		}

		if (!codeVerifier) {
			status = 'error';
			errorMessage = 'PKCE verifier not found. The auth session may have expired — please try again.';
			return;
		}

		try {
			const res = await fetch('/api/auth/exchange', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code, code_verifier: codeVerifier })
			});

			if (!res.ok) {
				const errText = await res.text();
				throw new Error(errText || `Exchange failed (${res.status})`);
			}

			const data = await res.json();
			if (!data.key) {
				throw new Error('No API key in response');
			}

			// Store the key in IndexedDB
			await setSetting(TOKEN_KEYS.openrouter, data.key);
			await setSetting('ai-provider', 'openrouter');

			// Redirect to canvas with chat open
			goto('/?auth=success');
		} catch (e) {
			status = 'error';
			errorMessage = (e as Error).message;
		}
	});
</script>

<div class="callback-page">
	{#if status === 'loading'}
		<div class="spinner"></div>
		<p class="message">Connecting to OpenRouter...</p>
	{:else}
		<p class="error-title">Connection Failed</p>
		<p class="error-message">{errorMessage}</p>
		<a href="/" class="back-link">Back to Canvas</a>
	{/if}
</div>

<style>
	.callback-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		gap: 16px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
		background: var(--color-bg, #09090b);
		color: var(--color-text, #fafafa);
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--color-border, #27272a);
		border-top-color: var(--color-accent, #60a5fa);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.message {
		font-size: 14px;
		color: var(--color-text-secondary, #a1a1aa);
	}

	.error-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--color-danger, #f87171);
	}

	.error-message {
		font-size: 13px;
		color: var(--color-text-secondary, #a1a1aa);
		max-width: 400px;
		text-align: center;
	}

	.back-link {
		font-size: 13px;
		color: var(--color-accent, #60a5fa);
		text-decoration: none;
	}

	.back-link:hover {
		text-decoration: underline;
	}
</style>
