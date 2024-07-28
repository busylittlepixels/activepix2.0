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