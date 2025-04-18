<script lang="ts">
	import { Endpoints } from "$lib/Endpoints";
	import ThemedGallery from "$lib/ThemedGallery.svelte";
	import type { PageData } from "./$types";

    export let data:PageData;

</script>
<!-- <pre style="display:none;">
	{JSON.stringify(data, null, 2)}
</pre> -->


<svelte:head>
	{#if data.success}
    <meta name="og:image" content="{Endpoints.cms.media.files + data?.galleryConfig?.heroImage?.url}"/>
    <meta name="og:image:width" content="{data.galleryConfig?.heroImage?.width + ""}"/>
    <meta name="og:image:height" content="{data.galleryConfig?.heroImage?.height + ""}"/>
    <meta name="og:image:alt" content="{data.galleryConfig?.heroImage?.filename}"/>
    <meta name="og:title" content="{data.galleryConfig?.title}"/>
    {#if data.participantData?.firstName}
        <meta name="og:description" content="View {data.participantData.firstName}'s gallery."/>
    {:else}
        <meta name="og:description" content="View the gallery."/>
    {/if}
	{/if}
</svelte:head>

<!-- </svelte:head> -->
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