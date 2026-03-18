import { registerWidget } from '$lib/components/widgets/registry';
import ClockWidget from './clock.svelte';
import RssFeedWidget from './rss-feed.svelte';
import LunchMenuWidget from './lunch-menu.svelte';
import PomodoroWidget from './pomodoro.svelte';
import WeatherWidget from './weather.svelte';

export function registerBuiltinWidgets() {
	registerWidget({
		type: 'clock',
		name: 'Clock',
		description: 'Displays the current time and date',
		icon: 'Clock',
		defaultSize: { width: 220, height: 120 },
		configSchema: [],
		component: ClockWidget
	});

	registerWidget({
		type: 'rss-feed',
		name: 'RSS Feed',
		description: 'Displays items from an RSS or Atom feed',
		icon: 'Rss',
		defaultSize: { width: 320, height: 350 },
		configSchema: [
			{
				key: 'feedUrl',
				label: 'Feed URL',
				type: 'url',
				default: 'https://hnrss.org/frontpage?count=10',
				placeholder: 'https://example.com/feed.xml'
			},
			{
				key: 'maxItems',
				label: 'Max items',
				type: 'number',
				default: 10
			}
		],
		component: RssFeedWidget
	});

	registerWidget({
		type: 'lunch-menu',
		name: 'Lunch Menu',
		description: 'Fetches and shows the daily lunch menu from any canteen page',
		icon: 'UtensilsCrossed',
		defaultSize: { width: 280, height: 320 },
		configSchema: [
			{
				key: 'name',
				label: 'Canteen name',
				type: 'text',
				default: 'Canteen',
				placeholder: 'e.g. West Hub, Mensa'
			},
			{
				key: 'menuUrl',
				label: 'Menu page URL',
				type: 'url',
				default: '',
				placeholder: 'https://example.com/lunch-menu'
			}
		],
		component: LunchMenuWidget,
		defaultSchedule: {
			daysOfWeek: [1, 2, 3, 4, 5],
			startTime: '10:00',
			endTime: '13:00'
		}
	});

	registerWidget({
		type: 'pomodoro',
		name: 'Pomodoro',
		description: 'Focus timer with work/break intervals',
		icon: 'Timer',
		defaultSize: { width: 200, height: 240 },
		configSchema: [
			{
				key: 'workMinutes',
				label: 'Work (minutes)',
				type: 'number',
				default: 25
			},
			{
				key: 'breakMinutes',
				label: 'Break (minutes)',
				type: 'number',
				default: 5
			}
		],
		component: PomodoroWidget
	});

	registerWidget({
		type: 'weather',
		name: 'Weather',
		description: 'Current weather for a location',
		icon: 'CloudSun',
		defaultSize: { width: 220, height: 160 },
		configSchema: [
			{
				key: 'location',
				label: 'Location',
				type: 'text',
				default: 'London',
				placeholder: 'e.g. New York, Tokyo, Berlin'
			}
		],
		component: WeatherWidget
	});
}
