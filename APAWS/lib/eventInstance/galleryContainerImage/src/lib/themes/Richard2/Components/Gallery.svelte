<script lang="ts">

    import type { ThemedGalleryData } from "$lib/EventTypes";
	import { MiscHelpers } from "$lib/MiscHelpers";

    export let galleryData:ThemedGalleryData;

    import * as ModalManager from "$lib/ModalManager";

    const pictureView = (media:ThemedGalleryData['media'][0]) => {
        ModalManager.openModal(ModalManager.ModalTypes.Theme2Viewpicture, {targetMedia:media});
    };

</script>
<div class="flex flex-col">   
    {#if (galleryData)}
    <div class="flex flex-col w-full mb-4">
        <p class="Header">{galleryData.galleryConfig.title}</p>
        <p>{galleryData.galleryConfig.location} | {MiscHelpers.niceDate(galleryData.galleryConfig.date)}</p>
    </div>
    {:else}
    <div>
        <p>no Race name or details</p>
    </div>
    {/if}
    <div class="flex picture-boxes">
        {#if (galleryData?.media?.length > 0)}
        <div class="gallery-container">
            {#each galleryData.media as media}
                <div class="gallery-image">
                    <img class="rounded" src={media.thumbnail} alt={media.ingress} on:click={()=>{pictureView(media)}}/>
                </div>
            {/each}
        </div>
    {:else}
        <p>Gallery media not found</p>
    {/if}
    </div>
</div>

<style>
    .Header {
        font-size: 2rem;
    }

    .gallery-container {
        display: flex;
        flex-wrap: wrap;
        background-color: transparent;
        width: 100%;
    }

    .gallery-image {
        flex: 1 1 300px;
        border-radius: 10px;
        padding-top: 5px;
        padding-bottom: 5px;
        object-fit: cover;  
    }

    .rounded {
    border-radius: 5px;
    box-shadow: 0px 0px 20px 0px rgba(22, 14, 14, 0.486);
    transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1); /* Smooth transition using cubic-bezier */
  }

  .rounded:hover {
    transform: scale(101%);
    cursor: pointer;
    opacity: 0.8;
  }

  @media screen and (max-width:950px) {
    .gallery-image {
                flex: auto;
                border-radius: 10px;
                padding: 7px;
                object-fit: cover;
                width: 50%;
            }
    }
</style>