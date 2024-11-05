<script lang="ts">
	import { onDestroy, onMount } from "svelte";

    export let baseURL:string|null = null
    export let raceName:string

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
</script>

<div class="outer w-full flex flex-row justify-center">
    <h2 class="meta">Share Gallery</h2>
    <a class="icon-wrapper" target="_blank" href="{getFacebookLink(baseURL)}" on:click|stopPropagation={()=>{
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
    </a>
    <div class="icon-wrapper" on:click={copyLinkToClipboard}>
        <img src="/icons/link.svg" alt="Link Icon" class="w-8 h-8" />
        {#if linkLastCopied}
            <p class="meta"><strong style="opacity:{1-((currentTime - linkLastCopied) / linkCopiedMaxDuration)}">Copied to clipboard</strong></p>
        {/if}
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