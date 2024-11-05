<script lang="ts">
	import type { ThemedGalleryData } from "$lib/EventTypes";

    export let galleryData:ThemedGalleryData; 

    import * as ModalManager from "$lib/ModalManager";
    import Topbar from "$lib/themes/Theme2/Components/Topbar.svelte"
    import Gallery from "./Components/Gallery.svelte";
	import HeroTheme2 from "./Components/HeroTheme2.svelte";
	import ShareBar from "./Components/ShareBar.svelte";
	import SponsorBox from "./Components/SponsorBox.svelte";
    import {Endpoints} from "$lib/Endpoints";
	import ShareSection from "./Components/ShareSection.svelte";
	import { onMount } from "svelte";

    const mapView = () => {
        ModalManager.openModal(ModalManager.ModalTypes.Theme2Viewpicture, {});
    };

    let mounted=false;
    onMount(() => {
        mounted=true;
    });
</script>

<svelte:head>
    <meta name="og:image" content="{Endpoints.cms.media.files + galleryData.galleryConfig.heroImage.url}"/>
    <meta name="og:image:width" content="{galleryData.galleryConfig.heroImage.width + ""}"/>
    <meta name="og:image:height" content="{galleryData.galleryConfig.heroImage.height + ""}"/>
    <meta name="og:image:alt" content="{galleryData.galleryConfig.heroImage.filename}"/>
    <meta name="og:title" content="{galleryData.galleryConfig.title}"/>
    {#if galleryData.participantData?.firstName}
        <meta name="og:description" content="View {galleryData.participantData.firstName}'s gallery."/>
    {:else}
        <meta name="og:description" content="View the gallery."/>
    {/if}


</svelte:head>


<!-- Background code -->
<!-- <pre>{JSON.stringify(galleryData, null, 2)}</pre> -->
<div class="background w-full h-full"></div>
<div class="stripe">
    <svg width="1920" height="865" viewBox="0 0 1920 865" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-444.562 545.629C-659.298 971.212 -444.562 1260 -444.562 1260C-444.562 1260 976.861 -41.6196 2435.94 67.5393C3895.03 176.698 692.855 -379.299 -444.562 545.629Z" fill="#D9D9D9" fill-opacity="0.15"/>
        </svg>
</div>    
<Topbar></Topbar>
<div class="flex flex-col pageWrapper gap-4 pb-8" style="margin-top:90px">

   <HeroTheme2 {galleryData}></HeroTheme2>

   <!-- <ShareBar></ShareBar> -->
    {#if mounted}
        <!--Needs to be mounted due to use of window.*-->
        <ShareSection raceName={galleryData.galleryConfig.title}></ShareSection>
    {/if}
    <SponsorBox ctaData={{
        ctaHref: galleryData.galleryConfig.ctaLink,
        ctaImage: Endpoints.cms.media.files + galleryData.galleryConfig.ctaImage?.url,
        ctaText: galleryData.galleryConfig.ctaText
    }}></SponsorBox>

    <Gallery {galleryData}></Gallery>

    <SponsorBox ctaData={{
        ctaHref: galleryData.galleryConfig.ctaAltLink,
        ctaImage: Endpoints.cms.media.files + galleryData.galleryConfig.ctaAltImage?.url,
        ctaText: galleryData.galleryConfig.ctaAltText
    }}></SponsorBox>

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