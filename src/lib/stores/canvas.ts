import { writable, derived, get } from 'svelte/store';
import { nanoid } from 'nanoid';
import type { CanvasItem, ItemType } from '$lib/types';

// Viewport state
export const pan = writable({ x: 0, y: 0 });
export const zoom = writable(1);

// Items
export const items = writable<Map<string, CanvasItem>>(new Map());

// Selection
export const selectedIds = writable<Set<string>>(new Set());

// Derived: items as array sorted by zIndex
export const itemsArray = derived(items, ($items) =>
	Array.from($items.values()).sort((a, b) => a.zIndex - b.zIndex)
);

// Next z-index counter
let maxZIndex = 0;

function getNextZIndex(): number {
	maxZIndex++;
	return maxZIndex;
}

export function initMaxZIndex(existingItems: CanvasItem[]) {
	maxZIndex = existingItems.reduce((max, item) => Math.max(max, item.zIndex), 0);
}

export function addItem(
	type: ItemType,
	x: number,
	y: number,
	data: CanvasItem['data'],
	size?: { width: number; height: number }
): string {
	const id = nanoid();
	const now = Date.now();
	const defaults: Record<ItemType, { width: number; height: number }> = {
		note: { width: 240, height: 160 },
		link: { width: 280, height: 80 },
		image: { width: 300, height: 200 },
		todo: { width: 240, height: 200 },
		widget: { width: 300, height: 250 }
	};

	const item: CanvasItem = {
		id,
		type,
		x,
		y,
		width: size?.width ?? defaults[type].width,
		height: size?.height ?? defaults[type].height,
		zIndex: getNextZIndex(),
		createdAt: now,
		updatedAt: now,
		data
	};

	items.update((m) => {
		const next = new Map(m);
		next.set(id, item);
		return next;
	});

	return id;
}

export function updateItem(id: string, partial: Partial<CanvasItem>) {
	items.update((m) => {
		const existing = m.get(id);
		if (!existing) return m;
		const next = new Map(m);
		next.set(id, { ...existing, ...partial, updatedAt: Date.now() });
		return next;
	});
}

export function updateItemData(id: string, data: Partial<CanvasItem['data']>) {
	items.update((m) => {
		const existing = m.get(id);
		if (!existing) return m;
		const next = new Map(m);
		next.set(id, {
			...existing,
			data: { ...existing.data, ...data } as CanvasItem['data'],
			updatedAt: Date.now()
		});
		return next;
	});
}

export function removeItem(id: string) {
	items.update((m) => {
		const next = new Map(m);
		next.delete(id);
		return next;
	});
	selectedIds.update((s) => {
		const next = new Set(s);
		next.delete(id);
		return next;
	});
}

export function moveItem(id: string, x: number, y: number) {
	updateItem(id, { x, y });
}

export function resizeItem(id: string, width: number, height: number) {
	updateItem(id, { width: Math.max(100, width), height: Math.max(60, height) });
}

export function bringToFront(id: string) {
	updateItem(id, { zIndex: getNextZIndex() });
}

export function selectItem(id: string, additive = false) {
	selectedIds.update((s) => {
		if (additive) {
			const next = new Set(s);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		}
		return new Set([id]);
	});
}

export function clearSelection() {
	selectedIds.set(new Set());
}

export function selectAll() {
	const $items = get(items);
	selectedIds.set(new Set($items.keys()));
}

export function deleteSelected() {
	const ids = get(selectedIds);
	items.update((m) => {
		const next = new Map(m);
		ids.forEach((id) => next.delete(id));
		return next;
	});
	selectedIds.set(new Set());
}

export function duplicateItem(id: string) {
	const $items = get(items);
	const item = $items.get(id);
	if (!item) return;

	addItem(item.type, item.x + 20, item.y + 20, structuredClone(item.data), {
		width: item.width,
		height: item.height
	});
}
