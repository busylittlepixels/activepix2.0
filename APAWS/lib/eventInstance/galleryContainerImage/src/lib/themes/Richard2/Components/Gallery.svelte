<script lang="ts">

    import type { ThemedGalleryData } from "$lib/EventTypes";
	import { MiscHelpers } from "$lib/MiscHelpers";

    export let galleryData:ThemedGalleryData;

    import * as ModalManager from "$lib/ModalManager";
	import OverlayedComponent from "./OverlayedComponent.svelte";

    const pictureView = (media:ThemedGalleryData['media'][0]) => {
        ModalManager.openModal(ModalManager.ModalTypes.Theme2Viewpicture, {targetMedia:media});
    };

    let firstName: string = galleryData.participantData?.firstName
    let lastName: string = galleryData.participantData?.lastName
    let distance: string = galleryData.participantData?.distance
    let time: string = galleryData.participantData?.time

    let hasName: boolean = false
    let hasDistance: boolean = false
    let hasTime: boolean = false

    if (firstName&&lastName) hasName = true
    if (distance) hasDistance = true
    if (time) hasTime = true 

</script>
<div class="flex flex-col">   
    {#if (galleryData)}
    <div class="flex flex-col w-full mb-4">
        {#if (hasName)}
            <p class="Header">{galleryData.galleryConfig.title} - {galleryData.participantData.firstName} {galleryData.participantData.lastName}</p>
        {:else}
            <p class="Header">{galleryData.galleryConfig.title}</p>
        {/if}
        {#if (hasDistance&&hasTime)}
            <p>{galleryData.galleryConfig.location} | {MiscHelpers.niceDate(galleryData.galleryConfig.date)} - {galleryData.participantData.distance} Completed in {galleryData.participantData.time}</p>
        {:else}
            <p>{galleryData.galleryConfig.location} | {MiscHelpers.niceDate(galleryData.galleryConfig.date)}</p>
        {/if}
    </div>
    {:else}
    <div>
        <p>no Race name or details</p>
    </div>
    {/if}
    <div class="flex picture-boxes">
        {#if (galleryData?.media?.length > 0)}
        <div class="gallery-container gap-4">
            {#each galleryData.media as media}
                <div class="gallery-image">
                    <OverlayedComponent data={{
                        targetMedia: media
                    }} galleryData={galleryData}></OverlayedComponent>
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
                /* padding: 7px; */
                object-fit: cover;
                width: 45%;
            }
    }
</style>