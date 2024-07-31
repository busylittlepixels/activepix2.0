<script lang="ts">

    import ModalWrapper from "../../../modals/utils/ModalWrapper.svelte";
    import * as ModalManager from "$lib/ModalManager";

    export let id:number;
    export let type:ModalManager.ModalTypes
    export let data:{someData:string};



    function closeThisModal() {
        console.log("closing modal");
        ModalManager.closeModal(id);
    }
</script>
<ModalWrapper onBackgroundClick={closeThisModal}>
    <div class="imageContainer flex flex-col">
        
        <div class="routeImage flex">
            <img class="flex" src="/themes/Richards/temproute.png" alt="get fucked">
        </div>

        <div class="flex flex-col box">
            <div class="flex flex-row justify-between items-center">
                <p class="Subheadder">Location: Middlesborough</p>
                <p class="Subheadder">Distance: 4.5miles</p>
                <p class="Subheadder">Weather conditions: rain</p>
                
            </div>
        </div>

        <div class="flex flex-row justify-center">
            <button class="btn btn-md text-center pt-2" on:click={closeThisModal}>Close</button>
        </div>
 
    </div>
</ModalWrapper>

<style lang="postcss">
    .imageContainer {
        border-radius: 7px;
        overflow: hidden;
        flex-shrink: 1;
    }
    
    .routeImage {
        flex: auto;
    }

    .routeImage img {
        height: auto;
        width: 100%;
        background-size: contain;
    }

    .Headder {
        font-size: 2rem;
    }

    .Subheadder {
        font-size: 1rem;
    }
    
    .btn {
        padding: 1rem;
        font-size: 1rem;
        line-height: 0.5;
        background-color: #00afef;
        color: #fff;
        border-color: #00afef;
    }
    
    .box {
        /* background: #00afef; */
        color: black;
        padding: 0.5rem;   
    }
</style>