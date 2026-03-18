<script lang="ts">
	import type { ChatMessage } from '$lib/types';

	interface Props {
		message: ChatMessage;
	}

	let { message }: Props = $props();
</script>

<div class="message" class:user={message.role === 'user'} class:assistant={message.role === 'assistant'}>
	<div class="message-content">{message.content}</div>
</div>

<style>
	.message {
		max-width: 90%;
		padding: 8px 12px;
		border-radius: 12px;
		font-size: 13px;
		line-height: 1.5;
		word-break: break-word;
	}

	.user {
		align-self: flex-end;
		background: var(--color-accent);
		color: white;
		border-bottom-right-radius: 4px;
	}

	.assistant {
		align-self: flex-start;
		background: var(--color-bg-secondary);
		color: var(--color-text);
		border-bottom-left-radius: 4px;
	}

	.message-content {
		white-space: pre-wrap;
	}
</style>
