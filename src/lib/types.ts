export type ItemType = 'note' | 'link' | 'image' | 'todo' | 'widget';

export interface CanvasItem {
	id: string;
	type: ItemType;
	x: number;
	y: number;
	width: number;
	height: number;
	zIndex: number;
	createdAt: number;
	updatedAt: number;
	data: NoteData | LinkData | ImageData | TodoData | WidgetData;
}

export interface NoteData {
	content: string;
	color: string;
}

export interface LinkData {
	url: string;
	title?: string;
	description?: string;
	favicon?: string;
}

export interface ImageData {
	src: string;
	alt?: string;
}

export interface TodoData {
	items: TodoEntry[];
	title: string;
}

export interface TodoEntry {
	id: string;
	text: string;
	completed: boolean;
}

export interface WidgetData {
	widgetType: string;
	config: Record<string, unknown>;
	schedule?: Schedule;
}

export interface Schedule {
	cron?: string;
	duration?: number;
	daysOfWeek?: number[];
	startTime?: string;
	endTime?: string;
	timezone?: string;
}

export interface WidgetDefinition {
	type: string;
	name: string;
	description: string;
	icon: string;
	defaultSize: { width: number; height: number };
	configSchema: ConfigField[];
	component: any;
	defaultSchedule?: Schedule;
}

export interface ConfigField {
	key: string;
	label: string;
	type: 'text' | 'number' | 'select' | 'boolean' | 'url' | 'time' | 'days';
	default?: unknown;
	options?: { label: string; value: string }[];
	placeholder?: string;
}

export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: number;
}
