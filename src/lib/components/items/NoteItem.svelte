<script lang="ts">
	import { updateItemData } from '$lib/stores/canvas';
	import type { CanvasItem, NoteData } from '$lib/types';

	interface Props {
		item: CanvasItem;
		editing?: boolean;
		onStopEditing?: () => void;
	}

	let { item, editing = false, onStopEditing }: Props = $props();
	let data = $derived(item.data as NoteData);

	let editText = $state('');
	let textareaEl: HTMLTextAreaElement;

	const colorMap: Record<string, string> = {
		yellow: 'var(--color-note-yellow)',
		blue: 'var(--color-note-blue)',
		green: 'var(--color-note-green)',
		pink: 'var(--color-note-pink)',
		purple: 'var(--color-note-purple)'
	};

	// React to parent setting editing=true
	$effect(() => {
		if (editing) {
			editText = data.content;
			requestAnimationFrame(() => {
				textareaEl?.focus();
			});
		}
	});

	function finishEdit() {
		if (!editing) return;
		updateItemData(item.id, { content: editText });
		onStopEditing?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			finishEdit();
		}
		e.stopPropagation();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="note"
	style="background: {colorMap[data.color] || colorMap.yellow}"
>
	{#if editing}
		<div data-no-drag>
			<textarea
				bind:this={textareaEl}
				bind:value={editText}
				onblur={finishEdit}
				onkeydown={handleKeydown}
				onpointerdown={(e) => e.stopPropagation()}
				class="note-editor"
			></textarea>
		</div>
	{:else}
		<div class="note-content">
			{#if data.content}
				{data.content}
			{:else}
				<span class="placeholder">Double-click to edit...</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	.note {
		width: 100%;
		height: 100%;
		padding: 12px;
		border-radius: 8px;
		cursor: default;
		overflow: hidden;
	}

	.note-content {
		white-space: pre-wrap;
		word-break: break-word;
		font-size: 13px;
		line-height: 1.5;
		color: var(--color-text);
		cursor: text;
	}

	.placeholder {
		color: var(--color-text-tertiary);
	}

	.note-editor {
		width: 100%;
		height: 100%;
		border: none;
		background: transparent;
		font-family: inherit;
		font-size: 13px;
		line-height: 1.5;
		color: var(--color-text);
		resize: none;
		outline: none;
	}

	[data-no-drag] {
		width: 100%;
		height: 100%;
	}
</style>
