<script lang="ts">
	import type { ThemedGalleryData } from "$lib/EventTypes";
	import { writable, type Writable } from "svelte/store";
	import GalleryThumbnail from "./GalleryThumbnail.svelte";
	import SponsorBox from "./SponsorBox.svelte";
	import { ModalManagerInstance } from "../ModalManager";
	import GalleryLightbox from "./Modals/GalleryLightbox.svelte";

    export let galleryData:ThemedGalleryData;


    //Returns the media for this gallery in groups of thumbnailsPerGroup
    let thumbnailsPerGroup = 6;
    function groupedThumbnails() {
        const media = galleryData.media;

        //Debug, fill with duplicates
        while (media.length < 30) {
            media.push(media[0]);
        }

        const groups = [];
        for (let i = 0; i < media.length; i += thumbnailsPerGroup) {
            groups.push(media.slice(i, i + thumbnailsPerGroup));
        }
        return groups;
    }

    function indexFromGroupedThumbnails(groupIndex:number, mediaIndexInGroup:number) {
        return groupIndex * thumbnailsPerGroup + mediaIndexInGroup;
    }

    let gallerySliderIndex:Writable<number> = writable(0);
    

    function openLightbox(index:number=0) {
        gallerySliderIndex.set(index);
        ModalManagerInstance.openModal(GalleryLightbox, writable({
            galleryData,
            gallerySliderIndex
        }));
    }
</script>

<!-- <div class="container m-auto">
    <div class="grid gap-1 grid-cols-3">
        <GalleryThumbnail/>
        <GalleryThumbnail/>
        <GalleryThumbnail/>
        <GalleryThumbnail/>
        <GalleryThumbnail/>
        <GalleryThumbnail/>
        <GalleryThumbnail/>
        <GalleryThumbnail/>
        <GalleryThumbnail/>
    </div>
</div> -->

{#if (!galleryData)}
    <p>No gallery data.</p>
{:else}
    {#if (galleryData.media.length === 0)}
        <p>No media.</p>
    {:else}
        {#each groupedThumbnails() as group, groupIndex}
            <div class="pg pg-2">
                <div class="container mx-auto px-2" class:flipSlant={groupIndex % 2 ===0}>
                    <div class="grid gap-1 grid-cols-2 md:grid-cols-3">
                        {#each group as media, mediaIndexInGroup}
                            <GalleryThumbnail onClick={()=>{
                                //Open lightbox with this media index.
                                console.log('Opening lightbox with index', indexFromGroupedThumbnails(groupIndex, mediaIndexInGroup));
                                openLightbox(indexFromGroupedThumbnails(groupIndex, mediaIndexInGroup));
                                }}/>
                        {/each}
                    </div>
                </div>
            </div>
            <div class="pog pg-0">
                <SponsorBox {galleryData} index={groupIndex}/>
            </div>
        {/each}
    {/if}
{/if}


<style lang="postcss">
    .container {
        transform: rotate(-3deg) scale(.6);
    }

    .flipSlant {
        transform: rotate(3deg) scale(.6)
    }
</style>