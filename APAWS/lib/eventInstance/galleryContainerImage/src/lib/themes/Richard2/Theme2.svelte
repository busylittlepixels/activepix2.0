<script lang="ts">
	import type { ThemedGalleryData } from "$lib/EventTypes";

    export let galleryData:ThemedGalleryData; 

    import * as ModalManager from "$lib/ModalManager";
    import Topbar from "$lib/themes/Richard2/Components/Topbar.svelte"
	import Bottombar from "./Components/Bottombar.svelte";
	  import Gallery from "./Components/Gallery.svelte";
	import HeroTheme2 from "./Components/HeroTheme2.svelte";
	import ShareBar from "./Components/ShareBar.svelte";
	import SponsorBox from "./Components/SponsorBox.svelte";

    const mapView = () => {
        ModalManager.openModal(ModalManager.ModalTypes.Theme2Viewpicture, {});
    };

</script>
<!-- Background code -->
<!-- <pre>{JSON.stringify(galleryData, null, 2)}</pre> -->
<div class="background w-full h-full"></div>
<div class="stripe">
    <svg width="1920" height="865" viewBox="0 0 1920 865" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-444.562 545.629C-659.298 971.212 -444.562 1260 -444.562 1260C-444.562 1260 976.861 -41.6196 2435.94 67.5393C3895.03 176.698 692.855 -379.299 -444.562 545.629Z" fill="#D9D9D9" fill-opacity="0.15"/>
        </svg>
</div>    

<div class="flex flex-col pageWrapper gap-4">
  <Topbar></Topbar>

    <div class="mt-9"></div>
    <div class="mt-9"></div>
   <HeroTheme2 {galleryData}></HeroTheme2>

   <ShareBar></ShareBar>

    <SponsorBox {galleryData}></SponsorBox>

    <Gallery {galleryData}></Gallery>

    <SponsorBox {galleryData}></SponsorBox>

    
</div>
<div class="mt-4"></div>
<Bottombar></Bottombar>

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

  /* .main-section {
    margin-left: 50px;
    margin-right: 60px;
  } */

  @media screen and (max-width:950px) {
    .pageWrapper {
        width: 95%;
        flex-direction: column;
    }

    }
</style>