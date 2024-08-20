<script lang="ts">
	import ThemedGallery from "$lib/ThemedGallery.svelte";
	import type { PageData } from "./$types";

    export let data:PageData;

</script>
<pre style="display:none;">
	{JSON.stringify(data, null, 2)}
</pre>
{#if data.success}
	{#if data.theme}
		<ThemedGallery galleryData={data}/>
		{:else}
		No theme selected.
	{/if}
{:else}
	Could not find any media for this participant.
{/if}