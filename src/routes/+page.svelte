<script lang="ts">
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme';

	const splashes = [
		'Where sticky notes meet infinity',
		'Your browser is your office now',
		'No signup required. Ever.',
		'Ctrl+Z friendly',
		'Now with 100% less cloud',
		'Offline? No problem.',
		'Drag. Drop. Think.',
		'Runs on localhost and vibes',
		'Not another SaaS',
		'Made by humans, for humans',
		'Zero telemetry, maximum chill',
		'Your thoughts deserve a home',
		'Like a whiteboard, but better',
		'No AI trained on your data',
		'Put a clock next to your todo list',
		'Free as in freedom',
		'Tab hoarders welcome',
		'Finally, a dashboard that stays put',
		'One surface to rule them all',
		'Less tabs, more focus',
		'Works on a plane',
	];

	let visible = $state(false);
	let splash = $state(splashes[Math.floor(Math.random() * splashes.length)]);
	let splashVisible = $state(false);

	onMount(() => {
		visible = true;
		setTimeout(() => { splashVisible = true; }, 600);
	});
</script>

<svelte:head>
	<title>Canvas - A place where your thoughts live</title>
	<meta name="description" content="A free, open-source infinite canvas that lives on your computer. Notes, todos, RSS, timers, weather - all on one surface. Local-first, private, yours." />
</svelte:head>

<div class="landing" class:visible>
	<!-- Nav -->
	<nav>
		<div class="nav-brand"><img src="/canvas_logo_transparent.png" alt="Canvas" class="nav-logo" />Canvas</div>
		<div class="nav-links">
			<a href="https://github.com/tobiasvonarx/canvas" target="_blank" rel="noopener">GitHub</a>
			<button class="theme-toggle" onclick={() => theme.toggle()} aria-label="Toggle theme">
				{#if $theme === 'dark'}
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
				{:else}
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
				{/if}
			</button>
			<a href="/app" class="nav-cta">Open Canvas</a>
		</div>
	</nav>

	<!-- Hero -->
	<section class="hero">
		<h1>A place where your<br/>thoughts live.</h1>
		<p class="splash" class:splashVisible>{splash}</p>
		<p class="subtitle">
			Notes, todos, feeds, timers, all on a single canvas. No cloud. No account. Just your browser.
		</p>
		<div class="hero-actions">
			<a href="/app" class="btn-primary">Open Canvas</a>
			<a href="https://github.com/tobiasvonarx/canvas" target="_blank" rel="noopener" class="btn-secondary">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
				Star on GitHub
			</a>
		</div>
	</section>

	<!-- Features grid -->
	<section class="features">
		<div class="feature">
			<div class="feature-icon">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>
			</div>
			<h3>Infinite canvas</h3>
			<p>Drag anything onto it. Notes, todos, feeds, timers. Pan, zoom, scatter things around. It's a temporary dump for your brain that welcomes messy thoughts.</p>
		</div>
		<div class="feature">
			<div class="feature-icon">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
			</div>
			<h3>Local-first</h3>
			<p>Everything stays in your browser. No accounts, no cloud, no tracking. Nothing phones home unless you choose to connect an AI provider.</p>
		</div>
		<div class="feature">
			<div class="feature-icon">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
			</div>
			<h3>Modular widgets</h3>
			<p>Notes, todos, RSS, weather, pomodoro, clock, and more coming from the community. Build your own in minutes.</p>
		</div>
		<div class="feature">
			<div class="feature-icon">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
			</div>
			<h3>AI chat (optional)</h3>
			<p>Bring your own API key to chat with your canvas. Create widgets, modify existing ones, or ask questions. Fully opt-in. Canvas works great without it.</p>
		</div>
		<div class="feature">
			<div class="feature-icon">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 14h4v7H4zM10 10h4v11h-4zM16 6h4v15h-4z"/></svg>
			</div>
			<h3>Works offline</h3>
			<p>No server, no connection needed. Canvas boots instantly and runs entirely in your browser, even on a plane.</p>
		</div>
		<div class="feature">
			<div class="feature-icon">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
			</div>
			<h3>Open source</h3>
			<p>MIT licensed, community-driven. Read every line, fork it, extend it, share your widgets with everyone.</p>
		</div>
	</section>

	<!-- Philosophy -->
	<section class="philosophy">
		<h2>Why Canvas?</h2>
		<div class="philosophy-grid">
			<div class="philosophy-card">
				<h3>Your desk, not a service</h3>
				<p>
					Canvas is a place, not a platform. It runs on your machine, boots instantly, works offline, and will never go down because a startup ran out of funding. Some tools are better as places than as services.
				</p>
			</div>
			<div class="philosophy-card">
				<h3>Unstructured by design</h3>
				<p>
					Your brain doesn't think in databases. Canvas is a spatial, freeform workspace where things live where you put them. Scattered, overlapping, clustered in ways that make sense to you. No templates, no schemas, no wrong way to use it.
				</p>
			</div>
			<div class="philosophy-card">
				<h3>Community-driven</h3>
				<p>
					Canvas is built by its users. Every widget, feature, and improvement comes from the community. We're building toward an open widget marketplace where anyone can share what they've made.
				</p>
			</div>
		</div>
	</section>

	<!-- CTA -->
	<section class="cta">
		<h2>Organize your thoughts. Or don't.</h2>
		<p>It's your canvas.</p>
		<a href="/app" class="btn-primary btn-large">Get started</a>
	</section>

	<!-- Footer -->
	<footer>
		<div class="footer-content">
			<span>Canvas is open source</span>
			<span class="footer-sep">&bull;</span>
			<a href="https://github.com/tobiasvonarx/canvas" target="_blank" rel="noopener">GitHub</a>
			<span class="footer-sep">&bull;</span>
			<a href="https://github.com/tobiasvonarx/canvas/issues" target="_blank" rel="noopener">Report an issue</a>
		</div>
	</footer>
</div>

<style>
	.landing {
		min-height: 100vh;
		overflow-y: auto;
		position: fixed;
		inset: 0;
		opacity: 0;
		transition: opacity 0.5s ease;
	}

	.landing.visible {
		opacity: 1;
	}

	/* Nav */
	nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 40px;
		max-width: 960px;
		margin: 0 auto;
	}

	.nav-brand {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 15px;
		font-weight: 600;
		color: var(--color-text);
		letter-spacing: 0.5px;
	}

	.nav-logo {
		width: 22px;
		height: 22px;
	}

	:global(.dark) .nav-logo {
		filter: invert(1);
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 24px;
	}

	.nav-links a {
		font-size: 13px;
		color: var(--color-text-secondary);
		text-decoration: none;
		transition: color 0.15s;
	}

	.nav-links a:hover {
		color: var(--color-text);
	}

	.theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 6px;
		border: 1px solid var(--color-border);
		background: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: color 0.15s, border-color 0.15s;
	}

	.theme-toggle:hover {
		color: var(--color-text);
		border-color: var(--color-border-strong);
	}

	.nav-cta {
		padding: 6px 14px;
		border-radius: 6px;
		background: var(--color-text);
		color: var(--color-bg) !important;
		font-weight: 500;
	}

	.nav-cta:hover {
		opacity: 0.85;
	}

	/* Hero */
	.hero {
		text-align: center;
		padding: 100px 40px 80px;
		max-width: 640px;
		margin: 0 auto;
	}

	.hero h1 {
		font-size: 48px;
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: -1.5px;
		color: var(--color-text);
	}

	.splash {
		margin-top: 14px;
		font-size: 14px;
		font-style: italic;
		color: var(--color-text-tertiary);
		opacity: 0;
		transform: translateY(4px);
		transition: opacity 0.6s ease, transform 0.6s ease;
	}

	.splash.splashVisible {
		opacity: 1;
		transform: translateY(0);
	}

	.subtitle {
		margin-top: 16px;
		font-size: 17px;
		line-height: 1.6;
		color: var(--color-text-secondary);
		max-width: 480px;
		margin-left: auto;
		margin-right: auto;
	}

	.hero-actions {
		margin-top: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		padding: 10px 24px;
		border-radius: 8px;
		background: var(--color-text);
		color: var(--color-bg);
		font-size: 14px;
		font-weight: 500;
		text-decoration: none;
		transition: opacity 0.15s;
	}

	.btn-primary:hover {
		opacity: 0.85;
	}

	.btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 20px;
		border-radius: 8px;
		border: 1px solid var(--color-border);
		background: transparent;
		color: var(--color-text);
		font-size: 14px;
		font-weight: 500;
		text-decoration: none;
		transition: border-color 0.15s, background 0.15s;
	}

	.btn-secondary:hover {
		border-color: var(--color-border-strong);
		background: var(--color-bg-secondary);
	}

	.btn-large {
		padding: 14px 32px;
		font-size: 15px;
		border-radius: 10px;
	}

	/* Features */
	.features {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
		max-width: 840px;
		margin: 0 auto;
		padding: 0 40px 80px;
	}

	.feature {
		padding: 28px;
		border-radius: 12px;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
	}

	.feature-icon {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		background: var(--color-bg-secondary);
		color: var(--color-text-secondary);
		margin-bottom: 16px;
	}

	.feature h3 {
		font-size: 15px;
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 8px;
	}

	.feature p {
		font-size: 13px;
		line-height: 1.5;
		color: var(--color-text-secondary);
	}

	/* Philosophy */
	.philosophy {
		max-width: 720px;
		margin: 0 auto;
		padding: 0 40px 80px;
	}

	.philosophy h2 {
		font-size: 28px;
		font-weight: 700;
		letter-spacing: -0.5px;
		text-align: center;
		margin-bottom: 36px;
	}

	.philosophy-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
	}

	.philosophy-card {
		padding: 24px;
		border-radius: 12px;
		background: var(--color-bg-secondary);
	}

	.philosophy-card h3 {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 10px;
		color: var(--color-text);
	}

	.philosophy-card p {
		font-size: 13px;
		line-height: 1.55;
		color: var(--color-text-secondary);
	}

	/* CTA */
	.cta {
		text-align: center;
		padding: 60px 40px 80px;
	}

	.cta h2 {
		font-size: 32px;
		font-weight: 700;
		letter-spacing: -0.5px;
	}

	.cta p {
		margin-top: 8px;
		font-size: 17px;
		color: var(--color-text-secondary);
		margin-bottom: 32px;
	}

	/* Footer */
	footer {
		border-top: 1px solid var(--color-border);
		padding: 24px 40px;
	}

	.footer-content {
		max-width: 720px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-size: 12px;
		color: var(--color-text-tertiary);
	}

	.footer-content a {
		color: var(--color-text-secondary);
		text-decoration: none;
	}

	.footer-content a:hover {
		color: var(--color-text);
	}

	.footer-sep {
		color: var(--color-border-strong);
	}

	/* Responsive */
	@media (max-width: 640px) {
		nav {
			padding: 16px 20px;
		}

		.hero {
			padding: 60px 20px 60px;
		}

		.hero h1 {
			font-size: 32px;
			letter-spacing: -1px;
		}

		.subtitle {
			font-size: 15px;
		}

		.hero-actions {
			flex-direction: column;
		}

		.features {
			grid-template-columns: 1fr;
			padding: 0 20px 60px;
		}

		.philosophy {
			padding: 0 20px 60px;
		}

		.philosophy-grid {
			grid-template-columns: 1fr;
		}

		.cta {
			padding: 40px 20px 60px;
		}

		.cta h2 {
			font-size: 24px;
		}

		footer {
			padding: 20px;
		}
	}
</style>
