<script lang="ts">
	import type { CanvasItem, ImageData as ImgData } from '$lib/types';

	interface Props {
		item: CanvasItem;
	}

	let { item }: Props = $props();
	let data = $derived(item.data as ImgData);
</script>

<div class="image-container">
	<img src={data.src} alt={data.alt || 'Image'} draggable="false" />
</div>

<style>
	.image-container {
		width: 100%;
		height: 100%;
		border-radius: 8px;
		overflow: hidden;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
		user-select: none;
		-webkit-user-drag: none;
	}
</style>
