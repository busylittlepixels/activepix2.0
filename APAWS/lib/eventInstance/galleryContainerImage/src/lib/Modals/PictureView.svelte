<script lang="ts">

    import ModalWrapper from "./utils/ModalWrapper.svelte";
    import * as ModalManager from "$lib/ModalManager";
	import type { MediaData, ThemedGalleryData } from "$lib/EventTypes";
	import OverlayedComponent from "$lib/themes/Theme2Locked/Components/OverlayedComponent.svelte";

    export let id:number;
    export let type:ModalManager.ModalTypes
    export let data:{targetMedia:MediaData, galleryData: ThemedGalleryData};



    function closeThisModal() {
        console.log("closing modal");
        ModalManager.closeModal(id);
    }

</script>
<ModalWrapper onBackgroundClick={closeThisModal}>
    <div>
        <!-- <pre>{JSON.stringify(data,null,2)}</pre> -->
        <!-- <img class="rounded" src={data.targetMedia.large} alt={data.targetMedia.ingress} /> -->
         <OverlayedComponent data={data} galleryData={data.galleryData} lightboxed={false}/>
    </div>
    <div class="flex flex-row justify-between">
        <div class="flex items-center mt-2">
            <p>File name</p>
        </div>

        <div class="flex flex-row justify-end gap-2 mt-2">
            <button class="btn btn-md">Share</button>
            <button class="btn btn-md">Download</button>
            <button class="btn btn-md" on:click={closeThisModal}>Close</button>
        </div>

    </div>
</ModalWrapper>

<style lang="postcss">
    .btn {
        font-size: 1rem;
        line-height: 0.5;
        background-color: #00afef;
        color: #fff;
        border-color: #00afef;
    }
</style>