<script lang="ts">
	import type { ThemedGalleryData } from "$lib/EventTypes";
    import { Endpoints } from "$lib/Endpoints";

    export let galleryData : ThemedGalleryData

</script>
<div class="sponsorWrapper flex w-full">
    {#if (galleryData)}
        <div class="w-full flex sizing flex-col justify-center" style="background-image: url('{Endpoints.cms.media.files}{galleryData.galleryConfig.ctaImage?.url}');">
            {#if (galleryData.galleryConfig.ctaText)}
                <div class="textOverlay w-full h-full items-center justify-center flex">
                    <p>{galleryData.galleryConfig.ctaText}</p>
                </div>
            {/if}
        </div>
    {/if}
</div>


<style lang="postcss">

    .sponsorWrapper {
        padding-left: 5px;
        padding-right: 5px;
        cursor: pointer;
        transition: all, 0.2s;
    }

    .sponsorWrapper:focus, .sponsorWrapper:hover {
        outline: 0;
        border: 0;
        opacity: 85%;
        transform: scale(101%);
        transition: all, 0.2s;
    }

    .sizing {
        min-height: 400px;
        max-height: 500px;
        border-radius: 10px;
        flex: auto;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        overflow: hidden;
    }

    .textOverlay {
        background-color: rgba(0, 0, 0, 0.404);
        color: white;
    }

    @media screen and (max-width:950px) {
        .sizing {
        min-height: 200px;
        max-height: 300px;
        border-radius: 10px;
        flex: auto;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        overflow: hidden;
    }
    }
</style>