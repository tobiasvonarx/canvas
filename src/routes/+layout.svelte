<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { registerBuiltinWidgets } from '$lib/widgets/index';
	import { loadFromDB, startPersistence } from '$lib/persistence';

	let { children } = $props();
	let ready = $state(false);

	onMount(async () => {
		registerBuiltinWidgets();
		await loadFromDB();
		startPersistence();
		ready = true;
	});
</script>

<svelte:head>
	<title>Canvas</title>
</svelte:head>

{#if ready}
	{@render children()}
{:else}
	<div class="loading">
		<span>Loading Canvas...</span>
	</div>
{/if}

<style>
	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100vh;
		color: var(--color-text-secondary);
		font-size: 14px;
	}
</style>
