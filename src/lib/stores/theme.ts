import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createThemeStore() {
	const stored = browser ? localStorage.getItem('canvas-theme') : null;
	const prefersDark = browser ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
	const initial = stored ? stored === 'dark' : prefersDark;

	const { subscribe, set, update } = writable<'light' | 'dark'>(initial ? 'dark' : 'light');

	if (browser) {
		// Apply initial theme
		document.documentElement.classList.toggle('dark', initial);

		// Listen for system preference changes (only if no manual override)
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
			if (!localStorage.getItem('canvas-theme')) {
				const isDark = e.matches;
				set(isDark ? 'dark' : 'light');
				document.documentElement.classList.toggle('dark', isDark);
			}
		});
	}

	return {
		subscribe,
		toggle() {
			update((current) => {
				const next = current === 'light' ? 'dark' : 'light';
				if (browser) {
					localStorage.setItem('canvas-theme', next);
					document.documentElement.classList.toggle('dark', next === 'dark');
				}
				return next;
			});
		}
	};
}

export const theme = createThemeStore();
