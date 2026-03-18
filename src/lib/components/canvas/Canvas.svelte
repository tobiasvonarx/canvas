<script lang="ts">
	import { pan, zoom, items, itemsArray, clearSelection, addItem } from '$lib/stores/canvas';
	import { screenToCanvas, zoomAtPoint, clampZoom } from '$lib/canvas-math';
	import CanvasItem from './CanvasItem.svelte';
	import GridBackground from './GridBackground.svelte';
	import type { NoteData, LinkData, ImageData as ImgData } from '$lib/types';

	let viewport: HTMLDivElement;
	let worldEl: HTMLDivElement;
	let isPanning = false;
	let panStart = { x: 0, y: 0 };
	let panOrigin = { x: 0, y: 0 };

	// Track if we're actively interacting (for GPU layer promotion)
	let isInteracting = $state(false);
	let interactionTimer: ReturnType<typeof setTimeout> | null = null;

	function beginInteraction() {
		isInteracting = true;
		if (interactionTimer) clearTimeout(interactionTimer);
	}

	function endInteraction() {
		// Delay removing GPU promotion to allow final frame to settle
		if (interactionTimer) clearTimeout(interactionTimer);
		interactionTimer = setTimeout(() => {
			isInteracting = false;
		}, 150);
	}

	function handlePointerDown(e: PointerEvent) {
		// Only pan on empty space (not on canvas items) or middle button
		const target = e.target as HTMLElement;
		if (target.closest('.canvas-item') && e.button !== 1) return;
		if (e.button === 1 || e.button === 0) {
			isPanning = true;
			panStart = { x: e.clientX, y: e.clientY };
			panOrigin = { x: $pan.x, y: $pan.y };
			viewport.setPointerCapture(e.pointerId);
			beginInteraction();
			e.preventDefault();
		}
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isPanning) return;
		const newPan = {
			x: panOrigin.x + (e.clientX - panStart.x),
			y: panOrigin.y + (e.clientY - panStart.y)
		};
		pan.set(newPan);
	}

	function handlePointerUp(e: PointerEvent) {
		if (isPanning) {
			isPanning = false;
			viewport.releasePointerCapture(e.pointerId);
			endInteraction();
			// Only clear selection if we didn't move (clicked empty space)
			const dx = Math.abs(e.clientX - panStart.x);
			const dy = Math.abs(e.clientY - panStart.y);
			if (dx < 3 && dy < 3) {
				clearSelection();
			}
		}
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		beginInteraction();

		// Exponential zoom for natural feel (consistent % change per scroll tick)
		const delta = -e.deltaY * 0.001;
		const newZoom = clampZoom($zoom * Math.exp(delta * 3));
		const result = zoomAtPoint($pan, $zoom, newZoom, e.clientX, e.clientY);
		pan.set(result.pan);
		zoom.set(result.zoom);
		endInteraction();
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		if (!e.dataTransfer) return;

		const canvasPos = screenToCanvas(e.clientX, e.clientY, $pan, $zoom);

		// Handle files (images)
		if (e.dataTransfer.files.length > 0) {
			for (const file of e.dataTransfer.files) {
				if (file.type.startsWith('image/')) {
					const reader = new FileReader();
					reader.onload = () => {
						addItem('image', canvasPos.x, canvasPos.y, {
							src: reader.result as string,
							alt: file.name
						} as ImgData);
					};
					reader.readAsDataURL(file);
				}
			}
			return;
		}

		// Handle URLs
		const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/x-moz-url');
		if (url && url.startsWith('http')) {
			addItem('link', canvasPos.x, canvasPos.y, {
				url,
				title: url
			} as LinkData);
			return;
		}

		// Handle text
		const text = e.dataTransfer.getData('text/plain');
		if (text) {
			if (text.match(/^https?:\/\//)) {
				addItem('link', canvasPos.x, canvasPos.y, {
					url: text,
					title: text
				} as LinkData);
			} else {
				addItem('note', canvasPos.x, canvasPos.y, {
					content: text,
					color: 'yellow'
				} as NoteData);
			}
		}
	}
</script>

<div
	class="canvas-viewport"
	bind:this={viewport}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onwheel={handleWheel}
	ondragover={handleDragOver}
	ondrop={handleDrop}
	role="application"
	tabindex="-1"
>
	<GridBackground pan={$pan} zoomLevel={$zoom} />
	<div
		bind:this={worldEl}
		class="canvas-world"
		class:interacting={isInteracting}
		style="transform: translate({$pan.x}px, {$pan.y}px) scale({$zoom})"
	>
		{#each $itemsArray as item (item.id)}
			<CanvasItem {item} />
		{/each}
	</div>
</div>

<style>
	.canvas-viewport {
		position: absolute;
		inset: 0;
		overflow: hidden;
		cursor: grab;
		outline: none;
	}

	.canvas-viewport:active {
		cursor: grabbing;
	}

	.canvas-world {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: 0 0;
		/* No will-change here — text stays crisp because browser re-rasterizes every frame */
	}

	/* Only promote to GPU layer during active interaction for smooth 60fps */
	.canvas-world.interacting {
		will-change: transform;
	}
</style>
