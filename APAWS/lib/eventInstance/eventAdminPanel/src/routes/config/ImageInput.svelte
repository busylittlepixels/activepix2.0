<script lang="ts">
	import { getAuthHeader } from "$lib/Authentication";
	import type { CMSTypes } from "$lib/CMSHelpers";
	import { Endpoints } from "$lib/Endpoints";
    import { writable, type Writable } from "svelte/store";

    export let currentMedia: Writable<CMSTypes.Media | null> = writable(null);
    export let files: Writable<FileList | null> = writable(null);

    export async function upload(){
        let targetFile = $files?.[0];
        if(!targetFile){
            // alert("No file selected");
            return;
        } else {
            console.log("Uploading file", targetFile);
            // console.log('Authorization', await getAuthHeader());
        }
        const formData = new FormData();
        formData.append("file", targetFile);
        const res = await fetch(Endpoints.cms.media.base, {
            headers: {
                'Authorization': await getAuthHeader(),
            },
            method: "POST",
            body: formData
        });
        const data = await res.json();
        currentMedia.set(data.doc);
    }
    $: $files, upload();
</script>
<div class="image-input">
    {#if $currentMedia}
        <img src={Endpoints.cms.media.fileBase + $currentMedia?.url} alt="{$currentMedia?.filename}" />
    {/if}
    <div class="controls">
        <input type="file" class="file-input w-full max-w-xs" bind:files={$files}/>
        <!-- {#if $files?.length}
            <button class="btn ml-2" on:click|preventDefault|stopPropagation={upload}>Upload</button>
        {/if} -->
    </div>
</div>

<style lang="postcss">
    .image-input {
        @apply gap-2;
        max-width: 400px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
    }
    .controls {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
    .file-input {
        /* margin-top: 1rem; */
    }
    .btn {
        /* margin-top: 1rem; */
    }
    img{
        border-radius: 5px;
        max-width: 100px;
    }
</style>