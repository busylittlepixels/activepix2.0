<script lang="ts">
    import type { ThemedGalleryData } from "$lib/EventTypes";
    import { Endpoints } from "$lib/Endpoints";

    export let galleryData : ThemedGalleryData

</script>

<div class="HeroWrapper flex w-full">
    {#if (galleryData)}
        <div class="w-full flex sizing flex-col justify-center" style="background-image: url('{Endpoints.cms.media.files}{galleryData.galleryConfig.overlayImage?.url}');">
            {#if (galleryData.galleryConfig.ctaText)}
                <div class="textOverlay w-full h-full items-center justify-center flex flex-col">
                    <p class="text-4xl"><span class="text-yellow-400">{galleryData.galleryConfig.title}</span></p>
                    <p class="text-2xl"><span class="text-yellow-400">{galleryData.galleryConfig.date}</span></p>
                    <div class="flex flex-row items-center">
                        <div class="icon-sizing">
                            <svg width="2rem" height="2rem" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path fill="none" stroke="#DAE521" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15,11 L18,13 M18,5 C18.5522847,5 19,4.55228475 19,4 C19,3.44771525 18.5522847,3 18,3 C17.4477153,3 17,3.44771525 17,4 C17,4.55228475 17.4477153,5 18,5 Z M9.5,9.5 L9.52493781,6 L14.0249378,6 L15,6 L8,17 L4,17 M15,8 L12,13 L12.5,14 L17,7.5 L15,6 M11,13 L16,16.5 L16,21.5"/>
                            </svg>
                        </div>
                        <p class="text-2xl">{galleryData.galleryConfig.location}</p>
                        <div>
                            <svg width="2rem" height="2rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 14V11M12 6C7.85786 6 4.5 9.35786 4.5 13.5C4.5 17.6421 7.85786 21 12 21C16.1421 21 19.5 17.6421 19.5 13.5C19.5 11.5561 18.7605 9.78494 17.5474 8.4525M12 6C14.1982 6 16.1756 6.94572 17.5474 8.4525M12 6V3M19.5 6.5L17.5474 8.4525M12 3H9M12 3H15" stroke="#DAE521" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style lang="postcss">

    .HeroWrapper {
        padding-left: 5px;
        padding-right: 5px;
        /* cursor: pointer; */
        transition: all, 0.2s;
    }

    /* .HeroWrapper:focus, .HeroWrapper:hover {
        outline: 0;
        border: 0;
        opacity: 85%;
        transform: scale(101%);
        transition: all, 0.2s;
    } */

    .sizing {
        min-height: 500px;
        max-height: 600px;
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