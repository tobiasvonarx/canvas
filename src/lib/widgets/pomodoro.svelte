<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Play, Pause, RotateCcw } from 'lucide-svelte';

	interface Props {
		config: Record<string, unknown>;
	}

	let { config }: Props = $props();

	let workMinutes = $derived((config.workMinutes as number) || 25);
	let breakMinutes = $derived((config.breakMinutes as number) || 5);

	let timeLeft = $state(25 * 60); // seconds
	let isRunning = $state(false);
	let isBreak = $state(false);
	let interval: ReturnType<typeof setInterval> | null = null;

	// Reset timer when config changes
	$effect(() => {
		if (!isRunning) {
			timeLeft = (isBreak ? breakMinutes : workMinutes) * 60;
		}
	});

	function startStop(e: MouseEvent) {
		e.stopPropagation();
		if (isRunning) {
			pause();
		} else {
			start();
		}
	}

	function start() {
		isRunning = true;
		interval = setInterval(() => {
			timeLeft--;
			if (timeLeft <= 0) {
				pause();
				// Switch mode
				isBreak = !isBreak;
				timeLeft = (isBreak ? breakMinutes : workMinutes) * 60;
			}
		}, 1000);
	}

	function pause() {
		isRunning = false;
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
	}

	function reset(e: MouseEvent) {
		e.stopPropagation();
		pause();
		isBreak = false;
		timeLeft = workMinutes * 60;
	}

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});

	let minutes = $derived(Math.floor(timeLeft / 60));
	let seconds = $derived(timeLeft % 60);
	let display = $derived(
		`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
	);
	let progress = $derived(
		1 - timeLeft / ((isBreak ? breakMinutes : workMinutes) * 60)
	);
</script>

<div class="pomodoro" data-no-drag>
	<div class="mode-label" class:break-mode={isBreak}>
		{isBreak ? 'Break' : 'Focus'}
	</div>

	<div class="timer-ring">
		<svg viewBox="0 0 100 100">
			<circle class="ring-bg" cx="50" cy="50" r="42" />
			<circle
				class="ring-progress"
				class:break-ring={isBreak}
				cx="50"
				cy="50"
				r="42"
				stroke-dasharray={2 * Math.PI * 42}
				stroke-dashoffset={2 * Math.PI * 42 * (1 - progress)}
			/>
		</svg>
		<div class="timer-display">{display}</div>
	</div>

	<div class="controls">
		<button class="control-btn" onclick={startStop} title={isRunning ? 'Pause' : 'Start'}>
			{#if isRunning}
				<Pause size={18} />
			{:else}
				<Play size={18} />
			{/if}
		</button>
		<button class="control-btn" onclick={reset} title="Reset">
			<RotateCcw size={16} />
		</button>
	</div>
</div>

<style>
	.pomodoro {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: 8px;
		padding: 12px;
	}

	.mode-label {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 1px;
		color: var(--color-accent);
	}

	.mode-label.break-mode {
		color: #22c55e;
	}

	.timer-ring {
		position: relative;
		width: 110px;
		height: 110px;
	}

	.timer-ring svg {
		width: 100%;
		height: 100%;
		transform: rotate(-90deg);
	}

	.ring-bg {
		fill: none;
		stroke: var(--color-border);
		stroke-width: 4;
	}

	.ring-progress {
		fill: none;
		stroke: var(--color-accent);
		stroke-width: 4;
		stroke-linecap: round;
		transition: stroke-dashoffset 0.5s ease;
	}

	.ring-progress.break-ring {
		stroke: #22c55e;
	}

	.timer-display {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		font-weight: 300;
		font-variant-numeric: tabular-nums;
		letter-spacing: 1px;
	}

	.controls {
		display: flex;
		gap: 8px;
	}

	.control-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: 1px solid var(--color-border);
		border-radius: 50%;
		background: var(--color-surface);
		color: var(--color-text);
		cursor: pointer;
		transition: all 0.15s;
	}

	.control-btn:hover {
		background: var(--color-surface-hover);
		border-color: var(--color-border-strong);
	}
</style>
