<script lang="ts">
    import type { MediaData } from "$lib/EventTypes";
    import type { ThemedGalleryData } from "$lib/EventTypes";
    import { Endpoints } from "$lib/Endpoints";
	import { ModalTypes, openModal } from "$lib/ModalManager";

    export let data:{targetMedia:MediaData};
    export let galleryData : ThemedGalleryData
    export let lightboxed: boolean = true;

    let urlPart1 = Endpoints.cms.media.files
    let urlPart2 = galleryData.galleryConfig.overlayImageLandscape?.url
    let fullURL = urlPart1 + urlPart2

    function openLightbox() {
        if(lightboxed){
            openModal(ModalTypes.Theme2Viewpicture, {
                targetMedia: data.targetMedia,
                galleryData: galleryData
            })
        }
    }
</script> 

<div class="oi-wrapper w-full" on:click={openLightbox}>
    <img class="rounded" src={data.targetMedia.large} alt={data.targetMedia.ingress} />
    <img class="rounded overlayed" src={Endpoints.cms.media.files + galleryData.galleryConfig.overlayImageLandscape?.url}/>
</div>
<!-- 
//Create a wrapper that is full width and full height,
//Then have an image that fills that space while maintaining aspect ratio and being centered
//And the second image overlayed on top of the first image
//The second image should cover the first image, maintaining aspect ratio and being anchored to the bottom right corner -->

<!-- <div class="overlayed-wrapper">
    <img class="image rounded" src={data.targetMedia.large} alt={data.targetMedia.ingress} />
    <img class="overlay rounded" src={Endpoints.cms.media.files + galleryData.galleryConfig.overlayImageLandscape?.url}/>
</div> -->

<style>
    .overlayed-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
    }
    .image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .overlay {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .oi-wrapper {
        position: relative;
        cursor: pointer;
    }
    .overlayed {
        position: absolute;
        bottom: 0;
        /*Horizontal center*/
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 1;
    }
</style>