<script lang="ts">
	import type { ThemedGalleryData } from "$lib/EventTypes";

    export let galleryData:ThemedGalleryData;

</script>
<div class="flex flex-row">
    <div class="flex flex-col InfoBox ">
        <div class="textBox">
            <a>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Fugit, vero incidunt blanditiis perferendis repudiandae corporis quaerat odit aliquam tempore temporibus omnis hic tenetur illum consectetur tempora dolores autem accusamus minus.</a>
            <a>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam magni minima aliquid quis optio veritatis neque fugit quas numquam! Magni aliquam provident nesciunt. Reiciendis deleniti, non minima a incidunt unde?</a>
            <a>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod explicabo molestias alias ut debitis, dolores sapiente commodi cum facilis officia quaerat a, voluptatem consequuntur, ab eos quidem ipsam numquam corporis?</a>
        </div>  
    </div>

    <div class="flex picture-boxes">
            {#if (galleryData?.media?.length > 0)}
            <div class="gallery-container">
                {#each galleryData.media as media}
                    <div class="gallery-image">
                        <img src={media.thumbnail} alt={media.ingress} />
                    </div>
                {/each}
            </div>
        {:else}
            <p>Gallery media not found</p>
        {/if}
    </div>

    <div>

    </div>
</div>
<style>
    .gallery-container {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        background-color: black;
        width: 100%;
    }

    .gallery-image {
        flex: 1 1 200px;
    }

    .InfoBox {
        width: 400px;
        flex-shrink: 0;
        background: rgba(25, 30, 36, 1);
    }

    .textBox {
        padding: 1rem;
    }
</style>