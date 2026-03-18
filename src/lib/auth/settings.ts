/**
 * Thin wrappers around the Dexie `settings` table for key-value storage.
 * Used for auth tokens, provider selection, and other app settings.
 */
import { db } from '$lib/db';

export async function getSetting<T = unknown>(key: string): Promise<T | undefined> {
	const record = await db.settings.get(key);
	return record?.value as T | undefined;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
	await db.settings.put({ key, value });
}

export async function deleteSetting(key: string): Promise<void> {
	await db.settings.delete(key);
}
