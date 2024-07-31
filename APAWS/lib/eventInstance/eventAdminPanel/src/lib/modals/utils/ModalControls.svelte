<script lang="ts">
    import * as ModalManager from "$lib/ModalManager";
    export let id:number;

    function closeModal() {
        console.log("closing modal");
        ModalManager.closeModal(id);
    }
</script>
<button class="btn btn-primary" on:click={()=>{
    ModalManager.closeModal(id);
}}></button>