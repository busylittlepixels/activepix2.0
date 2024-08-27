<script lang="ts">
	import type { ThemedGalleryData } from "$lib/EventTypes";
    import { Endpoints } from "$lib/Endpoints";

    // export let galleryData : ThemedGalleryData
    export let ctaData: {
        ctaText: string,
        ctaImage: string
        ctaHref: string
    }

</script>
<a class="sponsorWrapper flex w-full" target="_blank" href="{ctaData.ctaHref}">
    {#if (ctaData)}
        <div class="w-full flex sizing flex-col justify-center" style="background-image: url('{ctaData.ctaImage}');">
            {#if (ctaData.ctaText && ctaData.ctaText !== "")}
                <div class="textOverlay w-full h-full items-center justify-center flex">
                    <p>{ctaData.ctaText}</p>
                </div>
            {/if}
        </div>
    {/if}
</a>


<style lang="postcss">

    .sponsorWrapper {
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
        min-height: 250px;
        max-height: 350px;
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