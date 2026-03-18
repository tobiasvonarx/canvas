<script lang="ts">
	import type { CanvasItem, LinkData } from '$lib/types';
	import { ExternalLink } from 'lucide-svelte';

	interface Props {
		item: CanvasItem;
	}

	let { item }: Props = $props();
	let data = $derived(item.data as LinkData);

	let hostname = $derived(() => {
		try {
			return new URL(data.url).hostname;
		} catch {
			return data.url;
		}
	});

	function openLink(e: MouseEvent) {
		if (e.detail === 2) {
			window.open(data.url, '_blank');
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="link-card" ondblclick={openLink}>
	<div class="link-icon">
		{#if data.favicon}
			<img src={data.favicon} alt="" width="16" height="16" />
		{:else}
			<ExternalLink size={16} />
		{/if}
	</div>
	<div class="link-info">
		<div class="link-title">{data.title || data.url}</div>
		<div class="link-url">{hostname()}</div>
		{#if data.description}
			<div class="link-desc">{data.description}</div>
		{/if}
	</div>
</div>

<style>
	.link-card {
		width: 100%;
		height: 100%;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 12px;
		display: flex;
		gap: 10px;
		align-items: flex-start;
		cursor: pointer;
		overflow: hidden;
	}

	.link-card:hover {
		background: var(--color-surface-hover);
	}

	.link-icon {
		flex-shrink: 0;
		color: var(--color-text-tertiary);
		margin-top: 2px;
	}

	.link-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.link-title {
		font-size: 13px;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.link-url {
		font-size: 11px;
		color: var(--color-text-tertiary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.link-desc {
		font-size: 12px;
		color: var(--color-text-secondary);
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		margin-top: 2px;
	}
</style>
