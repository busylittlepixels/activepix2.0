<script lang="ts">
    import type { MediaData } from "$lib/EventTypes";
    import type { ThemedGalleryData } from "$lib/EventTypes";
    import { Endpoints } from "$lib/Endpoints";
	import { ModalTypes, openModal } from "$lib/ModalManager";
	import { onMount } from "svelte";

    export let data:{targetMedia:MediaData};
    export let galleryData : ThemedGalleryData
    export let lightboxed: boolean = true;


    let urlPart1 = Endpoints.cms.media.files
    $: urlPart2 = galleryData.galleryConfig.overlayImageLandscape?.url
    $: fullURL = urlPart1 + urlPart2

    function openLightbox() {
        if(lightboxed){
            openModal(ModalTypes.Theme2Viewpicture, {
                targetMedia: data.targetMedia,
                galleryData: galleryData
            })
        }
    }
    let wrapperElement: HTMLElement;
    onMount(() => {
        let img = wrapperElement.querySelector('img.targetMedia') as HTMLImageElement
        img.onload = () => {
            let sWidth = img?.naturalWidth
            let sHeight = img?.naturalHeight
            console.log(img)
            console.log(img?.naturalWidth)
            if(!sWidth || !sHeight) {
                console.error('Could not get image dimensions')
                return
            }

            //If portrait, use portrait overlay
            if(sHeight > sWidth) {
                let urlPart2 = galleryData.galleryConfig.overlayImagePortrait?.url
                fullURL = urlPart1 + urlPart2
            }
        }
    })
</script> 

<div class="oi-wrapper" on:click={openLightbox} bind:this={wrapperElement}>
    <img class="rounded targetMedia" src={data.targetMedia.large} alt={data.targetMedia.ingress} />
    <img class="rounded overlayed" src={fullURL}/>
</div>

<style>
 .oi-wrapper {
    position: relative;
    cursor: pointer;
    display: inline-block;
    height: 100%;
    width: fit-content;
}

.targetMedia {
    max-width: 100%; /* Let the image resize based on its natural size within the container */
    max-height: 100%;
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
}

.overlayed {
    position: absolute;
    bottom: 0;
    right: 0;
    height: 100%;
    width: 100%;
    object-fit: contain;
    z-index: 1;
    pointer-events: none; /* Ensure clicks go through to the main image */
}
</style>