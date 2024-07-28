<script lang="ts">

    import ModalWrapper from "../../main/ModalWrapper.svelte";
    import * as ModalManager from "$lib/ModalManager";
    import { AuthStore } from "$lib/Stores";

    export let id:number;
    export let type:ModalManager.ModalTypes
    export let data:{someData:string};



    function closeThisModal() {
        console.log("closing modal");
        ModalManager.closeModal(id);
    }
</script>
<ModalWrapper onBackgroundClick={closeThisModal}>
    <div class="imageContainer">
        <div class="routeImage"></div>
    </div>
</ModalWrapper>

<style lang="postcss">
    .imageContainer {
        background: rgba(25, 30, 36, 1);
    }
    
    .routeImage {
        background-image: url(/temproute.png);
    }
</style>