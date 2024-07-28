<script lang="ts">
    import { writable } from "svelte/store";
    import { ActiveModalStore } from "$lib/Stores";
    import { ModalTypeMapping } from "$lib/ModalManager";

</script>

{#each Object.values($ActiveModalStore) as modal}
    <!-- <pre>{JSON.stringify(modal, null, 2)}</pre> -->
    <svelte:component this={ModalTypeMapping[modal.type]}
        id={modal.id}
        type={modal.type}
        data={modal.data}
    />
{/each}