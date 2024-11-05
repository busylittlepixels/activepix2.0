<script lang="ts">
	import { Endpoints } from '$lib/Endpoints';

    let participantNumber: number;
    function constructParticipantCode(participantNumber: number) {
        //B64 encode the participant number
        return btoa(participantNumber.toString());
    }
</script>

<div class="w-full h-full wrapper">
    <div class="inner flex flex-col justify-center items-center">
        <h1>Enter your participant number to view your gallery</h1>
        <input type="number" bind:value={participantNumber} class="input input-bordered w-full mt-2" placeholder="Enter your participant number"/>
        {#if (participantNumber)}
            <a class="btn mt-4 btn-primary" target="_blank" href="{Endpoints.frontend.base}/{constructParticipantCode(participantNumber)}">Click here to view your gallery</a>
        {/if}
    </div>
</div>

<style lang="postcss">
    .wrapper {
        @apply p-2;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }
    .wrapper h1{
        @apply text-2xl text-white mb-2;
        text-align: center;
    }
</style>