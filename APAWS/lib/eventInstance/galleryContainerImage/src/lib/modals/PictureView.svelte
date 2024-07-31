<script lang="ts">

    import ModalWrapper from "./utils/ModalWrapper.svelte";
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
    <h1>Example Modal</h1>
    <pre>{JSON.stringify(data, null, 2)}</pre>
</ModalWrapper>

<style lang="postcss">
    h1 {
        margin-bottom: 1rem;
    }
</style>