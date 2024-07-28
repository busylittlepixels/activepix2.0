<script lang="ts">
	import type { ThemedGalleryData } from "$lib/EventTypes";

    export let galleryData:ThemedGalleryData;

</script>

{#if (galleryData?.media?.length > 0)}
    <div class="gallery-container">
        {#each galleryData.media as media}
            <div class="gallery-image">
                <img src={media.thumbnail} alt={media.ingress} />
            </div>
        {/each}
    </div>
{:else}
    <p>Gallery media not found</p>
{/if}

<style>
    .gallery-container {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        background-color: black;
        width: 100%;
    }

    .gallery-image {
        flex: 1 1 200px;
    }
</style>