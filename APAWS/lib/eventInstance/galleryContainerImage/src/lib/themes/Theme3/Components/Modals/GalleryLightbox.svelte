<script lang="ts">
	import { writable, type Writable } from "svelte/store";
	import ModalWrapper from "../../ModalWrapper.svelte";
	import type { ThemedGalleryData } from "$lib/EventTypes";
	import { ModalManagerInstance } from "../../ModalManager";
	import ShareGalleryModal from "./ShareGalleryModal.svelte";

    export let data: Writable<{
        gallerySliderIndex: Writable<number>;
        galleryData: ThemedGalleryData;
    }>;
    export let id: number
    const gallerySliderIndex = $data.gallerySliderIndex;
    function urlFromIndex(index:number) {
        return $data.galleryData.media[index].large;
    }

</script>

<ModalWrapper id={id} fullscreen={true} transparent={true}>
    <div class="wrapper">
        <div class="meta mb-1">Image {$gallerySliderIndex}</div>
        <img src={urlFromIndex($gallerySliderIndex)} alt="Gallery Image" class="w-full h-full object-contain"/>
        <div class="controls">
            <div class="controls-wrapper">
                <div class="navigation flex gap-1 mb-1">
                    
                    <button 
                    on:click={() => {
                        if($gallerySliderIndex > 0) {
                            gallerySliderIndex.update(n => n - 1);
                        }
                    }}
                    class="control left"
                    class:disabled={$gallerySliderIndex < 1}
                    >&lt;</button>
    
                    <button on:click={() => ModalManagerInstance.closeModal(id)} class="control large">Close</button>
    
                    <button
                    on:click={() => {
                        if($gallerySliderIndex < $data.galleryData.media.length - 1) {
                            gallerySliderIndex.update(n => n + 1);
                        }
                    }}
                    class="control right"
                    class:disabled={$gallerySliderIndex >= $data.galleryData.media.length - 1}
                    >&gt;</button>
                </div>
                <button on:click={() => ModalManagerInstance.openModal(ShareGalleryModal, writable({
                    galleryData: $data.galleryData,
                    mediaIndex: $gallerySliderIndex
                }))} class="control skinny">Share</button>
            </div>
        </div>
            
    </div>
    
</ModalWrapper>

<style lang="postcss">
    .wrapper {
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .wrapper img {
        max-height: 92vh;
        max-width: 92vw;
        margin: auto;
        width: auto;
        height: auto;

    }

    .controls {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 1rem;
        padding-bottom: 3rem;
    }

    .meta {
        position: absolute;
        top: 2rem;
        left: 0;
        right: 0;
        background-color: rgba(0,0,0,0.5);
        color: white;
        letter-spacing: 1px;
        text-transform: uppercase;
        padding: .25rem .5rem;
        margin:auto;
    }
    .control {
        background-color: rgba(0,0,0,0.8);
        color: white;
        width: 50px;
        height: 50px;
        padding-left: 1rem;
        padding-right: 1rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    .control.disabled {
        pointer-events: none;
        opacity: 0.5;
    }
    .control.large {
        width: auto;
        padding-left: 2rem;
        padding-right: 2rem;
    }
    .control.skinny {
        width:100%;
        padding-top:0.25rem;
        padding-bottom:0.25rem;
        padding-left: 2rem;
        padding-right: 2rem;
    }
</style>