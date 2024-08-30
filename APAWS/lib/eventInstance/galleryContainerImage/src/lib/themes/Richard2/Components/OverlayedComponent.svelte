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

<div class="w-full">
    <img class="rounded" src={data.targetMedia.large} alt={data.targetMedia.ingress} />
    <img class="rounded overlayed" src={Endpoints.cms.media.files + galleryData.galleryConfig.overlayImageLandscape?.url}/>
</div>

<style>
    .overlayed {
        position: fixed;
    }
</style>