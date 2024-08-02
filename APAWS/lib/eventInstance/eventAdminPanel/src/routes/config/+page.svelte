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

	let ctaText:Writable<string> = writable("");
	let ctaImage:Writable<CMSTypes.Media | null> = writable(null);
	let ctaURL:Writable<string> = writable("");
	
	let ctaAlternateText:Writable<string> = writable("");
	let ctaAlternateImage:Writable<CMSTypes.Media | null> = writable(null);
	let ctaAlternateURL:Writable<string> = writable("");

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
			<div class="form-column">
				<h1>Basic Information</h1>
				<div class="form-field field-stack">
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
			</div>
			
			<div class="form-column">
				<h1>Sponsor Information</h1>
				<div class="form-field field-stack">
					<label for="sponsorTitle" class="p-2">Call to action text</label>
					<input class="input" type="text" id="sponsorTitle" bind:value={$ctaText} />
				</div>

				<div class="form-field field-stack">
					<label for="sponsorImage" class="p-2">Call to action image</label>
					<ImageInput bind:currentMedia={ctaImage} />
				</div>

				<div class="form-field field-stack">
					<label for="sponsorTitle" class="p-2">Call to action URL</label>
					<input class="input" type="text" id="sponsorTitle" bind:value={$ctaURL} />

				<div class="form-field field-stack">
					<label for="sponsorTitle" class="p-2">Alternate Call to action text</label>
					<input class="input" type="text" id="sponsorTitle" bind:value={$ctaAlternateText} />
				</div>

				<div class="form-field field-stack">
					<label for="sponsorImage" class="p-2">Alternate Call to action image</label>
					<ImageInput bind:currentMedia={ctaAlternateImage} />
				</div>

				<div class="form-field field-stack">
					<label for="sponsorTitle" class="p-2">Alternate Call to action URL</label>
					<input class="input" type="text" id="sponsorTitle" bind:value={$ctaAlternateURL} />
				</div>
			</div>
			
			<button class="btn btn-primary text-white mt-4 shadow-lg" type="submit">Save</button>
		</form>
			
	{:else}
		No data
	{/if}
{/if}
<style lang="postcss">
	.form {
		@apply gap-2;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
	}

	.form-column {
		display: flex;
		flex-direction: column;
		min-width: 400px;
		align-self: stretch;
	}
	.form-field {
		@apply shadow-lg bg-zinc-600 mt-2 p-2 rounded-sm;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		border-radius: 5px;
	}
	.form-field.field-stack{
		flex-direction: column;
	}
	.input {
		width: 100%;
	}

	h1{
		@apply text-3xl mt-6
	}
</style>