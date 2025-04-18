<script lang="ts">
    import ModalWrapper from "./ModalWrapper.svelte";
    import { ModalManagerInstance } from "./ModalManager";
    let modalStore = ModalManagerInstance.modalStack
</script>

<div class="modalArea">
    {#each $modalStore as modal}
            <svelte:component this={modal.contentComponent} data={modal.data} id={modal.id} />
    {/each}
</div>

<style>
    .modalArea {
        position: relative;
        z-index: 9999;
    }
</style>