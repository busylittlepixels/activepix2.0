<script lang="ts">
	import type { ThemedGalleryData } from "$lib/EventTypes";

    export let galleryData:ThemedGalleryData;

    import {Endpoints} from "$lib/Endpoints";
	import { onMount } from "svelte";
	import Menubar from "./Components/Menubar.svelte";
	import Hero from "./Components/Hero.svelte";
	import Gallery from "./Components/Gallery.svelte";
	import { MiscHelpers } from "$lib/MiscHelpers";
	import EndOfGallerySection from "./Components/EndOfGallerySection.svelte";
	import RequiresAction from "./Components/RequiresAction.svelte";
	import ModalArea from "./ModalArea.svelte";

    let mounted=false;
    let accessAllowed=false;
    onMount(() => {
        if(galleryData.participantData?.hasSubmitted) {
            accessAllowed=true;
        }
        //Disable modal for now.
        accessAllowed=true;
        mounted=true;


        //Shim styles for perspective.
        let style = document.createElement('style');
        style.innerHTML = `
            body {
                perspective: 1000px;
                height: 100%;
                overflow-y: auto;
            }
        `;
        document.head.appendChild(style);
    });

    async function hasSubmitted() {
        return true
        return galleryData.participantData?.hasSubmitted ?? false;
    }
</script>

<svelte:head>
    <meta name="og:image" content="{Endpoints.cms.media.files + galleryData.galleryConfig.heroImage?.url}"/>
    <meta name="og:image:width" content="{galleryData.galleryConfig.heroImage?.width + ""}"/>
    <meta name="og:image:height" content="{galleryData.galleryConfig.heroImage?.height + ""}"/>
    <meta name="og:image:alt" content="{galleryData.galleryConfig.heroImage.filename}"/>
    <meta name="og:title" content="{galleryData.galleryConfig.title}"/>
    {#if galleryData.participantData?.firstName}
        <meta name="og:description" content="View {galleryData.participantData.firstName}'s gallery."/>
    {:else}
        <meta name="og:description" content="View the gallery."/>
    {/if}
    <style lang="postcss">
        .pg {
            transform-style: preserve-3d;
        }

        .pg-1 {
            transform: translateZ(0px);
            width: 100%;
            height: 100vh;
            margin-bottom: -200px;
        }

        .pg-2 {
            transform: translateZ(200px);
        }
    </style>
</svelte:head>

<Menubar/>
<RequiresAction action={hasSubmitted}>
    <div slot="action" class="w-full h-full flex flex-column justify-center items-center">
        <h1>Sign up to view your photos</h1>
    </div>
    <div slot="content" class="parallax-container">
        <div class="pg pg-1">
            <Hero
                titleText={galleryData.galleryConfig.title ?? ""}
                subtitleText={MiscHelpers.niceDate(galleryData.galleryConfig.date) ?? ""}
                heroImageURL={Endpoints.cms.media.files + galleryData.galleryConfig.heroImage?.url}
            />
        </div>
        <!-- <div class="pg pg-2"> -->
            <Gallery
                galleryData={galleryData}
            />
        <!-- </div> -->
        <EndOfGallerySection/>
    </div>
    <div slot="loading">
        <p>Loading...</p>
    </div>
</RequiresAction>
<ModalArea></ModalArea>

<style lang="postcss">
    .parallax-container {
        height: 100vh;
        overflow-y: auto;
        overflow-x: hidden;
        perspective: 500px;
    }

    

</style>