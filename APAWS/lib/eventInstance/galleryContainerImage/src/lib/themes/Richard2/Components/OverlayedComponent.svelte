<script lang="ts">
    import type { MediaData } from "$lib/EventTypes";
    import type { ThemedGalleryData } from "$lib/EventTypes";
    import { Endpoints } from "$lib/Endpoints";

    export let data:{targetMedia:MediaData};
    export let galleryData : ThemedGalleryData

    let urlPart1 = Endpoints.cms.media.files
    let urlPart2 = galleryData.galleryConfig.overlayImageLandscape?.url
    let fullURL = urlPart1 + urlPart2
</script> 

<div class="oi-wrapper w-full">
    <img class="rounded" src={data.targetMedia.large} alt={data.targetMedia.ingress} />
    <img class="rounded overlayed" src={Endpoints.cms.media.files + galleryData.galleryConfig.overlayImageLandscape?.url}/>
</div>

<style>
    .oi-wrapper {
        position: relative;
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