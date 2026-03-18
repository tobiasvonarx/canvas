<script lang="ts">
	import { onMount } from 'svelte';
	import { ExternalLink } from 'lucide-svelte';

	interface Props {
		config: Record<string, unknown>;
	}

	let { config }: Props = $props();

	let feedUrl = $derived((config.feedUrl as string) || 'https://hnrss.org/frontpage?count=10');
	let maxItems = $derived((config.maxItems as number) || 10);

	interface FeedItem {
		title: string;
		link: string;
		pubDate?: string;
	}

	let feedItems = $state<FeedItem[]>([]);
	let loading = $state(true);
	let error = $state('');

	async function fetchFeed() {
		loading = true;
		error = '';
		try {
			// Use local SvelteKit API route to proxy RSS feeds (avoids CORS)
			const res = await fetch(`/api/rss?url=${encodeURIComponent(feedUrl)}`);
			if (!res.ok) throw new Error('Failed to fetch');
			const text = await res.text();
			const parser = new DOMParser();
			const doc = parser.parseFromString(text, 'text/xml');

			const items: FeedItem[] = [];
			// Try RSS format
			const rssItems = doc.querySelectorAll('item');
			if (rssItems.length > 0) {
				rssItems.forEach((el) => {
					if (items.length >= maxItems) return;
					items.push({
						title: el.querySelector('title')?.textContent || '',
						link: el.querySelector('link')?.textContent || '',
						pubDate: el.querySelector('pubDate')?.textContent || undefined
					});
				});
			} else {
				// Try Atom format
				const entries = doc.querySelectorAll('entry');
				entries.forEach((el) => {
					if (items.length >= maxItems) return;
					items.push({
						title: el.querySelector('title')?.textContent || '',
						link: el.querySelector('link')?.getAttribute('href') || '',
						pubDate: el.querySelector('published')?.textContent || undefined
					});
				});
			}

			feedItems = items;
		} catch (e) {
			error = 'Failed to load feed';
		}
		loading = false;
	}

	function openLink(e: MouseEvent, url: string) {
		e.preventDefault();
		e.stopPropagation();
		window.open(url, '_blank');
	}

	onMount(() => {
		fetchFeed();
		const interval = setInterval(fetchFeed, 5 * 60 * 1000);
		return () => clearInterval(interval);
	});
</script>

<div class="rss-feed">
	{#if loading && feedItems.length === 0}
		<div class="loading">Loading feed...</div>
	{:else if error && feedItems.length === 0}
		<div class="error">{error}</div>
	{:else}
		<ul class="feed-list">
			{#each feedItems as feedItem, i}
				<li>
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<a
						href={feedItem.link}
						target="_blank"
						rel="noopener noreferrer"
						class="feed-item"
						onclick={(e) => openLink(e, feedItem.link)}
					>
						<span class="item-index">{i + 1}.</span>
						<span class="item-title">{feedItem.title}</span>
						<ExternalLink size={12} />
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.rss-feed {
		height: 100%;
		overflow-y: auto;
	}

	.loading, .error {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		font-size: 12px;
		color: var(--color-text-tertiary);
	}

	.error {
		color: var(--color-danger);
	}

	.feed-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.feed-item {
		display: flex;
		align-items: baseline;
		gap: 6px;
		padding: 6px 4px;
		font-size: 12px;
		line-height: 1.4;
		color: var(--color-text);
		text-decoration: none;
		border-radius: 4px;
		transition: background 0.1s;
		cursor: pointer;
	}

	.feed-item:hover {
		background: var(--color-surface-hover);
	}

	.item-index {
		color: var(--color-text-tertiary);
		font-size: 11px;
		flex-shrink: 0;
		min-width: 18px;
		text-align: right;
	}

	.item-title {
		flex: 1;
	}

	.feed-item :global(svg) {
		flex-shrink: 0;
		color: var(--color-text-tertiary);
		opacity: 0;
		transition: opacity 0.1s;
	}

	.feed-item:hover :global(svg) {
		opacity: 1;
	}
</style>
