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
    <h1>Example Modal {$AuthStore?.user.id}</h1>
    <pre>{JSON.stringify(data, null, 2)}</pre>
    <pre>USERDATA: {JSON.stringify($AuthStore?.user, null, 2)}</pre>
    <button on:click={()=>{
        ModalManager.openModal(ModalManager.ModalTypes.StudentClassesViewClassDetails, {someData: "some more data"})}
    }>Open Example Modal</button>
</ModalWrapper>

<style lang="postcss">
    h1 {
        margin-bottom: 1rem;
    }
</style>