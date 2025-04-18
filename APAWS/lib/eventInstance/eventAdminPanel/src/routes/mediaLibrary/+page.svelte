<script lang="ts">
	import { Endpoints } from '$lib/Endpoints';
	import { closeModal, ModalTypes, openModal } from '$lib/ModalManager';
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
    
    async function updateCurrentThumbnails(){
        console.log('Updating thumbnails')
        await fetch(Endpoints.galleryData.manageMedia + `?limit=${$limit}` + ($lastKey ? `&lastKey=${$lastKey}` : ''))
        .then(res => res.json())
        .then(data => {
            data = data.media
            if(data.length > 0){
                // lastKey = data[data.length - 1].ingressKey
            }
            $currentThumbnails = [...data]
        })
    }

   async function nextPage(){
        $lastKey = $currentThumbnails[$currentThumbnails.length - 1].ingressKey
        console.log('Updated last key to', $lastKey)
        await updateCurrentThumbnails()
    }

    onMount(() => {
        updateCurrentThumbnails()
    })

    function deleteMedia(ingressKey:string) {
        //Confirm deletion
        if(!confirm('Are you sure you want to delete this media?')) return
        fetch(Endpoints.galleryData.deleteMedia + `?key=${ingressKey}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(res => res.json())
        .then(data => {
            console.log('delete res:', data)
            updateCurrentThumbnails()
        })
    }

    //Used by modals to switch to next media. Will load the next page if necessary
    const navigation = {
        next: async (ingressKey:string, modalID:number)=>{
            //Check if we need to load the next page
            let newPage = false
            if($currentThumbnails.findIndex(t => t.ingressKey === ingressKey) === $currentThumbnails.length - 1){
                await nextPage();
                newPage = true
            }
            let nextIndex = $currentThumbnails.findIndex(t => t.ingressKey === ingressKey) + 1
            if(newPage) nextIndex = 0
            closeModal(modalID)
            openModal(ModalTypes.MediaLibrarySingle, {
                ingressKey: $currentThumbnails[nextIndex].ingressKey,
                thumbnail: $currentThumbnails[nextIndex].thumbnail,
                fullsize: $currentThumbnails[nextIndex].fullsize,
                participantCodes: $currentThumbnails[nextIndex].participantCodes,
                navigation
            })
        }
    }
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
                <button class="btn bg-red-800 text-white deleteButton border-none"on:click={() => deleteMedia(thumbnail.ingressKey)}>x</button>
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
        position: relative;
    }
    .deleteButton {
        position: absolute;
        top: -5px;
        right: -5px;
        height: 40px;
        width: 40px;
        gap: 0;
        padding: 0;
        min-height: auto;
        border-radius: .15rem;
    }
    .gallery-item img {
        @apply cursor-pointer;
    }
</style>