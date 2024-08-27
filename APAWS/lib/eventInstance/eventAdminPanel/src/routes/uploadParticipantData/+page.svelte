<script lang="ts">
	import { CMSHelpers } from "$lib/CMSHelpers";
	import { onMount } from "svelte";
	import Header from "../Header.svelte";
	import UpdateParticipantData from "./UpdateParticipantData.svelte";
	import { isAuthed } from "$lib/Authentication";
	import { goto } from "$app/navigation";


</script>
<div class="flex flex-col items-center justify-center h-full">
    <h1 class="text-3xl mb-2">Upload your participant data</h1>
    <p>- some info about participant CSV format here -</p>
    <UpdateParticipantData></UpdateParticipantData>
</div>