<script lang="ts">
    export let onBackgroundClick: (e:any) => void = () => {
        console.log("background clicked");
    };

    export let transparentBg = false

    
</script>

<div class="modal-outer" on:click|preventDefault={(e)=>{
    onBackgroundClick(e);
}}>
    <div class="modal-background">

    </div>
    <div class="modal-inner" on:click|stopPropagation class:modalTransparent={transparentBg}>
        <slot></slot>
    </div>
</div>

<style lang="postcss">
    .modal-background {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: -1;
        backdrop-filter: blur(5px);
    }

    .modal-outer {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .modal-inner {
        flex: 0;
        background: rgb(255, 255, 255);
        padding: 0.5rem;
        border-radius: 0.5rem;
        max-width: 95%;
        max-height: 95%;
        overflow: auto;
        min-width: 600px;
        /* min-height: 400px; */
        position: relative;
    }

    .modalTransparent {
        background-color: rgba(0,0,0,0);
    }
</style>