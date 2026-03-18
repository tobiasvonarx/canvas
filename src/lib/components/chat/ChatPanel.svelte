<script lang="ts">
	import {
		chatMessages,
		chatOpen,
		isStreaming,
		sendMessage,
		openRouterToken,
		selectedModel
	} from '$lib/stores/chat';
	import ChatMessage from './ChatMessage.svelte';
	import ChatInput from './ChatInput.svelte';
	import { X, Settings, Key } from 'lucide-svelte';
	import { browser } from '$app/environment';

	let showSettings = $state(false);
	let tokenInput = $state('');
	let messagesEnd: HTMLDivElement;

	// Load token from localStorage
	if (browser) {
		const saved = localStorage.getItem('canvas-openrouter-token');
		if (saved) {
			openRouterToken.set(saved);
			tokenInput = saved;
		}
		const savedModel = localStorage.getItem('canvas-ai-model');
		if (savedModel) selectedModel.set(savedModel);
	}

	function saveToken() {
		openRouterToken.set(tokenInput);
		if (browser) localStorage.setItem('canvas-openrouter-token', tokenInput);
		showSettings = false;
	}

	function handleModelChange(e: Event) {
		const val = (e.target as HTMLSelectElement).value;
		selectedModel.set(val);
		if (browser) localStorage.setItem('canvas-ai-model', val);
	}

	function handleSend(text: string) {
		sendMessage(text);
	}

	function scrollToBottom() {
		if (messagesEnd) {
			messagesEnd.scrollIntoView({ behavior: 'smooth' });
		}
	}

	$effect(() => {
		$chatMessages;
		// Scroll after messages update
		setTimeout(scrollToBottom, 50);
	});
</script>

{#if $chatOpen}
	<div class="chat-panel">
		<div class="chat-header">
			<span class="chat-title">Canvas AI</span>
			<div class="header-actions">
				<button class="icon-btn" onclick={() => (showSettings = !showSettings)} title="Settings">
					<Settings size={16} />
				</button>
				<button class="icon-btn" onclick={() => chatOpen.set(false)} title="Close">
					<X size={16} />
				</button>
			</div>
		</div>

		{#if showSettings}
			<div class="settings-panel">
				<div class="setting-row">
					<label class="setting-label">
						<Key size={14} />
						OpenRouter API Key
					</label>
					<input
						type="password"
						class="setting-input"
						bind:value={tokenInput}
						placeholder="sk-or-..."
						onkeydown={(e) => { if (e.key === 'Enter') saveToken(); }}
					/>
					<button class="save-btn" onclick={saveToken}>Save</button>
				</div>
				<div class="setting-row">
					<label class="setting-label">Model</label>
					<select class="setting-input" value={$selectedModel} onchange={handleModelChange}>
						<option value="anthropic/claude-sonnet-4">Claude Sonnet 4</option>
						<option value="anthropic/claude-haiku-4">Claude Haiku 4</option>
						<option value="openai/gpt-4o">GPT-4o</option>
						<option value="openai/gpt-4o-mini">GPT-4o Mini</option>
						<option value="google/gemini-2.5-pro-preview">Gemini 2.5 Pro</option>
						<option value="meta-llama/llama-3.3-70b-instruct">Llama 3.3 70B</option>
					</select>
				</div>
				<a href="https://openrouter.ai/keys" target="_blank" rel="noopener" class="key-link">
					Get an API key at openrouter.ai
				</a>
			</div>
		{/if}

		<div class="chat-messages">
			{#if $chatMessages.length === 0}
				<div class="empty-chat">
					<p>Ask me to add notes, todos, links, or widgets to your canvas.</p>
					<p class="hint">Try: "Add a sticky note with my morning tasks"</p>
				</div>
			{/if}
			{#each $chatMessages as msg (msg.id)}
				<ChatMessage message={msg} />
			{/each}
			{#if $isStreaming}
				<div class="typing">Thinking...</div>
			{/if}
			<div bind:this={messagesEnd}></div>
		</div>

		<ChatInput onSend={handleSend} disabled={$isStreaming} />
	</div>
{/if}

<style>
	.chat-panel {
		position: fixed;
		top: 0;
		right: 0;
		width: 360px;
		height: 100vh;
		background: var(--color-surface);
		border-left: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		z-index: 200;
		box-shadow: -4px 0 24px var(--color-shadow);
	}

	.chat-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		border-bottom: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.chat-title {
		font-weight: 600;
		font-size: 14px;
	}

	.header-actions {
		display: flex;
		gap: 4px;
	}

	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: none;
		background: transparent;
		color: var(--color-text-secondary);
		border-radius: 6px;
		cursor: pointer;
	}

	.icon-btn:hover {
		background: var(--color-surface-hover);
		color: var(--color-text);
	}

	.settings-panel {
		padding: 12px 16px;
		border-bottom: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: 10px;
		background: var(--color-bg-secondary);
	}

	.setting-row {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.setting-label {
		font-size: 11px;
		font-weight: 600;
		color: var(--color-text-secondary);
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.setting-input {
		padding: 6px 8px;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		font: inherit;
		font-size: 12px;
		background: var(--color-surface);
		color: var(--color-text);
		outline: none;
	}

	.setting-input:focus {
		border-color: var(--color-accent);
	}

	.save-btn {
		padding: 4px 10px;
		border: none;
		background: var(--color-accent);
		color: white;
		border-radius: 6px;
		font-size: 12px;
		cursor: pointer;
		align-self: flex-start;
		margin-top: 2px;
	}

	.key-link {
		font-size: 11px;
		color: var(--color-accent);
		text-decoration: none;
	}

	.key-link:hover {
		text-decoration: underline;
	}

	.chat-messages {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.empty-chat {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		text-align: center;
		color: var(--color-text-secondary);
		font-size: 13px;
		gap: 8px;
	}

	.hint {
		font-size: 12px;
		color: var(--color-text-tertiary);
		font-style: italic;
	}

	.typing {
		font-size: 12px;
		color: var(--color-text-tertiary);
		padding: 8px 12px;
		background: var(--color-bg-secondary);
		border-radius: 8px;
		align-self: flex-start;
	}
</style>
