<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		config: Record<string, unknown>;
	}

	let { config }: Props = $props();

	let location = $derived((config.location as string) || 'London');

	interface WeatherData {
		temp: number;
		condition: string;
		icon: string;
		humidity: number;
		wind: number;
		feelsLike: number;
	}

	let weather = $state<WeatherData | null>(null);
	let loading = $state(true);
	let error = $state('');

	async function fetchWeather() {
		loading = true;
		error = '';
		try {
			const res = await fetch(
				`https://wttr.in/${encodeURIComponent(location)}?format=j1`
			);
			if (!res.ok) throw new Error('Failed to fetch weather');
			const data = await res.json();
			const current = data.current_condition[0];
			weather = {
				temp: parseInt(current.temp_C),
				condition: current.weatherDesc[0].value,
				icon: getWeatherEmoji(parseInt(current.weatherCode)),
				humidity: parseInt(current.humidity),
				wind: parseInt(current.windspeedKmph),
				feelsLike: parseInt(current.FeelsLikeC)
			};
		} catch (e) {
			error = 'Failed to load weather';
		}
		loading = false;
	}

	function getWeatherEmoji(code: number): string {
		if (code === 113) return '☀️';
		if (code === 116) return '⛅';
		if (code === 119 || code === 122) return '☁️';
		if ([176, 263, 266, 293, 296, 299, 302, 305, 308, 311, 314, 353, 356, 359].includes(code))
			return '🌧️';
		if ([179, 182, 185, 227, 230, 323, 326, 329, 332, 335, 338, 350, 362, 365, 368, 371, 374, 377].includes(code))
			return '❄️';
		if ([200, 386, 389, 392, 395].includes(code)) return '⛈️';
		if ([143, 248, 260].includes(code)) return '🌫️';
		return '🌤️';
	}

	$effect(() => {
		location;
		fetchWeather();
	});
</script>

<div class="weather">
	{#if loading && !weather}
		<div class="loading">Loading weather...</div>
	{:else if error && !weather}
		<div class="error">{error}</div>
	{:else if weather}
		<div class="weather-main">
			<span class="weather-icon">{weather.icon}</span>
			<div class="temp-group">
				<span class="temp">{weather.temp}°C</span>
				<span class="condition">{weather.condition}</span>
			</div>
		</div>
		<div class="weather-details">
			<span class="detail">Feels like {weather.feelsLike}°</span>
			<span class="detail">💧 {weather.humidity}%</span>
			<span class="detail">🌬️ {weather.wind} km/h</span>
		</div>
		<div class="location-label">{location}</div>
	{/if}
</div>

<style>
	.weather {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: 8px;
		padding: 12px;
	}

	.loading, .error {
		font-size: 12px;
		color: var(--color-text-tertiary);
	}

	.error {
		color: var(--color-danger);
	}

	.weather-main {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.weather-icon {
		font-size: 36px;
		line-height: 1;
	}

	.temp-group {
		display: flex;
		flex-direction: column;
	}

	.temp {
		font-size: 28px;
		font-weight: 300;
		line-height: 1.1;
	}

	.condition {
		font-size: 12px;
		color: var(--color-text-secondary);
	}

	.weather-details {
		display: flex;
		gap: 12px;
		font-size: 11px;
		color: var(--color-text-tertiary);
	}

	.location-label {
		font-size: 11px;
		color: var(--color-text-tertiary);
		margin-top: 2px;
	}
</style>
