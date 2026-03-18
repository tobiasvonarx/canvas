<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		config: Record<string, unknown>;
	}

	let { config }: Props = $props();

	let menuSource = $derived((config.source as string) || 'West Hub Cambridge');
	let menuItems = $state<string[]>([]);
	let loading = $state(true);

	onMount(() => {
		// Simulated menu — in production this would fetch from an actual API
		// The user can configure the source, and the AI chat can help set up real fetching
		loading = false;
		const day = new Date().getDay();
		const menus: Record<number, string[]> = {
			1: ['Grilled chicken with roasted vegetables', 'Mushroom risotto (v)', 'Fish & chips', 'Caesar salad'],
			2: ['Beef stir-fry with noodles', 'Vegetable curry (v)', 'Baked salmon', 'Greek salad'],
			3: ['Lamb tagine with couscous', 'Pasta primavera (v)', 'Grilled sea bass', 'Quinoa bowl'],
			4: ['Chicken tikka masala', 'Aubergine parmigiana (v)', 'Pan-fried cod', 'Thai green curry'],
			5: ['Fish pie', 'Mushroom Wellington (v)', 'Roast chicken', 'Minestrone soup']
		};
		menuItems = menus[day] || ['Menu not available for today'];
	});
</script>

<div class="lunch-menu">
	<div class="menu-source">{menuSource}</div>
	<div class="menu-label">Today's Lunch</div>
	{#if loading}
		<div class="loading">Loading menu...</div>
	{:else}
		<ul class="menu-list">
			{#each menuItems as menuItem}
				<li class="menu-item">{menuItem}</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.lunch-menu {
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.menu-source {
		font-size: 11px;
		color: var(--color-text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.menu-label {
		font-size: 14px;
		font-weight: 500;
	}

	.loading {
		font-size: 12px;
		color: var(--color-text-tertiary);
	}

	.menu-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.menu-item {
		font-size: 13px;
		line-height: 1.4;
		padding: 6px 8px;
		background: var(--color-bg-secondary);
		border-radius: 6px;
	}
</style>
