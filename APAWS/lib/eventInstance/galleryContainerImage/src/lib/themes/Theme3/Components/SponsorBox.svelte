<script lang="ts">
	import { Endpoints } from "$lib/Endpoints";
	import type { ThemedGalleryData } from "$lib/EventTypes";
	import { onMount } from "svelte";

    export let galleryData:ThemedGalleryData;
    export let index:number;

    let sponsorData:{
        imageURL:string;
        link:string;
        text:string;
    }[] = []
    let ready = false;
    onMount(()=>{
        console.log({
            ctaImage: galleryData.galleryConfig.ctaImage,
            ctaAltImage: galleryData.galleryConfig.ctaAltImage
        })
        if(galleryData.galleryConfig.ctaImage) {
            console.log('pushing cta image')
            sponsorData.push({
                imageURL: Endpoints.cms.media.files + galleryData.galleryConfig.ctaImage.url,
                link: galleryData.galleryConfig.ctaLink,
                text: galleryData.galleryConfig.ctaText
            });
        }
        if(galleryData.galleryConfig.ctaAltImage) {
            sponsorData.push({
                imageURL: Endpoints.cms.media.files + galleryData.galleryConfig.ctaAltImage.url,
                link: galleryData.galleryConfig.ctaAltLink,
                text: galleryData.galleryConfig.ctaAltText
            });
        }
        ready = true;
    })
    

    function datumFromIndex(index:number) {
        console.log('Datum from index', index, sponsorData[index % sponsorData.length]);
        console.log(sponsorData.length)
        console.log('converted index to mod', index % sponsorData.length);
        return sponsorData[index % sponsorData.length];
    }
    // console.log(datumFromIndex(index));
</script>
{#if (datumFromIndex(index) && ready)}
    
<a class="container mx-auto w-full flex flex-col justify-center items-center" href="{datumFromIndex(index).link}">
    <div class="bg-cover bg-center w-full h-full " style="background-image: url('{datumFromIndex(index).imageURL}')">
        {#if datumFromIndex(index).text}
            <div class="sponsor-text-container p-2 w-full h-full flex flex-col justify-center items-center">
                <p>{datumFromIndex(index).text}</p>
            </div>
        {/if}
    </div>

</a>
{:else}
<p>No sponsor data found</p>
{/if}

<style lang="postcss">
    .container {
        /* transform: scale(0.6); */
        min-height: 20vh;
        height: 300px;
        background: blue;
        margin-top: -10%;
        margin-bottom: -10%;
    }

    .sponsor-text-container {
        background: rgba(0,0,0,0.25)
    }
</style>