<script lang="ts">
	import { CMSHelpers } from "$lib/CMSHelpers";
	import Header from "../Header.svelte";
	import UpdateParticipantData from "./UpdateParticipantData.svelte";

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

        return filename;
    }

    let fileInput: HTMLInputElement;
    let totalToUpload: number;
    let uploaded: number = 0;
    let files: FileList;
    async function uploadInitiated() {
        
    }

</script>
<div class="flex flex-col items-center justify-center h-full">
    <h1 class="text-3xl mb-2">Upload your participant data</h1>
    <p>- some info about participant CSV format here -</p>
    <UpdateParticipantData></UpdateParticipantData>
</div>