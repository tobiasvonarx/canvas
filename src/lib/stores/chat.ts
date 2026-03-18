import { writable, get } from 'svelte/store';
import { nanoid } from 'nanoid';
import type { ChatMessage } from '$lib/types';
import {
	addItem,
	removeItem,
	updateItemData,
	moveItem,
	items as itemsStore
} from '$lib/stores/canvas';
import { screenToCanvas } from '$lib/canvas-math';
import { pan, zoom } from '$lib/stores/canvas';
import { getAllWidgets } from '$lib/components/widgets/registry';
import type { NoteData, TodoData, LinkData, WidgetData } from '$lib/types';

export const chatOpen = writable(false);
export const chatMessages = writable<ChatMessage[]>([]);
export const isStreaming = writable(false);

// OpenRouter settings
export const openRouterToken = writable<string>('');
export const selectedModel = writable<string>('anthropic/claude-sonnet-4');

export function toggleChat() {
	chatOpen.update((v) => !v);
}

export function addChatMessage(role: 'user' | 'assistant' | 'system', content: string) {
	chatMessages.update((msgs) => [
		...msgs,
		{ id: nanoid(), role, content, timestamp: Date.now() }
	]);
}

function getCanvasSummary(): string {
	const $items = get(itemsStore);
	const itemsList = Array.from($items.values());
	const byType: Record<string, number> = {};
	for (const item of itemsList) {
		byType[item.type] = (byType[item.type] || 0) + 1;
	}

	let summary = `Canvas has ${itemsList.length} items: ${Object.entries(byType)
		.map(([t, c]) => `${c} ${t}(s)`)
		.join(', ')}.\n\n`;

	for (const item of itemsList.slice(0, 20)) {
		if (item.type === 'note') {
			const d = item.data as NoteData;
			summary += `- Note [${item.id}] at (${Math.round(item.x)}, ${Math.round(item.y)}): "${d.content.slice(0, 50)}"\n`;
		} else if (item.type === 'todo') {
			const d = item.data as TodoData;
			summary += `- Todo [${item.id}] "${d.title}": ${d.items.length} items, ${d.items.filter((t) => t.completed).length} done\n`;
		} else if (item.type === 'link') {
			const d = item.data as LinkData;
			summary += `- Link [${item.id}]: ${d.url}\n`;
		} else if (item.type === 'widget') {
			const d = item.data as WidgetData;
			summary += `- Widget [${item.id}]: ${d.widgetType}\n`;
		} else {
			summary += `- ${item.type} [${item.id}] at (${Math.round(item.x)}, ${Math.round(item.y)})\n`;
		}
	}

	const availableWidgets = getAllWidgets();
	summary += `\nAvailable widget types: ${availableWidgets.map((w) => w.type).join(', ')}`;

	return summary;
}

function getSystemPrompt(): string {
	return `You are Canvas AI, an assistant integrated into a 2D infinite canvas app. You help users manage their canvas — adding items, answering questions, and creating new widgets.

## Tools
Include JSON tool blocks in your response to manipulate the canvas:
\`\`\`tool
{"action": "add_note", "content": "Hello world", "color": "yellow"}
\`\`\`

Available tools:
- add_note: {"content": string, "color": "yellow"|"blue"|"green"|"pink"|"purple"}
- add_todo: {"title": string, "items": string[]}
- add_link: {"url": string, "title"?: string}
- add_widget: {"widgetType": string, "config"?: object}
- delete_item: {"id": string}
- move_item: {"id": string, "x": number, "y": number}
- update_item: {"id": string, "data": object}

## Architecture context for creating widgets
Built with SvelteKit + Svelte 5. Widgets are Svelte components registered in a widget registry. Each widget has:
- A Svelte component receiving {config, size} props
- A configSchema array defining configurable fields (accessible via right-click → "Configure [name]...")
- An optional defaultSchedule with daysOfWeek (0=Sun..6=Sat), startTime ("HH:MM"), endTime ("HH:MM")

Every canvas item has a right-click context menu with consistent base options:
- **Duplicate** — copy offset by 20px
- **Delete** — remove item
Plus type-specific options:
- Notes: "Change Color" with color picker
- Links: "Open Link"
- Widgets: "Configure [name]..." with inline config editor from configSchema

When users ask to create a new widget, describe its component behavior, configSchema, and defaultSchedule so they can add it to the codebase.

## Current canvas state
${getCanvasSummary()}`;
}

function executeToolCall(tool: { action: string; [key: string]: unknown }) {
	const cx = window.innerWidth / 2;
	const cy = window.innerHeight / 2;
	const $pan = get(pan);
	const $zoom = get(zoom);
	const pos = screenToCanvas(cx, cy, $pan, $zoom);

	switch (tool.action) {
		case 'add_note':
			addItem('note', pos.x + Math.random() * 100 - 50, pos.y + Math.random() * 100 - 50, {
				content: (tool.content as string) || '',
				color: (tool.color as string) || 'yellow'
			} as NoteData);
			break;
		case 'add_todo': {
			const todoItems = ((tool.items as string[]) || []).map((text) => ({
				id: nanoid(8),
				text,
				completed: false
			}));
			addItem('todo', pos.x + Math.random() * 100 - 50, pos.y + Math.random() * 100 - 50, {
				title: (tool.title as string) || 'Todo List',
				items: todoItems
			} as TodoData);
			break;
		}
		case 'add_link':
			addItem('link', pos.x + Math.random() * 100 - 50, pos.y + Math.random() * 100 - 50, {
				url: (tool.url as string) || '',
				title: (tool.title as string) || (tool.url as string) || ''
			} as LinkData);
			break;
		case 'add_widget': {
			const widgetType = tool.widgetType as string;
			const def = getAllWidgets().find((w) => w.type === widgetType);
			if (def) {
				const config: Record<string, unknown> = (tool.config as Record<string, unknown>) || {};
				for (const field of def.configSchema) {
					if (config[field.key] === undefined && field.default !== undefined) {
						config[field.key] = field.default;
					}
				}
				addItem(
					'widget',
					pos.x + Math.random() * 100 - 50,
					pos.y + Math.random() * 100 - 50,
					{ widgetType, config, schedule: def.defaultSchedule } as WidgetData,
					def.defaultSize
				);
			}
			break;
		}
		case 'delete_item':
			if (tool.id) removeItem(tool.id as string);
			break;
		case 'move_item':
			if (tool.id && tool.x !== undefined && tool.y !== undefined) {
				moveItem(tool.id as string, tool.x as number, tool.y as number);
			}
			break;
		case 'update_item':
			if (tool.id && tool.data) {
				updateItemData(tool.id as string, tool.data as Record<string, unknown>);
			}
			break;
	}
}

export async function sendMessage(content: string) {
	addChatMessage('user', content);
	isStreaming.set(true);

	const token = get(openRouterToken);
	const model = get(selectedModel);

	if (!token) {
		addChatMessage('assistant', 'Please set your OpenRouter API key in the chat settings to use AI features. You can get one at openrouter.ai');
		isStreaming.set(false);
		return;
	}

	const messages = [
		{ role: 'system', content: getSystemPrompt() },
		...get(chatMessages).map((m) => ({ role: m.role, content: m.content }))
	];

	try {
		const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify({ model, messages, stream: false })
		});

		if (!res.ok) {
			const err = await res.text();
			addChatMessage('assistant', `Error: ${res.status} — ${err}`);
			isStreaming.set(false);
			return;
		}

		const data = await res.json();
		const reply = data.choices?.[0]?.message?.content || 'No response';

		// Extract and execute tool calls
		const toolRegex = /```tool\n([\s\S]*?)```/g;
		let match;
		const cleanedReply = reply.replace(toolRegex, '').trim();

		while ((match = toolRegex.exec(reply)) !== null) {
			try {
				const toolCall = JSON.parse(match[1]);
				executeToolCall(toolCall);
			} catch {
				// Ignore malformed tool calls
			}
		}

		if (cleanedReply) {
			addChatMessage('assistant', cleanedReply);
		} else {
			addChatMessage('assistant', 'Done!');
		}
	} catch (e) {
		addChatMessage('assistant', `Network error: ${(e as Error).message}`);
	}

	isStreaming.set(false);
}
