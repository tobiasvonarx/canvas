<script lang="ts">
	import '../app.css';
	import { theme } from '$lib/stores/theme';

	let { children } = $props();

	// Subscribe to ensure theme store initializes and applies .dark class
	$effect(() => { $theme; });
</script>

{@render children()}
