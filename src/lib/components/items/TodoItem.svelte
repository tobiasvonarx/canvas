<script lang="ts">
	import { updateItemData } from '$lib/stores/canvas';
	import { nanoid } from 'nanoid';
	import type { CanvasItem, TodoData, TodoEntry } from '$lib/types';

	interface Props {
		item: CanvasItem;
	}

	let { item }: Props = $props();
	let data = $derived(item.data as TodoData);

	let newTodoText = $state('');
	let editingTitle = $state(false);
	let titleText = $state('');
	let titleInputEl: HTMLInputElement;

	function toggleTodo(id: string) {
		const updated = data.items.map((t) =>
			t.id === id ? { ...t, completed: !t.completed } : t
		);
		updateItemData(item.id, { items: updated });
	}

	function addTodo(e: KeyboardEvent) {
		if (e.key === 'Enter' && newTodoText.trim()) {
			e.stopPropagation();
			const entry: TodoEntry = { id: nanoid(8), text: newTodoText.trim(), completed: false };
			updateItemData(item.id, { items: [...data.items, entry] });
			newTodoText = '';
		}
	}

	function removeTodo(e: MouseEvent, id: string) {
		e.stopPropagation();
		updateItemData(item.id, { items: data.items.filter((t) => t.id !== id) });
	}

	function startEditTitle() {
		editingTitle = true;
		titleText = data.title;
		requestAnimationFrame(() => titleInputEl?.focus());
	}

	function finishEditTitle() {
		if (!editingTitle) return;
		editingTitle = false;
		updateItemData(item.id, { title: titleText });
	}
</script>

<div class="todo-list">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="todo-header" ondblclick={startEditTitle}>
		<div class="drag-handle" title="Drag to move">
			<svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
				<circle cx="2" cy="2" r="1.5"/><circle cx="8" cy="2" r="1.5"/>
				<circle cx="2" cy="7" r="1.5"/><circle cx="8" cy="7" r="1.5"/>
				<circle cx="2" cy="12" r="1.5"/><circle cx="8" cy="12" r="1.5"/>
			</svg>
		</div>
		{#if editingTitle}
			<input
				type="text"
				bind:this={titleInputEl}
				bind:value={titleText}
				onblur={finishEditTitle}
				onpointerdown={(e) => e.stopPropagation()}
				onkeydown={(e) => { e.stopPropagation(); if (e.key === 'Enter') finishEditTitle(); }}
				class="title-edit"
			/>
		{:else}
			<span class="title">{data.title || 'Todo List'}</span>
		{/if}
	</div>

	<div class="todo-items">
		{#each data.items as entry (entry.id)}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="todo-entry"
				class:completed={entry.completed}
				onclick={() => toggleTodo(entry.id)}
				onpointerdown={(e) => e.stopPropagation()}
			>
				<div class="checkbox" class:checked={entry.completed}>
					{#if entry.completed}
						<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
							<path d="M2 5L4.5 7.5L8 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					{/if}
				</div>
				<span class="todo-text">{entry.text}</span>
				<button class="remove-btn" onclick={(e) => removeTodo(e, entry.id)}>&times;</button>
			</div>
		{/each}
	</div>

	<input
		type="text"
		class="add-todo"
		placeholder="Add item..."
		bind:value={newTodoText}
		onkeydown={addTodo}
		onpointerdown={(e) => e.stopPropagation()}
	/>
</div>

<style>
	.todo-list {
		width: 100%;
		height: 100%;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		overflow: hidden;
	}

	.todo-header {
		display: flex;
		align-items: center;
		gap: 6px;
		font-weight: 600;
		font-size: 14px;
		cursor: grab;
	}

	.todo-header:active {
		cursor: grabbing;
	}

	.drag-handle {
		color: var(--color-text-tertiary);
		opacity: 0.4;
		cursor: grab;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		transition: opacity 0.15s;
	}

	.todo-list:hover .drag-handle {
		opacity: 0.7;
	}

	.title-edit {
		width: 100%;
		border: none;
		background: transparent;
		font: inherit;
		font-weight: 600;
		outline: none;
		color: var(--color-text);
	}

	.todo-items {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.todo-entry {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 5px 6px;
		font-size: 13px;
		cursor: pointer;
		border-radius: 4px;
		transition: background 0.1s;
	}

	.todo-entry:hover {
		background: var(--color-surface-hover);
	}

	.todo-entry.completed .todo-text {
		text-decoration: line-through;
		color: var(--color-text-tertiary);
	}

	.checkbox {
		width: 16px;
		height: 16px;
		border-radius: 4px;
		border: 1.5px solid var(--color-border-strong);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: all 0.15s;
		color: white;
	}

	.checkbox.checked {
		background: var(--color-accent);
		border-color: var(--color-accent);
	}

	.todo-text {
		flex: 1;
	}

	.remove-btn {
		opacity: 0;
		border: none;
		background: none;
		color: var(--color-text-tertiary);
		cursor: pointer;
		font-size: 16px;
		padding: 0 4px;
		line-height: 1;
	}

	.todo-entry:hover .remove-btn {
		opacity: 1;
	}

	.add-todo {
		border: none;
		border-top: 1px solid var(--color-border);
		padding: 8px 0 0;
		background: transparent;
		font: inherit;
		font-size: 13px;
		outline: none;
		color: var(--color-text);
	}

	.add-todo::placeholder {
		color: var(--color-text-tertiary);
	}
</style>
