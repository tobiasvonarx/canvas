export function screenToCanvas(
	screenX: number,
	screenY: number,
	pan: { x: number; y: number },
	zoom: number
): { x: number; y: number } {
	return {
		x: (screenX - pan.x) / zoom,
		y: (screenY - pan.y) / zoom
	};
}

export function canvasToScreen(
	canvasX: number,
	canvasY: number,
	pan: { x: number; y: number },
	zoom: number
): { x: number; y: number } {
	return {
		x: canvasX * zoom + pan.x,
		y: canvasY * zoom + pan.y
	};
}

export function zoomAtPoint(
	currentPan: { x: number; y: number },
	currentZoom: number,
	newZoom: number,
	focalScreenX: number,
	focalScreenY: number
): { pan: { x: number; y: number }; zoom: number } {
	const canvasPoint = screenToCanvas(focalScreenX, focalScreenY, currentPan, currentZoom);
	return {
		zoom: newZoom,
		pan: {
			x: focalScreenX - canvasPoint.x * newZoom,
			y: focalScreenY - canvasPoint.y * newZoom
		}
	};
}

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 3.0;
export const ZOOM_STEP = 0.1;

export function clampZoom(zoom: number): number {
	return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}
