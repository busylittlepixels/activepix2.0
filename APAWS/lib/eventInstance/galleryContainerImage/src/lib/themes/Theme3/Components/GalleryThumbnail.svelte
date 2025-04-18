<script lang="ts">
    export let onClick:()=>void = ()=>{};
</script>
<div class="thumbnail-outer" on:click={onClick}>
    <div class="thumbnail-inner"></div>
</div>

<style lang="postcss">
    .thumbnail-outer{
        background: #c33;
        width: 100%;
        padding-bottom: 100%;
        /* transform: rotate(-45deg); */
    }

    .thumbnail-inner{
        background: rgba(0,0,255,0.5);
        width: 100%;
        height: 100%;
        /* transform: rotate(45deg) scale(1.5); */
    }
</style>