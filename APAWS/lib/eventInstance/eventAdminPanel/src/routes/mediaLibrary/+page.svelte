<script lang="ts">
	import { Endpoints } from '$lib/Endpoints';
	import { ModalTypes, openModal } from '$lib/ModalManager';
	import { onMount } from 'svelte';
    import { type Writable, writable} from 'svelte/store'
    let currentThumbnails:Writable<{
        ingressKey: string,
        thumbnail: string,
        fullsize: string,
        participantCodes: number[]
    }[]> = writable([])

    let limit = writable(30)
    let lastKey:Writable<undefined | string> = writable(undefined)
    
    function updateCurrentThumbnails(){
        console.log('Updating thumbnails')
        fetch(Endpoints.galleryData.manageMedia + `?limit=${$limit}` + ($lastKey ? `&lastKey=${$lastKey}` : ''))
        .then(res => res.json())
        .then(data => {
            data = data.media
            if(data.length > 0){
                // lastKey = data[data.length - 1].ingressKey
            }
            $currentThumbnails = [...data]
        })
    }

    function nextPage(){
        $lastKey = $currentThumbnails[$currentThumbnails.length - 1].ingressKey
        console.log('Updated last key to', $lastKey)
        updateCurrentThumbnails()
    }

    onMount(() => {
        updateCurrentThumbnails()
    })

    $: $limit, $lastKey, updateCurrentThumbnails();
</script>
<div class="page-wrapper flex flex-col gap-2 items-start">
    <h2 class="aptitle">Media</h2>
    <div class="flex flex-row gap-2">
        <p><select bind:value={$limit}>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
        </select> per page</p>
        <button on:click={nextPage}>Next Page</button>
    </div>
    <p>Click a thumbnail to view in full size and set participants.</p>
    
    <div class="gallery">
        {#each $currentThumbnails as thumbnail}
            <div class="gallery-item">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <img src={thumbnail.thumbnail} alt="thumbnail" on:click={() => {
                    console.log('clicked')
                    openModal(ModalTypes.MediaLibrarySingle, {
                        ingressKey: thumbnail.ingressKey,
                        thumbnail: thumbnail.thumbnail,
                        fullsize: thumbnail.fullsize,
                        participantCodes: thumbnail.participantCodes
                    })
                }}/>
                <!-- <pre>{JSON.stringify($currentThumbnails, null, 2)}</pre> -->
            </div>
        {/each}
    </div>
</div>

<style lang="postcss">
    .gallery {
        @apply flex flex-wrap;
    }
    .gallery-item {
        @apply flex flex-col gap-2 p-2;
        width: 33%;
    }
    .gallery-item img {
        @apply cursor-pointer;
    }
</style>