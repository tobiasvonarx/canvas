<script lang="ts">
	interface Props {
		pan: { x: number; y: number };
		zoomLevel: number;
	}

	let { pan, zoomLevel }: Props = $props();

	let gridSize = $derived(20 * zoomLevel);
	// Scale dot size with zoom for consistent visual appearance
	let dotSize = $derived(Math.max(0.6, Math.min(1.2, zoomLevel)));
</script>

<div
	class="grid-bg"
	style="
		background-size: {gridSize}px {gridSize}px;
		background-position: {pan.x}px {pan.y}px;
		background-image: radial-gradient(circle, var(--color-grid-dot) {dotSize}px, transparent {dotSize}px);
	"
></div>

<style>
	.grid-bg {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 0;
	}
</style>
