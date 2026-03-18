<script lang="ts">
	import Canvas from '$lib/components/canvas/Canvas.svelte';
	import Toolbar from '$lib/components/toolbar/Toolbar.svelte';
	import ChatPanel from '$lib/components/chat/ChatPanel.svelte';
	import { chatOpen, toggleChat } from '$lib/stores/chat';
	import { deleteSelected, selectedIds, clearSelection, selectAll } from '$lib/stores/canvas';

	function handleKeydown(e: KeyboardEvent) {
		const target = e.target as HTMLElement;
		if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
			return;
		}

		if (e.key === 'Delete' || e.key === 'Backspace') {
			if ($selectedIds.size > 0) {
				deleteSelected();
			}
		}

		if (e.key === 'Escape') {
			if ($selectedIds.size > 0) {
				clearSelection();
			} else if ($chatOpen) {
				chatOpen.set(false);
			}
		}

		if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
			e.preventDefault();
			selectAll();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="app">
	<Canvas />
	<div class="app-title">Canvas</div>
	<Toolbar onToggleChat={toggleChat} chatOpen={$chatOpen} />
	<ChatPanel />
</div>

<style>
	.app {
		width: 100vw;
		height: 100vh;
		position: relative;
		overflow: hidden;
	}

	.app-title {
		position: fixed;
		top: 16px;
		left: 20px;
		font-size: 15px;
		font-weight: 600;
		color: var(--color-text-tertiary);
		pointer-events: none;
		z-index: 50;
		letter-spacing: 0.5px;
		user-select: none;
	}
</style>
