<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let time = $state(new Date());
	let interval: ReturnType<typeof setInterval>;

	onMount(() => {
		interval = setInterval(() => {
			time = new Date();
		}, 1000);
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});

	let timeStr = $derived(
		time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
	);
	let dateStr = $derived(
		time.toLocaleDateString(undefined, {
			weekday: 'long',
			month: 'long',
			day: 'numeric'
		})
	);
</script>

<div class="clock">
	<div class="time">{timeStr}</div>
	<div class="date">{dateStr}</div>
</div>

<style>
	.clock {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: 4px;
	}

	.time {
		font-size: 28px;
		font-weight: 300;
		letter-spacing: 1px;
		font-variant-numeric: tabular-nums;
	}

	.date {
		font-size: 13px;
		color: var(--color-text-secondary);
	}
</style>
