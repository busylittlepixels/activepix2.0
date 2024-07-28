<script lang="ts">
	import type { ThemedGalleryData } from "$lib/EventTypes";

    export let galleryData:ThemedGalleryData;

</script>
<div class="background w-full h-full"></div>
<div class="flex flex-row h-full">
    <div class="flex flex-col InfoBox gap-3">
        <div class="logo mt-3">
            
        </div>
        <div class="textBox flex flex-col gap-4">
            <div class="mb-3">
                <a class="text-4xl">Race title</a>
            </div>
            <div class="flex flex-col gap-1">
                <a class="text-xl">Particapant name:</a>
                <a class="text-l">Joe blogs</a>
            </div>
            <div class="flex flex-col gap-1">
                <a class="text-xl">Race length:</a>
                <a class="text-l">42KM</a>
            </div>
            <div class="flex flex-col gap-1">
                <a class="text-xl">Completion time:</a>
                <a class="text-l">4 hours and 12 mins</a>
            </div>
            <div class="flex flex-col gap-1">
                <a class="text-xl">Race information:</a>
                <a class="text-l">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid cumque vel itaque maiores fuga doloribus excepturi perspiciatis, velit voluptate ut earum at iste quas hic eius! Velit fugiat minus similique.</a>
            </div>
        </div>  
        <div class="placeHolder flex flex-col">
            <a>MAP WITH ROUTE INCLUDED </a>
            <a>could be a pop out model and bonus points if you could have just random pictures of around the route if ya have geo-tags or sumt</a>
        </div>
    </div>

    <div class="flex flex-col main-section">
        <div class="hero mb-7">
            <div class="tint">
                <a class="text-6x1">RACE NAME</a>
            </div>
        </div>
        <div class="flex picture-boxes scrolleyBox">
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
    </div>
</div>

<div class="stripe">
    <svg width="1920" height="865" viewBox="0 0 1920 865" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-444.562 545.629C-659.298 971.212 -444.562 1260 -444.562 1260C-444.562 1260 976.861 -41.6196 2435.94 67.5393C3895.03 176.698 692.855 -379.299 -444.562 545.629Z" fill="#D9D9D9" fill-opacity="0.15"/>
        </svg>
</div>    

<style>
    .background {
        background: rgba(25, 30, 36, 1);
        z-index: -2;
        position: fixed;
      z-index: -1;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
    }
    .gallery-container {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        background-color: transparent;
        width: 100%;
    }

    .gallery-image {
        flex: 1 1 300px;
    }

    .InfoBox {
        width: 400px;
        flex-shrink: 0;
        margin: 1rem;
        border-radius: 5px
        
    }

    .textBox {
        padding: 1rem;
        background: #00aeef;
        font-size: large;
        border-radius: 6px;
        color: white;
        margin-top: 1rem;

    }
    
    .placeHolder {
        background-color: white;
        text-align: center;
        margin: 1rem;
        height: 300px;
    }

    .scrolleyBox {
        overflow-y: auto;
        height: 800px;
    }

    .stripe {
      position: fixed;
      z-index: -1;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;

  }
  .stripe svg {
    width: 100%;
    height: auto;
  }

  .logo {
    width: 100%;
    height: 70px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: fill;
    background-image: url("/Activepics.svg");
    padding-left: rem;
  }

  .breathingSpace {
    width: 50px;
    flex-shrink: 0;
  }

  .hero {
    margin-top: 1rem;
    height: 200px;
    text-align: center;
    background-image:url("/themes/Richards/Hero.png");
    background-repeat: no-repeat;
    background-size:cover;
    border-radius: 8px;
    color: white;
    position: relative;
    
    font-size: 5rem;
  }

  .main-section {
    margin-left: 50px;
    margin-right: 50px;
  }

  .tint {
    background-color: rgba(0, 0, 0, 0.712);
    border-radius: 8px;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
</style>