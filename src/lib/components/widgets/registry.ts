import type { WidgetDefinition } from '$lib/types';

const widgetRegistry = new Map<string, WidgetDefinition>();

export function registerWidget(definition: WidgetDefinition) {
	widgetRegistry.set(definition.type, definition);
}

export function getWidget(type: string): WidgetDefinition | undefined {
	return widgetRegistry.get(type);
}

export function getAllWidgets(): WidgetDefinition[] {
	return Array.from(widgetRegistry.values());
}

export { widgetRegistry };
