<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		config: Record<string, unknown>;
	}

	let { config }: Props = $props();

	let menuUrl = $derived((config.menuUrl as string) || '');
	let cantineName = $derived((config.name as string) || 'Canteen');
	let menuItems = $state<string[]>([]);
	let loading = $state(true);
	let error = $state('');

	const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

	function todayLabel(): string {
		const d = new Date();
		return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
	}

	function extractMenuItems(text: string): string[] {
		const today = new Date();
		const dayName = DAYS[today.getDay()].toLowerCase();
		const dayShort = dayName.substring(0, 3);
		const dateNum = String(today.getDate());
		const monthName = MONTHS[today.getMonth()].toLowerCase();
		const monthShort = monthName.substring(0, 3);

		const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

		let todaySection: string[] = [];
		let capturing = false;
		const allDays = DAYS.map(d => d.toLowerCase());

		for (let i = 0; i < lines.length; i++) {
			const lower = lines[i].toLowerCase();

			const isToday = lower.includes(dayName) ||
				(lower.includes(dayShort) && (lower.includes(dateNum) || lower.includes(monthShort))) ||
				lower.includes(`${dateNum}. ${monthShort}`) ||
				lower.includes(`${dateNum} ${monthShort}`) ||
				lower.includes(`${monthShort} ${dateNum}`);

			if (isToday && !capturing) {
				capturing = true;
				continue;
			}

			if (capturing) {
				const isOtherDay = allDays.some(d => d !== dayName && lower.includes(d) && lower.length < 60);
				if (isOtherDay) break;

				if (lines[i].length > 2 && lines[i].length < 200) {
					todaySection.push(lines[i]);
				}
			}
		}

		if (todaySection.length > 0) {
			return todaySection.slice(0, 12);
		}

		// Fallback: look for food-like lines
		const foodKeywords = /salad|soup|chicken|beef|fish|pasta|rice|curry|sandwich|burger|steak|pizza|vegan|vegetarian|grill|roast|baked|fried|sauce|menu|\(v\)|\(vg\)/i;
		const foodLines = lines.filter(l => l.startsWith('- ') || foodKeywords.test(l));
		if (foodLines.length > 0) {
			return foodLines.slice(0, 12).map(l => l.replace(/^-\s*/, ''));
		}

		// Last fallback
		const meaningful = lines.filter(l => l.length > 10 && l.length < 150);
		return meaningful.length > 0 ? meaningful.slice(0, 8) : ['Could not parse menu from this page'];
	}

	async function fetchMenu() {
		if (!menuUrl) {
			loading = false;
			error = 'Set a menu URL in widget settings';
			return;
		}

		loading = true;
		error = '';

		try {
			const res = await fetch(`/api/menu?url=${encodeURIComponent(menuUrl)}`);
			const data = await res.json();

			if (!res.ok || data.error) {
				error = data.error || 'Failed to fetch menu';
				menuItems = [];
			} else if (data.type === 'json') {
				const jsonText = JSON.stringify(data.data, null, 2);
				menuItems = extractMenuItems(jsonText);
			} else {
				menuItems = extractMenuItems(data.text || '');
			}
		} catch {
			error = 'Failed to load menu';
			menuItems = [];
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchMenu();
	});
</script>

<div class="lunch-menu">
	<div class="menu-header">
		<div class="menu-source">{cantineName}</div>
		<button class="refresh-btn" onclick={fetchMenu} aria-label="Refresh menu">
			<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M23 4v6h-6M1 20v-6h6"/>
				<path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
			</svg>
		</button>
	</div>
	<div class="menu-label">{todayLabel()}</div>
	{#if loading}
		<div class="status">Loading menu...</div>
	{:else if error}
		<div class="status error">{error}</div>
	{:else if menuItems.length === 0}
		<div class="status">No menu found for today</div>
	{:else}
		<ul class="menu-list">
			{#each menuItems as item}
				<li class="menu-item">{item}</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.lunch-menu {
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 6px;
		overflow-y: auto;
	}

	.menu-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.menu-source {
		font-size: 11px;
		color: var(--color-text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.refresh-btn {
		background: none;
		border: none;
		color: var(--color-text-tertiary);
		cursor: pointer;
		padding: 2px;
		border-radius: 4px;
		display: flex;
		align-items: center;
	}

	.refresh-btn:hover {
		color: var(--color-text-secondary);
		background: var(--color-bg-secondary);
	}

	.menu-label {
		font-size: 13px;
		font-weight: 500;
		margin-bottom: 4px;
	}

	.status {
		font-size: 12px;
		color: var(--color-text-tertiary);
	}

	.status.error {
		color: var(--color-danger);
	}

	.menu-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.menu-item {
		font-size: 12px;
		line-height: 1.4;
		padding: 5px 8px;
		background: var(--color-bg-secondary);
		border-radius: 6px;
	}
</style>
