<script lang="ts">

    import ModalWrapper from "./utils/ModalWrapper.svelte";
    import * as ModalManager from "$lib/ModalManager";
	import { Endpoints } from "$lib/Endpoints";
	import { onMount } from "svelte";

    export let id:number;
    export let type:ModalManager.ModalTypes
    export let data:{ingressKey: string, thumbnail: string, fullsize: string, participantCodes: number[],
        navigation: {
            next:(ingressKey:string, modalID:number)=>Promise<void>,
        }
    };
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

    async function addCode(code:number){
        data.participantCodes = [...data.participantCodes, code]
        await fetch(Endpoints.galleryData.manageMedia, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                key: data.ingressKey,
                participantCodes: data.participantCodes
            })
        })
        participantCode = null
    }

    onMount(() => {
        //Add keyboard events for next and previous
        const nextListener = (e:any) => {
            if(e.key === 'ArrowRight'){
                data.navigation.next(data.ingressKey, id)
            }
        }
        window.addEventListener('keydown', nextListener)

        return () => {
            window.removeEventListener('keydown', nextListener)
        }
    })
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
        <form class="flex flex-col gap-2" on:submit|preventDefault={(e)=>{
            if(participantCode !== null){
                addCode(participantCode)
            } else {
                alert('Please enter a participant code')
            }
        }}>
            <input type="number" placeholder="Participant Code" bind:value={participantCode}/>
            <button type="submit">Add</button>
        </form>
        <button class="btn" on:click={()=>{data.navigation.next(data.ingressKey, id)}}>Next</button>
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