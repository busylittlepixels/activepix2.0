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
    <p class="mb-1">- some info about participant CSV format here -</p>
	<div class="dividerLine mb-4"></div>
    <UpdateParticipantData></UpdateParticipantData>
</div>

<style lang="postcss">
	.dividerLine{
		min-height: 1px;
		width: 50%;
		background-color: #e5e7eb88;
	}
</style>