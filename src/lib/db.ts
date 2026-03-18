import Dexie, { type Table } from 'dexie';
import type { CanvasItem, ChatMessage } from '$lib/types';

export interface SettingRecord {
	key: string;
	value: unknown;
}

export class CanvasDB extends Dexie {
	items!: Table<CanvasItem, string>;
	chatHistory!: Table<ChatMessage, string>;
	settings!: Table<SettingRecord, string>;

	constructor() {
		super('canvas-db');
		this.version(1).stores({
			items: 'id, type, updatedAt',
			chatHistory: 'id, timestamp',
			settings: 'key'
		});
	}
}

export const db = new CanvasDB();
