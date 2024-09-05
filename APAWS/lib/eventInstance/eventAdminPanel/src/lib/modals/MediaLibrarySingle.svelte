<script lang="ts">

    import ModalWrapper from "./utils/ModalWrapper.svelte";
    import * as ModalManager from "$lib/ModalManager";
	import { Endpoints } from "$lib/Endpoints";

    export let id:number;
    export let type:ModalManager.ModalTypes
    export let data:{ingressKey: string, thumbnail: string, fullsize: string, participantCodes: number[]};

    let participantCode:number|null = null;


    function closeThisModal() {
        console.log("closing modal");
        ModalManager.closeModal(id);
    }

    function removeCode(code:number){
        data.participantCodes = data.participantCodes.filter(c => c !== code)
        fetch(Endpoints.galleryData.manageMedia, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                key: data.ingressKey,
                participantCodes: data.participantCodes
            })
        })
    }

    function addCode(code:number){
        data.participantCodes = [...data.participantCodes, code]
        fetch(Endpoints.galleryData.manageMedia, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                key: data.ingressKey,
                participantCodes: data.participantCodes
            })
        })
    }
</script>
<ModalWrapper onBackgroundClick={closeThisModal}>
    <h1>{data.ingressKey}</h1>
    <img src={data.fullsize} alt="fullsize"/>
    <div class="flex flex-col gap-2">
        <h2>Participant Codes</h2>
        <div class="flex flex-wrap gap-2">
            {#each data.participantCodes as code}
                <div class="flex gap-2">
                    <p>{code}</p>
                    <button on:click={() => removeCode(code)}>Remove</button>
                </div>
            {/each}
        </div>
        <input type="number" placeholder="Participant Code" bind:value={participantCode}/>
        <button on:click={() => {
            if(participantCode !== null){
                addCode(participantCode)
            } else {
                alert('Please enter a participant code')
            }
        }}>Add</button>
    </div>
</ModalWrapper>

<style lang="postcss">
    img {
        max-width: 100%;
        width: 1000px;
    }
    h1 {
        margin-bottom: 1rem;
    }
</style>