import type { Schedule } from '$lib/types';

export function isScheduleActive(schedule: Schedule | undefined): boolean {
	if (!schedule) return true;

	const now = new Date();
	const currentDay = now.getDay();
	const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

	// Check day-of-week filter
	if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
		if (!schedule.daysOfWeek.includes(currentDay)) return false;
	}

	// Check time range
	if (schedule.startTime && schedule.endTime) {
		if (currentTime < schedule.startTime || currentTime >= schedule.endTime) return false;
	} else if (schedule.startTime) {
		if (currentTime < schedule.startTime) return false;
		// If duration is set, check if we're within the window
		if (schedule.duration) {
			const [startH, startM] = schedule.startTime.split(':').map(Number);
			const startMinutes = startH * 60 + startM;
			const currentMinutes = now.getHours() * 60 + now.getMinutes();
			if (currentMinutes >= startMinutes + schedule.duration) return false;
		}
	}

	return true;
}
