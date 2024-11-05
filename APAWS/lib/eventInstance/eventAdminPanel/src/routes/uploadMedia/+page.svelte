<script lang="ts">
	import { goto } from "$app/navigation";
	import { isAuthed } from "$lib/Authentication";
	import { CMSHelpers } from "$lib/CMSHelpers";
	import { onMount } from "svelte";

    /**
     * Handles uploading to S3 via signed urls.
    */

    function normalizeFilename(filename: string) {
        filename =  filename.replace(/\\/g, "/");
        //Replace \ with _ in the filename
        filename = filename.replace(/\//g, "_");
        //Replace () with nothing in the filename
        filename = filename.replace(/\(/g, "");
        filename = filename.replace(/\)/g, "");
        //Replace <SPACE> with _ in the filename
        filename = filename.replace(/ /g, "_");

        return filename;
    }

    let fileInput: HTMLInputElement;
    let totalToUpload: number = 0;
    let uploaded: number = 0;
    let files: FileList;

    async function uploadInitiated() {
        if (!files) {
            console.error("No files selected");
            return;
        }
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const filename = normalizeFilename(file.webkitRelativePath);
            console.log('getting urls');
            const uploadURLData = (await CMSHelpers.getSignedURLs([filename]))?.[0];
            if (!uploadURLData) {
                console.error("Failed to get signed URL for key: ", filename);
                return;
            }
            if (!(uploadURLData?.key === filename)) {
                console.error("Failed to get signed URL");
                return;
            }
            const uploadURL = uploadURLData.url;
            await fetch(uploadURL, {
                method: 'PUT',
                body: file,
                //Disable the content type header
                headers: {
                    'Content-Type': ''
                }
            }).then((response) => {
                if (response.ok) {
                    uploaded++;
                    uploaded = uploaded; // Manually trigger reactivity
                    console.log(`Uploaded ${uploaded} of ${totalToUpload}`);
                    if (uploaded === totalToUpload) {
                        console.log("Upload complete");
                    }
                } else {
                    console.error("Upload failed");
                }
            }).catch((error) => {
                console.error("Upload failed");
            });
        }
    }
</script>

<div class="flex flex-col items-center justify-center h-full">
    <h1 class="text-3xl mb-2">Upload your images</h1>
    <p>Please keep this window open while the upload is in progress.</p>
    <p class="mb-4">Uploaded files with identical names will overwrite with the latest uploaded file.</p>
    <input class="mb-4" type="file" directory webkitdirectory="true" id="fileInput" bind:files={files}/>
    <button id="uploadButton" class="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" on:click={() => {
            totalToUpload = files.length;
            uploadInitiated();
        }}>
        Upload
    </button>
    {#if !totalToUpload}
        <p>No files selected</p>
    {:else}
        <progress class="progress w-56 mt-2" value={Math.floor(((uploaded / totalToUpload) * 100))} max="100"></progress>
    {/if}
</div>
