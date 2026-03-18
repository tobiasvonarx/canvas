<script lang="ts">
	import {
		selectedIds,
		selectItem,
		bringToFront,
		moveItem,
		resizeItem,
		removeItem,
		duplicateItem,
		updateItemData
	} from '$lib/stores/canvas';
	import { pan, zoom } from '$lib/stores/canvas';
	import type { CanvasItem, NoteData, WidgetData } from '$lib/types';
	import NoteItem from '$lib/components/items/NoteItem.svelte';
	import TodoItem from '$lib/components/items/TodoItem.svelte';
	import LinkItem from '$lib/components/items/LinkItem.svelte';
	import ImageItem from '$lib/components/items/ImageItem.svelte';
	import WidgetRenderer from '$lib/components/widgets/WidgetRenderer.svelte';
	import { getWidget } from '$lib/components/widgets/registry';

	interface Props {
		item: CanvasItem;
	}

	let { item }: Props = $props();

	let itemEl: HTMLDivElement;
	let isPendingDrag = false;
	let isDragging = $state(false);
	let isResizing = $state(false);
	let dragStart = { x: 0, y: 0 };
	let itemStart = { x: 0, y: 0 };
	let sizeStart = { w: 0, h: 0 };
	let pendingPointerId: number | null = null;
	let showContextMenu = $state(false);
	let contextMenuPos = $state({ x: 0, y: 0 });
	const DRAG_THRESHOLD = 4;

	// For widget config editing
	let editingConfig = $state(false);
	let configValues = $state<Record<string, unknown>>({});

	// For note color picking
	let showColorPicker = $state(false);

	let isSelected = $derived($selectedIds.has(item.id));

	// Manual double-click detection (since pointer events block native dblclick)
	let lastClickTime = 0;
	let isEditing = $state(false);

	function handlePointerDown(e: PointerEvent) {
		if (e.button !== 0) return;
		// Don't start drag if clicking on an interactive element inside the item
		const target = e.target as HTMLElement;
		if (
			target.tagName === 'A' ||
			target.tagName === 'INPUT' ||
			target.tagName === 'TEXTAREA' ||
			target.tagName === 'BUTTON' ||
			target.tagName === 'SELECT' ||
			target.closest('a') ||
			target.closest('[data-no-drag]')
		) {
			return;
		}

		// Detect double-click manually
		const now = Date.now();
		if (now - lastClickTime < 400) {
			// Double-click detected — enter edit mode, don't drag
			isEditing = true;
			lastClickTime = 0;
			return;
		}
		lastClickTime = now;

		bringToFront(item.id);
		selectItem(item.id, e.shiftKey);

		// Don't capture immediately — wait for movement past threshold
		isPendingDrag = true;
		pendingPointerId = e.pointerId;
		dragStart = { x: e.clientX, y: e.clientY };
		itemStart = { x: item.x, y: item.y };
	}

	function handlePointerMove(e: PointerEvent) {
		if (isPendingDrag) {
			const dx = Math.abs(e.clientX - dragStart.x);
			const dy = Math.abs(e.clientY - dragStart.y);
			if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
				// Promote to real drag
				isPendingDrag = false;
				isDragging = true;
				if (pendingPointerId !== null) {
					itemEl.setPointerCapture(pendingPointerId);
				}
			}
		}
		if (isDragging) {
			const dx = (e.clientX - dragStart.x) / $zoom;
			const dy = (e.clientY - dragStart.y) / $zoom;
			moveItem(item.id, itemStart.x + dx, itemStart.y + dy);
		} else if (isResizing) {
			const dx = (e.clientX - dragStart.x) / $zoom;
			const dy = (e.clientY - dragStart.y) / $zoom;
			resizeItem(item.id, sizeStart.w + dx, sizeStart.h + dy);
		}
	}

	function handlePointerUp() {
		isPendingDrag = false;
		isDragging = false;
		isResizing = false;
		pendingPointerId = null;
	}

	function handleResizeDown(e: PointerEvent) {
		e.stopPropagation();
		e.preventDefault();
		isResizing = true;
		dragStart = { x: e.clientX, y: e.clientY };
		sizeStart = { w: item.width, h: item.height };
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handleContextMenu(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		showContextMenu = true;
		showColorPicker = false;
		editingConfig = false;
		// Use clientX/Y relative to the item element for reliable positioning
		const rect = itemEl.getBoundingClientRect();
		contextMenuPos = { x: (e.clientX - rect.left) / $zoom, y: (e.clientY - rect.top) / $zoom };
	}

	function closeContextMenu() {
		showContextMenu = false;
		showColorPicker = false;
		editingConfig = false;
	}

	function handleDelete() {
		removeItem(item.id);
		closeContextMenu();
	}

	function handleDuplicate() {
		duplicateItem(item.id);
		closeContextMenu();
	}

	function handleChangeColor(color: string) {
		updateItemData(item.id, { color } as Partial<NoteData>);
		closeContextMenu();
	}

	function handleOpenLink() {
		if (item.type === 'link') {
			const data = item.data as { url: string };
			window.open(data.url, '_blank');
		}
		closeContextMenu();
	}

	function handleEditWidgetConfig() {
		if (item.type === 'widget') {
			const data = item.data as WidgetData;
			configValues = { ...data.config };
			editingConfig = true;
		}
	}

	function saveWidgetConfig() {
		if (item.type === 'widget') {
			updateItemData(item.id, { config: { ...configValues } } as Partial<WidgetData>);
		}
		closeContextMenu();
	}

	// Get widget definition for config schema
	let widgetDef = $derived(
		item.type === 'widget' ? getWidget((item.data as WidgetData).widgetType) : null
	);

	const noteColors = [
		{ name: 'Yellow', value: 'yellow' },
		{ name: 'Blue', value: 'blue' },
		{ name: 'Green', value: 'green' },
		{ name: 'Pink', value: 'pink' },
		{ name: 'Purple', value: 'purple' }
	];

	const colorSwatches: Record<string, string> = {
		yellow: '#eab308',
		blue: '#3b82f6',
		green: '#22c55e',
		pink: '#ec4899',
		purple: '#a855f7'
	};
</script>

<svelte:window onclick={closeContextMenu} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={itemEl}
	class="canvas-item"
	class:selected={isSelected}
	class:dragging={isDragging}
	style="
		left: {item.x}px;
		top: {item.y}px;
		width: {item.width}px;
		height: {item.height}px;
		z-index: {item.zIndex};
	"
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	oncontextmenu={handleContextMenu}
>
	<div class="item-content">
		{#if item.type === 'note'}
			<NoteItem {item} editing={isEditing} onStopEditing={() => (isEditing = false)} />
		{:else if item.type === 'todo'}
			<TodoItem {item} />
		{:else if item.type === 'link'}
			<LinkItem {item} />
		{:else if item.type === 'image'}
			<ImageItem {item} />
		{:else if item.type === 'widget'}
			<WidgetRenderer {item} />
		{/if}
	</div>

	{#if isSelected}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="resize-handle"
			onpointerdown={handleResizeDown}
			onpointermove={handlePointerMove}
			onpointerup={handlePointerUp}
		></div>
	{/if}

	{#if showContextMenu}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="context-menu" style="left: {contextMenuPos.x}px; top: {contextMenuPos.y}px;" onclick={(e) => e.stopPropagation()}>
			{#if editingConfig && widgetDef}
				<!-- Widget config editor -->
				<div class="config-editor">
					<div class="menu-header">Configure {widgetDef.name}</div>
					{#each widgetDef.configSchema as field}
						<label class="config-field">
							<span class="config-label">{field.label}</span>
							{#if field.type === 'text' || field.type === 'url'}
								<input
									type="text"
									class="config-input"
									value={configValues[field.key] ?? field.default ?? ''}
									oninput={(e) => (configValues[field.key] = (e.target as HTMLInputElement).value)}
									placeholder={field.placeholder}
								/>
							{:else if field.type === 'number'}
								<input
									type="number"
									class="config-input"
									value={configValues[field.key] ?? field.default ?? 0}
									oninput={(e) => (configValues[field.key] = Number((e.target as HTMLInputElement).value))}
								/>
							{:else if field.type === 'select' && field.options}
								<select
									class="config-input"
									value={configValues[field.key] ?? field.default}
									onchange={(e) => (configValues[field.key] = (e.target as HTMLSelectElement).value)}
								>
									{#each field.options as opt}
										<option value={opt.value}>{opt.label}</option>
									{/each}
								</select>
							{/if}
						</label>
					{/each}
					<div class="config-actions">
						<button class="config-save" onclick={saveWidgetConfig}>Save</button>
						<button onclick={() => (editingConfig = false)}>Cancel</button>
					</div>
				</div>
			{:else}
				<!-- Type-specific options first -->
				{#if item.type === 'note'}
					<button onclick={() => (showColorPicker = !showColorPicker)}>
						Change Color
					</button>
					{#if showColorPicker}
						<div class="color-picker">
							{#each noteColors as color}
								<button
									class="color-swatch"
									style="background: {colorSwatches[color.value]}"
									title={color.name}
									onclick={() => handleChangeColor(color.value)}
								></button>
							{/each}
						</div>
					{/if}
				{/if}

				{#if item.type === 'link'}
					<button onclick={handleOpenLink}>Open Link</button>
				{/if}

				{#if item.type === 'widget' && widgetDef && widgetDef.configSchema.length > 0}
					<button onclick={handleEditWidgetConfig}>Configure {widgetDef.name}...</button>
				{/if}

				<!-- Separator if there were type-specific options -->
				{#if item.type === 'note' || item.type === 'link' || (item.type === 'widget' && widgetDef?.configSchema.length)}
					<div class="menu-divider"></div>
				{/if}

				<!-- Universal options -->
				<button onclick={handleDuplicate}>Duplicate</button>
				<button onclick={handleDelete} class="danger">Delete</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.canvas-item {
		position: absolute;
		cursor: grab;
		border-radius: 8px;
		user-select: none;
	}

	.canvas-item:hover {
		box-shadow: 0 0 0 1px var(--color-border-strong);
	}

	.canvas-item.selected {
		box-shadow: 0 0 0 2px var(--color-accent);
	}

	.canvas-item.dragging {
		cursor: grabbing;
		/* Promote only the dragged item to GPU during drag for smooth movement */
		will-change: transform;
	}

	.item-content {
		width: 100%;
		height: 100%;
		overflow: hidden;
		border-radius: 8px;
	}

	.resize-handle {
		position: absolute;
		bottom: -4px;
		right: -4px;
		width: 12px;
		height: 12px;
		background: var(--color-accent);
		border-radius: 2px;
		cursor: se-resize;
		z-index: 10;
	}

	.context-menu {
		position: absolute;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 4px;
		box-shadow: 0 4px 16px var(--color-shadow);
		z-index: 1000;
		min-width: 160px;
	}

	.context-menu button {
		display: block;
		width: 100%;
		padding: 6px 12px;
		border: none;
		background: none;
		color: var(--color-text);
		font-size: 13px;
		text-align: left;
		border-radius: 4px;
		cursor: pointer;
	}

	.context-menu button:hover {
		background: var(--color-surface-hover);
	}

	.context-menu button.danger {
		color: var(--color-danger);
	}

	.menu-divider {
		height: 1px;
		background: var(--color-border);
		margin: 4px 8px;
	}

	.menu-header {
		font-size: 11px;
		font-weight: 600;
		color: var(--color-text-secondary);
		padding: 6px 12px 4px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.color-picker {
		display: flex;
		gap: 4px;
		padding: 4px 12px 6px;
	}

	.color-swatch {
		width: 22px !important;
		height: 22px;
		min-width: 22px;
		padding: 0 !important;
		border-radius: 50% !important;
		border: 2px solid var(--color-border) !important;
		cursor: pointer;
		transition: transform 0.1s;
	}

	.color-swatch:hover {
		transform: scale(1.2);
		background: inherit !important;
	}

	/* Config editor styles */
	.config-editor {
		padding: 4px 0;
		min-width: 220px;
	}

	.config-field {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 4px 12px;
	}

	.config-label {
		font-size: 11px;
		font-weight: 500;
		color: var(--color-text-secondary);
	}

	.config-input {
		padding: 5px 8px;
		border: 1px solid var(--color-border);
		border-radius: 5px;
		font: inherit;
		font-size: 12px;
		background: var(--color-bg-secondary);
		color: var(--color-text);
		outline: none;
		width: 100%;
	}

	.config-input:focus {
		border-color: var(--color-accent);
	}

	.config-actions {
		display: flex;
		gap: 4px;
		padding: 6px 12px 4px;
	}

	.config-save {
		background: var(--color-accent) !important;
		color: white !important;
	}
</style>
