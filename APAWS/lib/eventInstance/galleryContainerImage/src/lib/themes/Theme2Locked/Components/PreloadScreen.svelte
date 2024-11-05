<script lang="ts">
	import { Endpoints } from "$lib/Endpoints";
	import type { ThemedGalleryData } from "$lib/EventTypes";

    export let galleryData:ThemedGalleryData;
    
    let email = "";

    async function unlockGallery() {
        console.log("Unlocking gallery");
        await fetch(Endpoints.cms.participantData.base +'/'+ galleryData.participantID+'/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                updatedAt: new Date().toISOString(),
            }),
        })
        //Refresh the page
        location.reload();
    }
</script>
<div class="wrapper">
    <h1>View your gallery for {galleryData.galleryConfig.title}</h1>
    <p>To view and share your gallery, sign up for our newsletter below!</p>
    <form on:submit|preventDefault={unlockGallery}>
        <label for="email">Email:</label><br>
        <input type="text" id="email" name="email" bind:value={email}><br>
        <input class="btn btn-primary" type="submit" value="Submit">
    </form>
<!-- <button on:click={unlockGallery}>testUnlock</button> -->
</div>

<style lang="postcss">
    .wrapper {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height:100%;
        width: 100%;
    }

    form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    input {
        margin: 10px;
    }

    h1 {
        font-size: 2em;
    }

</style>