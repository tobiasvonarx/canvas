<script lang="ts">
	import {
		StickyNote,
		CheckSquare,
		Link,
		Image,
		LayoutGrid,
		MessageCircle,
		Sun,
		Moon,
		ZoomIn,
		ZoomOut
	} from 'lucide-svelte';
	import { theme } from '$lib/stores/theme';
	import { zoom, pan, addItem } from '$lib/stores/canvas';
	import { screenToCanvas, clampZoom, zoomAtPoint } from '$lib/canvas-math';
	import { getAllWidgets } from '$lib/components/widgets/registry';
	import type { NoteData, TodoData, WidgetData } from '$lib/types';

	interface Props {
		onToggleChat: () => void;
		chatOpen: boolean;
	}

	let { onToggleChat, chatOpen }: Props = $props();

	let showWidgetPicker = $state(false);
	let widgets = $derived(getAllWidgets());
	let addCounter = 0;

	function addAtCenter(
		type: Parameters<typeof addItem>[0],
		data: Parameters<typeof addItem>[2],
		size?: Parameters<typeof addItem>[4]
	) {
		addCounter++;
		const offset = (addCounter % 8) * 30;
		const cx = window.innerWidth / 2 + offset - 100;
		const cy = window.innerHeight / 2;
		const pos = screenToCanvas(cx, cy, $pan, $zoom);
		addItem(type, pos.x - (size?.width ?? 120) / 2, pos.y - (size?.height ?? 80) / 2, data, size);
	}

	function addNote() {
		addAtCenter('note', { content: '', color: 'yellow' } as NoteData);
	}

	function addTodo() {
		addAtCenter('todo', { title: 'Todo List', items: [] } as TodoData, { width: 240, height: 260 });
	}

	function addLink() {
		const url = prompt('Enter URL:');
		if (url) {
			addAtCenter('link', { url, title: url } as any);
		}
	}

	function addImage() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.onchange = () => {
			const file = input.files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = () => {
				addAtCenter('image', { src: reader.result as string, alt: file.name } as any, {
					width: 300,
					height: 200
				});
			};
			reader.readAsDataURL(file);
		};
		input.click();
	}

	function addWidget(widgetType: string) {
		const def = getAllWidgets().find((w) => w.type === widgetType);
		if (!def) return;
		const config: Record<string, unknown> = {};
		for (const field of def.configSchema) {
			if (field.default !== undefined) config[field.key] = field.default;
		}
		addAtCenter(
			'widget',
			{ widgetType, config, schedule: def.defaultSchedule } as WidgetData,
			def.defaultSize
		);
		showWidgetPicker = false;
	}

	function zoomIn() {
		const cx = window.innerWidth / 2;
		const cy = window.innerHeight / 2;
		const newZoom = clampZoom($zoom + 0.15);
		const result = zoomAtPoint($pan, $zoom, newZoom, cx, cy);
		pan.set(result.pan);
		zoom.set(result.zoom);
	}

	function zoomOut() {
		const cx = window.innerWidth / 2;
		const cy = window.innerHeight / 2;
		const newZoom = clampZoom($zoom - 0.15);
		const result = zoomAtPoint($pan, $zoom, newZoom, cx, cy);
		pan.set(result.pan);
		zoom.set(result.zoom);
	}

	function zoomPercent(): string {
		return Math.round($zoom * 100) + '%';
	}
</script>

<svelte:window onclick={() => (showWidgetPicker = false)} />

<div class="toolbar">
	<div class="toolbar-group">
		<button class="toolbar-btn" onclick={addNote} title="Add Note">
			<StickyNote size={18} />
		</button>
		<button class="toolbar-btn" onclick={addTodo} title="Add Todo List">
			<CheckSquare size={18} />
		</button>
		<button class="toolbar-btn" onclick={addLink} title="Add Link">
			<Link size={18} />
		</button>
		<button class="toolbar-btn" onclick={addImage} title="Add Image">
			<Image size={18} />
		</button>
	</div>

	<div class="divider"></div>

	<div class="toolbar-group" style="position: relative;">
		<button
			class="toolbar-btn"
			onclick={(e) => {
				e.stopPropagation();
				showWidgetPicker = !showWidgetPicker;
			}}
			title="Add Widget"
		>
			<LayoutGrid size={18} />
		</button>
		{#if showWidgetPicker}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="widget-picker" onclick={(e) => e.stopPropagation()}>
				<div class="picker-title">Widgets</div>
				{#each widgets as widget}
					<button class="picker-item" onclick={() => addWidget(widget.type)}>
						<span class="picker-name">{widget.name}</span>
						<span class="picker-desc">{widget.description}</span>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="divider"></div>

	<div class="toolbar-group">
		<button class="toolbar-btn" onclick={zoomOut} title="Zoom Out">
			<ZoomOut size={18} />
		</button>
		<span class="zoom-display">{zoomPercent()}</span>
		<button class="toolbar-btn" onclick={zoomIn} title="Zoom In">
			<ZoomIn size={18} />
		</button>
	</div>

	<div class="divider"></div>

	<div class="toolbar-group">
		<button class="toolbar-btn" onclick={() => theme.toggle()} title="Toggle Theme">
			{#if $theme === 'dark'}
				<Sun size={18} />
			{:else}
				<Moon size={18} />
			{/if}
		</button>
		<button
			class="toolbar-btn"
			class:active={chatOpen}
			onclick={onToggleChat}
			title="AI Chat"
		>
			<MessageCircle size={18} />
		</button>
	</div>
</div>

<style>
	.toolbar {
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 6px 10px;
		background: color-mix(in srgb, var(--color-surface) 80%, transparent);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid var(--color-border);
		border-radius: 14px;
		box-shadow: 0 4px 16px var(--color-shadow);
		z-index: 100;
	}

	.toolbar-group {
		display: flex;
		align-items: center;
		gap: 2px;
	}

	.toolbar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: none;
		background: transparent;
		color: var(--color-text-secondary);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.toolbar-btn:hover {
		background: var(--color-surface-hover);
		color: var(--color-text);
	}

	.toolbar-btn.active {
		background: var(--color-accent);
		color: white;
	}

	.divider {
		width: 1px;
		height: 20px;
		background: var(--color-border);
		margin: 0 4px;
	}

	.zoom-display {
		font-size: 11px;
		color: var(--color-text-tertiary);
		min-width: 36px;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	.widget-picker {
		position: absolute;
		bottom: 48px;
		left: 50%;
		transform: translateX(-50%);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 8px;
		box-shadow: 0 8px 24px var(--color-shadow);
		min-width: 220px;
		z-index: 200;
	}

	.picker-title {
		font-size: 11px;
		font-weight: 600;
		color: var(--color-text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		padding: 4px 8px 8px;
	}

	.picker-item {
		display: flex;
		flex-direction: column;
		gap: 1px;
		width: 100%;
		padding: 8px;
		border: none;
		background: none;
		text-align: left;
		border-radius: 8px;
		cursor: pointer;
		transition: background 0.1s;
	}

	.picker-item:hover {
		background: var(--color-surface-hover);
	}

	.picker-name {
		font-size: 13px;
		font-weight: 500;
		color: var(--color-text);
	}

	.picker-desc {
		font-size: 11px;
		color: var(--color-text-tertiary);
	}
</style>
