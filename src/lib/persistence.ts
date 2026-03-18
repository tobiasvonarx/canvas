import { db } from '$lib/db';
import { items, initMaxZIndex } from '$lib/stores/canvas';
import type { CanvasItem } from '$lib/types';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let initialized = false;

export async function loadFromDB() {
	const allItems = await db.items.toArray();
	const map = new Map<string, CanvasItem>();
	for (const item of allItems) {
		map.set(item.id, item);
	}
	initMaxZIndex(allItems);
	items.set(map);
	initialized = true;
}

export function startPersistence() {
	items.subscribe(($items) => {
		if (!initialized) return;
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			saveToDB($items);
		}, 300);
	});
}

async function saveToDB(itemsMap: Map<string, CanvasItem>) {
	const allItems = Array.from(itemsMap.values());
	const existingIds = new Set((await db.items.toArray()).map((i) => i.id));
	const currentIds = new Set(allItems.map((i) => i.id));

	// Upsert all current items
	await db.items.bulkPut(allItems);

	// Delete removed items
	const removedIds = [...existingIds].filter((id) => !currentIds.has(id));
	if (removedIds.length > 0) {
		await db.items.bulkDelete(removedIds);
	}
}
