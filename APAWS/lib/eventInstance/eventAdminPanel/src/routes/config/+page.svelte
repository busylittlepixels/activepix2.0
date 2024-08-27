<script lang="ts">
	import { AuthStore, isAuthed, logout } from "$lib/Authentication";
	import type { CMSTypes } from "$lib/CMSHelpers";
	import { onMount } from "svelte";
	import { writable, type Writable } from "svelte/store";
	import { getAuthHeader } from "$lib/Authentication";
	import { Endpoints } from "$lib/Endpoints";
	import ImageInput from "./ImageInput.svelte";
	import {env} from "$env/dynamic/public";
	import { PUBLIC_INGRESS_DOMAIN } from "$env/static/public";
	import { goto } from "$app/navigation";
	
	let loading = true;
	let data:Writable<CMSTypes.Galleryconfig | null> = writable(null)
	
	let iTitle:Writable<string> = writable("");
	let iLogo:Writable<CMSTypes.Media | null> = writable(null);
	let iDateString:Writable<string> = writable(new Date().toString());
	let iLocation:Writable<string> = writable("");
	let iHeroImage:Writable<CMSTypes.Media | null> = writable(null);
	let iOverlayPortrait:Writable<CMSTypes.Media | null> = writable(null);
	let iOverlayLandscape:Writable<CMSTypes.Media | null> = writable(null);

	let ctaText:Writable<string> = writable("");
	let ctaImage:Writable<CMSTypes.Media | null> = writable(null);
	let ctaLink:Writable<string> = writable("");
	
	let ctaAltText:Writable<string> = writable("");
	let ctaAltImage:Writable<CMSTypes.Media | null> = writable(null);
	let ctaAltLink:Writable<string> = writable("");

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
				date: $iDateString.toString(),
				location: $iLocation,
				heroImage: $iHeroImage?.id,
				overlayImagePortrait: $iOverlayPortrait?.id,
				overlayImageLandscape: $iOverlayLandscape?.id,
				ctaText: $ctaText,
				ctaImage: $ctaImage?.id,
				ctaLink: $ctaLink,
				ctaAltText: $ctaAltText,
				ctaAltImage: $ctaAltImage?.id,
				ctaAltLink: $ctaAltLink,
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
		if($data.date){
			iDateString.set((new Date($data.date)).toISOString().split('T')[0]);
		} else {
			// console.error("No date found");
		}
		if($data.location){
			iLocation.set($data.location);
		} else {
			// console.error("No location found");
		}
		if($data.heroImage){
			iHeroImage.set($data.heroImage as CMSTypes.Media);
		} else {
			// console.error("No heroImage found");
		}
		if($data.overlayImagePortrait){
			iOverlayPortrait.set($data.overlayImagePortrait as CMSTypes.Media);
		} else {
			// console.error("No overlay found");
		}
		if($data.overlayImageLandscape){
			iOverlayLandscape.set($data.overlayImageLandscape as CMSTypes.Media);
		} else {
			// console.error("No overlay found");
		}
		if($data.ctaText){
			ctaText.set($data.ctaText);
		} else {
			// console.error("No ctaText found");
		}
		if($data.ctaImage){
			ctaImage.set($data.ctaImage as CMSTypes.Media);
		} else {
			// console.error("No ctaImage found");
		}
		if($data.ctaLink){
			ctaLink.set($data.ctaLink);
		} else {
			// console.error("No ctaLink found");
		}
		if($data.ctaAltText){
			ctaAltText.set($data.ctaAltText);
		} else {
			// console.error("No ctaAltText found");
		}
		if($data.ctaAltImage){
			ctaAltImage.set($data.ctaAltImage as CMSTypes.Media);
		} else {
			// console.error("No ctaAltImage found");
		}
		if($data.ctaAltLink){
			ctaAltLink.set($data.ctaAltLink);
		} else {
			// console.error("No ctaAltLink found");
		}



		loading = false;
	});

</script>
{#if loading}
	Loading...
{:else}
	{#if $data}
		<form class="form p-2" on:submit={handleSubmit}>
			<div class="form-column">
				<h1>Overview</h1>
				<div class="form-field field-stack">
					<div class="flex flex-row"><p>
						<strong>S3 Bucket URL:</strong> <em>https://{env.PUBLIC_INGRESS_DOMAIN}</em><br/>
						<strong>Gallery URL:</strong> <em>https://{env.PUBLIC_GALLERY_DOMAIN}</em><br/>
						<strong>Admin URL:</strong> <em>https://{env.PUBLIC_ADMIN_DOMAIN}</em><br/>
						<strong>CMS URL:</strong> <em>https://{env.PUBLIC_CMS_DOMAIN}</em><br/>
					</p></div>
				</div>
				<h1>Basic Information</h1>
				<div class="form-field field-stack">
					<label for="title" class="p-2">Title</label>
					<input class="input" type="text" id="title" bind:value={$iTitle} />
				</div>
				<div class="form-field field-stack">
					<label for="date" class="p-2">Date</label>
					<input class="input" type="date" id="date" bind:value={$iDateString} />
				</div>
				<div class="form-field field-stack">
					<label for="location" class="p-2">Location</label>
					<input class="input" type="text" id="location" bind:value={$iLocation} />
				</div>
				<div class="form-field field-stack">
					<label for="logo" class="p-2">Logo</label>
					<ImageInput bind:currentMedia={iLogo} />
				</div>
				<div class="form-field field-stack">
					<label for="hero" class="p-2">Hero Image</label>
					<ImageInput bind:currentMedia={iHeroImage} />
				</div>
				<div class="form-field field-stack">
					<label for="overlay" class="p-2">Overlay Landscape</label>
					<ImageInput bind:currentMedia={iOverlayLandscape} />
				</div>
				<div class="form-field field-stack">
					<label for="overlay" class="p-2">Overlay Portrait</label>
					<ImageInput bind:currentMedia={iOverlayPortrait} />
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
					<input class="input" type="text" id="sponsorTitle" bind:value={$ctaLink} />
				</div>
				<div class="form-field field-stack">
					<label for="sponsorTitle" class="p-2">Alt Call to action text</label>
					<input class="input" type="text" id="sponsorTitle" bind:value={$ctaAltText} />
				</div>

				<div class="form-field field-stack">
					<label for="sponsorImage" class="p-2">Alt Call to action image</label>
					<ImageInput bind:currentMedia={ctaAltImage} />
				</div>

				<div class="form-field field-stack">
					<label for="sponsorTitle" class="p-2">Alt Call to action URL</label>
					<input class="input" type="text" id="sponsorTitle" bind:value={$ctaAltLink} />
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
		@apply text-3xl mt-6;
	}
</style>