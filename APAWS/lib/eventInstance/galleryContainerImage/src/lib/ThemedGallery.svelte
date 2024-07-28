<script lang="ts">
	import type { ThemedGalleryData } from "./EventTypes";
	import { ThemeComponentMapping } from "./Theme";

    export let galleryData:ThemedGalleryData;

    let galleryComponent = ThemeComponentMapping[galleryData.theme];

</script>
{#if ( galleryData )}
    <svelte:component this={galleryComponent} {galleryData} />
{:else}
    <p>Gallery data not found</p>
{/if}