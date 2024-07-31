<script lang="ts">
	import type { ThemedGalleryData } from "$lib/EventTypes";

    export let galleryData:ThemedGalleryData;

    import * as ModalManager from "$lib/ModalManager";

    const mapView = () => {
        ModalManager.openModal(ModalManager.ModalTypes.RouteView, {});
    };

    const pictureView = () => {
        ModalManager.openModal(ModalManager.ModalTypes.PictureView, {});
    };

</script>
<!-- Background code -->
<div class="background w-full h-full"></div>
<div class="stripe">
    <svg width="1920" height="865" viewBox="0 0 1920 865" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-444.562 545.629C-659.298 971.212 -444.562 1260 -444.562 1260C-444.562 1260 976.861 -41.6196 2435.94 67.5393C3895.03 176.698 692.855 -379.299 -444.562 545.629Z" fill="#D9D9D9" fill-opacity="0.15"/>
        </svg>
</div>    

<div class="flex flex-row h-full pageWrapper">
    <!-- Left info bar -->
    <div class="flex flex-col InfoBox gap-3">
        <div class="logo mt-5"></div>
        <div class="textBox flex flex-col gap-6">
            <div class="flex flex-row justify-between">
                <div class="mb-2">
                    <p class="text-4xl">Race title</p>
                </div>
                <div>
                    <p class="text-l mr-2">29/07/2024</p>
                </div>
            </div>

            <div class="flex flex-col gap-1">
                <p class="text-xl">Particapant name:</p>
                <p class="text-l">Joe blogs</p>
            </div>
            <div class="flex flex-col gap-1">
                <p class="text-xl">Participant number:</p>
                <p class="text-l">#125</p>
            </div>
            <div class="flex flex-col gap-1">
                <p class="text-xl">Race length:</p>
                <p class="text-l">42KM</p>
            </div>
            <div class="flex flex-col gap-1">
                <p class="text-xl">Completion time:</p>
                <p class="text-l">4 hours and 11 mins</p>
            </div>
            <div class="flex flex-col gap-1">
                <p class="text-xl">Race information:</p>
                <p class="text-l">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid cumque vel itaque maiores fuga doloribus excepturi perspiciatis, velit voluptate ut earum at iste quas hic eius! Velit fugiat minus similique.</p>
            </div>
        </div>  
        <div class="placeHolder rounded map-fx flex flex-col" on:click={mapView}>
            <div class="flex flex-row">
                <div class="nameShape">
                    <p class="text-xl pl-1 pt-2 pb-2">Route map</p>
                </div>

                <div class="nameShapeCurve">    
                </div>  

                <div>
                </div>
            </div>
        </div>
    </div>
    <!-- Central hedder with race name -->
    <div class="flex flex-col main-section">
        <div class="hero-wrapper">
            <div class="hero mb-7">
                <div class="tint flex items-center justify-center">
                    <p class="hero-title">RACE NAME</p>
                </div>
                <div class="flex flex-row justify-start items-end">
                    
                </div>
            </div>
        </div>
        <!-- Picture gallery with scroll function -->
        <div class="flex picture-boxes scrolleyBox">
                {#if (galleryData?.media?.length > 0)}
                <div class="gallery-container">
                    {#each galleryData.media as media}
                        <div class="gallery-image">
                            <img class="rounded" src={media.thumbnail} alt={media.ingress} on:click={pictureView}/>
                        </div>
                    {/each}
                </div>
            {:else}
                <p>Gallery media not found</p>
            {/if}
        </div>
    </div>
</div>

<style>

    .pageWrapper {
        max-width: 1450px;
        width: 90%;
        margin: auto;
    }


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
        background-color: transparent;
        width: 100%;
    }

    .gallery-image {
        flex: 1 1 300px;
        border-radius: 10px;
        padding: 15px;
        object-fit: cover;
        
    }

    .InfoBox {
        width: 400px;
        flex-shrink: 0;
        /* margin: 1rem; */
        
    }

    .textBox {
        padding-left: 1rem;
        padding-top: 1rem;
        padding-bottom: 1rem;
        background: #00afef79;
        font-size: large;
        border-radius: 6px;
        color: white;
        margin-top: 1rem;
        border-radius: 5px;
        box-shadow: 0px 0px 20px 0px rgba(22, 14, 14, 0.486);

    }
    
    .placeHolder {
        background-image: url(/themes/Richards/temproute.png);
        border-color: #ffffff;
        border-width: 2px;
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

  .nameShape {
    position: auto;
    background-color: #ffffff;
    width: 50%;
    top: 0;
    left: 0;
    border-end-end-radius:100% ;
    text-align: start;
  }
  .nameShapeCurve {
    /* position: auto;
    background-color: #ffffff;
    width: 50%; */
  }

  .nameShape svg {
    width: 50%;
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
  .hero-wrapper {
    padding-left: 15px;
    padding-right: 15px;
  }

  /* .main-section {
    margin-left: 50px;
    margin-right: 60px;
  } */

  .tint {
    background-color: rgba(0, 0, 0, 0.712);
    border-radius: 8px;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }

  .rounded {
    border-radius: 5px;
    box-shadow: 0px 0px 20px 0px rgba(22, 14, 14, 0.486);
    transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1); /* Smooth transition using cubic-bezier */
  }

  .rounded:hover {
    transform: scale(101%);
    cursor: pointer;
    opacity: 0.8;
  }

  .map-fx:hover {
    transform: scale(101%);
    cursor: pointer;
    opacity: 0.8;
  }

  .hero-title {
    font-size: 5rem;
  }

  @media screen and (max-width:950px) {
    .pageWrapper {
        width: 100%;
        flex-direction: column;
    }

    .InfoBox  {
        width: 95%;
        margin: 2.5%
    }

    .hero-title {
    font-size: 3rem;
  }

    .scrolleyBox {
        overflow-y: auto;
            height: auto;
    }

    .gallery-image {
            flex: auto;
            border-radius: 10px;
            padding: 15px;
            object-fit: cover;
            width: 50%;
        }
    }
</style>