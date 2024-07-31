<script lang="ts">
	import { AuthStore, logout } from "$lib/Authentication";
	import type { CMSTypes } from "$lib/CMSHelpers";
	import { onMount } from "svelte";
	import { writable, type Writable } from "svelte/store";
	import { getAuthHeader } from "$lib/Authentication";
	import { Endpoints } from "$lib/Endpoints";
	import ImageInput from "./ImageInput.svelte";
	let loading = true;
	let data:Writable<CMSTypes.Galleryconfig | null> = writable(null)
	
	let iTitle:Writable<string> = writable("");
	let iLogo:Writable<CMSTypes.Media | null> = writable(null);
	let iOverlay:Writable<CMSTypes.Media | null> = writable(null);

	async function handleSubmit(){
		let res = await fetch(Endpoints.cms.galleryConfig.base, {
			headers: {
				'Authorization': await getAuthHeader(),
				'Content-Type': 'application/json',
			},
			method: "POST",
			body: JSON.stringify({
				title: $iTitle,
				logo: $iLogo?.id,
				overlayImage: $iOverlay?.id,
			}),
		});
		let resdata = await res.json();
		data.set(resdata.result as CMSTypes.Galleryconfig);
		alert("Saved");
	}
	onMount(async () => {
		let res = await fetch(Endpoints.cms.galleryConfig.base, {
			headers: {
				'Authorization': await getAuthHeader(),
			},
		});
		let resdata = await res.json();
		$data = resdata as CMSTypes.Galleryconfig;
		if($data.title){
			iTitle.set($data.title);
		} else {
			iTitle.set('Untitled Event')
			// console.error("No title found");
		}
		if($data.logo){
			iLogo.set($data.logo as CMSTypes.Media);
		} else {
			// console.error("No logo found");
		}
		if($data.overlayImage){
			iOverlay.set($data.overlayImage as CMSTypes.Media);
		} else {
			// console.error("No overlay found");
		}



		loading = false;
	});
</script>
<div class="header">
	<button class="btn btn-primary text-white" on:click={logout}>Logout</button>
</div>
{#if loading}
	Loading...
{:else}
	{#if $data}
		<form class="form p-2" on:submit={handleSubmit}>
			<div class="form-field">
				<label for="title" class="p-2">Title</label>
				<input class="input" type="text" id="title" bind:value={$iTitle} />
			</div>
			<div class="form-field field-stack">
				<label for="logo" class="p-2">Logo</label>
				<ImageInput bind:currentMedia={iLogo} />
			</div>
			<div class="form-field field-stack">
				<label for="overlay" class="p-2">Overlay</label>
				<ImageInput bind:currentMedia={iOverlay} />
			</div>
			<button class="btn btn-primary text-white mt-4 shadow-lg" type="submit">Save</button>
		</form>
			
	{:else}
		No data
	{/if}
{/if}
<style lang="postcss">
	.form {
		display: flex;
		flex-direction: column;
	}
	.form-field {
		@apply shadow-lg bg-zinc-600 mt-2 p-1 rounded-sm;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	.form-field.field-stack{
		flex-direction: column;
	}
	.input {
		width: 100%;
	}
</style>