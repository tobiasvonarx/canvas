<script lang="ts">
	import { getWidget } from './registry';
	import { isScheduleActive } from '$lib/scheduler';
	import type { CanvasItem, WidgetData } from '$lib/types';
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		item: CanvasItem;
	}

	let { item }: Props = $props();
	let data = $derived(item.data as WidgetData);
	let definition = $derived(getWidget(data.widgetType));
	let visible = $state(true);
	let interval: ReturnType<typeof setInterval>;

	function checkSchedule() {
		visible = isScheduleActive(data.schedule);
	}

	onMount(() => {
		checkSchedule();
		interval = setInterval(checkSchedule, 30000);
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});
</script>

{#if definition}
	{#if visible}
		<div class="widget-container">
			<div class="widget-header">
				<span class="widget-name">{definition.name}</span>
			</div>
			<div class="widget-body">
				<definition.component config={data.config} size={{ width: item.width, height: item.height }} />
			</div>
		</div>
	{:else}
		<div class="widget-hidden">
			<span class="widget-name">{definition.name}</span>
			<span class="hidden-label">Scheduled — not active now</span>
		</div>
	{/if}
{:else}
	<div class="widget-error">
		<span>Unknown widget: {data.widgetType}</span>
	</div>
{/if}

<style>
	.widget-container {
		width: 100%;
		height: 100%;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.widget-header {
		padding: 8px 12px;
		border-bottom: 1px solid var(--color-border);
		display: flex;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
	}

	.widget-name {
		font-size: 12px;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.widget-body {
		flex: 1;
		overflow: auto;
		padding: 12px;
	}

	.widget-hidden {
		width: 100%;
		height: 100%;
		background: var(--color-bg-secondary);
		border: 1px dashed var(--color-border);
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		opacity: 0.5;
	}

	.hidden-label {
		font-size: 11px;
		color: var(--color-text-tertiary);
	}

	.widget-error {
		width: 100%;
		height: 100%;
		background: var(--color-surface);
		border: 1px solid var(--color-danger);
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-danger);
		font-size: 12px;
	}
</style>
