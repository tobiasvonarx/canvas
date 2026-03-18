<script lang="ts">
	import { Send } from 'lucide-svelte';

	interface Props {
		onSend: (text: string) => void;
		disabled: boolean;
	}

	let { onSend, disabled }: Props = $props();

	let text = $state('');

	function handleSubmit() {
		if (!text.trim() || disabled) return;
		onSend(text.trim());
		text = '';
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	}
</script>

<div class="chat-input-container">
	<textarea
		class="chat-input"
		placeholder="Ask Canvas AI..."
		bind:value={text}
		onkeydown={handleKeydown}
		rows={1}
		{disabled}
	></textarea>
	<button class="send-btn" onclick={handleSubmit} disabled={!text.trim() || disabled}>
		<Send size={16} />
	</button>
</div>

<style>
	.chat-input-container {
		display: flex;
		align-items: flex-end;
		gap: 8px;
		padding: 12px 16px;
		border-top: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.chat-input {
		flex: 1;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 8px 12px;
		font: inherit;
		font-size: 13px;
		resize: none;
		outline: none;
		background: var(--color-bg-secondary);
		color: var(--color-text);
		min-height: 36px;
		max-height: 120px;
	}

	.chat-input:focus {
		border-color: var(--color-accent);
	}

	.chat-input::placeholder {
		color: var(--color-text-tertiary);
	}

	.send-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: none;
		background: var(--color-accent);
		color: white;
		border-radius: 8px;
		cursor: pointer;
		flex-shrink: 0;
		transition: opacity 0.15s;
	}

	.send-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.send-btn:not(:disabled):hover {
		background: var(--color-accent-hover);
	}
</style>
