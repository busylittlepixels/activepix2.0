<script lang="ts">
	import { Endpoints } from "$lib/Endpoints";
	import type { MediaData, ThemedGalleryData } from "$lib/EventTypes";
	import { onDestroy, onMount } from "svelte";
	import { writable, type Writable } from "svelte/store";

    export let baseURL:string|null = null
    export let raceName:string
    export let mediaItemData:{
        targetMedia: MediaData,
        galleryData: ThemedGalleryData
    } | undefined = undefined
    export let galleryData: ThemedGalleryData | undefined = undefined

    const linkCopiedMaxDuration = 1000
    let linkLastCopied = 0;
    let currentTime = 0;

    let timePollInterval:any;

    onMount(()=>{
        timePollInterval = setInterval(()=>{
            currentTime = Date.now()
            if(currentTime - linkLastCopied > linkCopiedMaxDuration){
                linkLastCopied = 0
            }
        }, 10)
    })

    onDestroy(()=>{
        clearInterval(timePollInterval)
    })

    function copyLinkToClipboard(){
        if(baseURL){
            navigator.clipboard.writeText(baseURL)+'%3Fnomodal%3Dtrue'
        } else {
            navigator.clipboard.writeText(window.location.href)+'%3Fnomodal%3Dtrue'
        }
        linkLastCopied = Date.now()
        // trackGalleryShare('link', raceid, participantID)
    }

    function getWhatsappLink(url:string | null | undefined){
        if(!url) url = window.location.href
        return `whatsapp://send?text=${url}%3Fnomodal%3Dtrue`
    }
    function getFacebookLink(url:string | null | undefined){
        if(!url) url = window.location.href
        return `https://www.facebook.com/sharer/sharer.php?u=${url}%3Fnomodal%3Dtrue`
    }
    function getXLink(url:string | null | undefined){
        if(!url) url = window.location.href
        return `https://x.com/?url=${raceName}%20${url}%3Fnomodal%3Dtrue`
    }

    // async function trackGalleryShare(type:string, raceid:string, participantID:string){
    //     // Track share event
    //     console.log('shared')
    //     await fetch('https://cms.activepix.com/api/races/'+raceid+'/trackGalleryShare', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             type: type,
    //             participantID,
    //             shareType:type,

    //         })
    //     })
    //     return true
    // }

    let downloadStatus:Writable<string> = writable('')
    async function download() {
        if(!mediaItemData) {
            //Download entire gallery.
            const ingressKeys:string[] = Object.values(galleryData?.media ?? {}).map((mediaItem:MediaData)=>{
                return mediaItem.ingress
            })

            downloadStatus.set('Zipping images...')
            const zipurl = await fetch(Endpoints.galleryData.downloadGalleryZip + '?ingressKeys=' + ingressKeys.join(','))
            const res = await zipurl.json()
            if(res.url) {
                window.open(res.url, '_blank')
                downloadStatus.set('')
            } else {
                downloadStatus.set('Download failed.')
            }
        } else {
            //Download single image.
            $downloadStatus = 'Downloading...'
            window.open(mediaItemData.targetMedia.large, '_blank')
            $downloadStatus = ''
        }
    }
</script>

<div class="outer w-full flex flex-row justify-center">
    <h2 class="meta">Share Gallery</h2>
    <!-- <a class="icon-wrapper" target="_blank" href="{getFacebookLink(baseURL)}" on:click|stopPropagation={()=>{
        // trackGalleryShare('facebook', raceid, participantID)
        return true
    }}>
        <img src="/icons/facebook.svg" alt="Facebook Icon" class="w-8 h-8"/>
    </a>
    <a class="icon-wrapper" target="_blank" href="{getXLink(baseURL)}" on:click|stopPropagation={()=>{
        // trackGalleryShare('twitter', raceid, participantID)
        return true
    }}>
        <img src="/icons/xlogo.svg" alt="Play Icon" class="w-6 h-6"/>
    </a>
    <a class="icon-wrapper" href="{getWhatsappLink(baseURL)}" on:click|stopPropagation={()=>{
        // trackGalleryShare('whatsapp', raceid, participantID)
        return true
    }}>
        <img src="/icons/whatsapp.svg" alt="Whatsapp Icon" class="w-6 h-6"/>
    </a> -->
    <a class="icon-wrapper" target="_blank" href="{getFacebookLink(baseURL)}">
        <img src="/icons/facebook.svg" alt="Facebook Icon" class="w-8 h-8"/>
    </a>
    <a class="icon-wrapper" target="_blank" href="{getXLink(baseURL)}">
        <img src="/icons/xlogo.svg" alt="Play Icon" class="w-6 h-6"/>
    </a>
    <a class="icon-wrapper" href="{getWhatsappLink(baseURL)}">
        <img src="/icons/whatsapp.svg" alt="Whatsapp Icon" class="w-6 h-6"/>
    </a>
    <div class="icon-wrapper" on:click={copyLinkToClipboard}>
        <img src="/icons/link.svg" alt="Link Icon" class="w-8 h-8" />
        {#if linkLastCopied}
            <p class="meta"><strong style="opacity:{1-((currentTime - linkLastCopied) / linkCopiedMaxDuration)}">Copied to clipboard</strong></p>
        {/if}
    </div>
    <div class="icon-wrapper" on:click={download}>
        <img src="/icons/download.png" alt="Download Icon" class="w-8 h-8" style="padding: .35rem"/>
    </div>
</div>

<style lang="postcss">
    .outer {
        background-color: #DAE521;
        padding: 1rem;
        margin-top: 1rem;
        color: black;
        font-weight: 900;
        line-height: 2;
    }

    .outer .meta{
        font-weight: 900;
        margin: 0 .75rem;
    }

    .icon-wrapper {
        margin: 0 .75rem;
        cursor: pointer;
        display: flex;
        flex-direction: row;
        align-items: center;

    }
</style>