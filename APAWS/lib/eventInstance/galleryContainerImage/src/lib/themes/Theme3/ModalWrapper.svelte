<script lang="ts">
    import { writable, type Writable } from "svelte/store";
    import { ModalManagerInstance } from "./ModalManager";
    export let data: Writable<any> = writable(null);
    export let id: number
    export let fullscreen: boolean = false;
    export let transparent: boolean = false;

</script>

<div class="modal-outer" on:click={()=>{
    ModalManagerInstance.closeModal(id);
}}>
    {#if !fullscreen}
        <div class="modal-spacer"></div>
        <div class="modal-content-wrapper" on:click|stopPropagation>
            <div class="">
                <slot {data} {id}></slot>
            </div>
        </div>
    {:else}
        <div class="modal-content-wrapper large" class:transparent={transparent} on:click|stopPropagation>
            <div class="">
                <slot {data} {id}></slot>
            </div>
        </div>
    {/if}
</div>

<style>
    .modal-outer {
        position: fixed;
        top: 0;
        left: 0;
        bottom:0;
        right:0;
        width: 100%;
        min-height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        padding: 1rem;
        /* padding-top: 0rem; */
        overflow: auto;
    }

    .modal-spacer {
        height: 60vh;
    }

    .modal-content-wrapper {
        background-color: white;
        padding: .5rem;
        /* border-radius: 0.5rem; */
        min-height: calc(40vh - 1rem);
    }

    .modal-content-wrapper.transparent {
        background-color: transparent;
    }

    .modal-content-wrapper.large {
        min-height: auto;
        height: 100%;
        width: 100%;
    }
</style>