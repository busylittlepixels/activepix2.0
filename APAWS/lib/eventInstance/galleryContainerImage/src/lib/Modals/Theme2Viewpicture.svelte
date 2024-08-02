<script lang="ts">

    import ModalWrapper2 from "./utils/ModalWrapper2.svelte";
    import * as ModalManager from "$lib/ModalManager";
	import type { MediaData } from "$lib/EventTypes";

    export let id:number;
    export let type:ModalManager.ModalTypes
    export let data:{targetMedia:MediaData};



    function closeThisModal() {
        console.log("closing modal");
        ModalManager.closeModal(id);
    }

</script>
<ModalWrapper2 onBackgroundClick={closeThisModal}>
    <div>
        <!-- <pre>{JSON.stringify(data,null,2)}</pre> -->
        <img class="rounded" src={data.targetMedia.large} alt={data.targetMedia.ingress} />
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
</ModalWrapper2>

<style lang="postcss">
    .btn {
        font-size: 1rem;
        line-height: 0.5;
        background-color: #00afef;
        color: #fff;
        border-color: #00afef;
    }
</style>