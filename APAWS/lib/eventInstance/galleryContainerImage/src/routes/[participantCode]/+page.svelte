<script lang="ts">
	import ThemedGallery from "$lib/ThemedGallery.svelte";
	import type { PageData } from "./$types";

    export let data:PageData;

</script>
<!-- <pre style="display:none;">
	{JSON.stringify(data, null, 2)}
</pre> -->
{#if data.success}
	{#if data.theme}
		<ThemedGallery galleryData={data}/>
		{:else}
		<div class="flex items-center justify-center h-full">
			<div class="text-center">
				<h1 class="text-3xl font-bold">Error</h1>
				<p class="text-lg">No theme selected.</p>
			</div>
		</div>
	{/if}
{:else}
	<div class="flex items-center justify-center h-full">
		<div class="text-center">
			<h1 class="text-3xl font-bold">Error</h1>
			<p class="text-lg">Unfortunately, we don’t have any images for you. This may be down to a number of factors. Please email paddy@activepix.com, with your finishing time and race number, and we will try to help.</p>
		</div>
	</div>
{/if}