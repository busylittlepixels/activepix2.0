<script lang="ts">
	import { goto } from "$app/navigation";
	import { getAuthHeader, isAuthed } from "$lib/Authentication";
	import { onMount } from "svelte";
	import { writable, type Writable } from "svelte/store";
	import { type CMSTypes } from "$lib/CMSHelpers";
	import { Endpoints } from "$lib/Endpoints";

	let galleryName: Writable<string> = writable("");
	onMount(async () => {
		let res = await fetch(Endpoints.cms.galleryConfig.base, {
			headers: {
				'Authorization': await getAuthHeader(),
				'Content-Type': 'application/json',
			},
			method: "GET",
		});
		let resdata = await res.json();
		galleryName.set(resdata.title);
	});
</script>
<div class="page-wrapper flex flex-col items-start gap-2">
	<h2 class="aptitle">Welcome to ActivePix - {$galleryName}</h2>
	<p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod incidunt labore explicabo iste nihil accusamus, tenetur odit voluptas nam, officia laborum, deserunt quasi! Ipsum maiores, eaque incidunt placeat laborum vitae!</p>
	
	<h2 class="aptitle mt-4">Before your event</h2>
	<h3 class="apsubtitle mt-4">Getting started</h3>
	<p>To get started, download your marker images. The marker images correspond to a Participant Code, and will be used to detect that participant in photos from the event.</p>
	<p>You should distribute the markers to the participants, making sure they will be visible in photos of that participant.</p>

	<div class="flex items-center gap-2 mt-4">
		<h3 class="apsubtitle">Configuration / Themeing</h3>
		<a href="/config" class="apbtn-primary">Configure {$galleryName}</a>
	</div>
	You can configure the look and feel of your gallery here, setting the header image, overlay images for media, and more.

	<h2 class="aptitle mt-4">After your event</h2>
	<div class="flex items-center gap-2 mt-4">
		<h3 class="apsubtitle">Uploading photos</h3>
		<a href="/uploadMedia" class="apbtn-primary">Upload photos</a>
	</div>
	<p>Upload photos from your event here, or via the desktop application.</p>
	<p>To allow partial uploads and skipping already uploaded media, structure your upload folder as follows:</p>
	<ul class="file-structure">
		<li>{$galleryName}</li>
		<ul>
			<li>Photographer 1</li>
			<ul>
				<li>Photo1.png</li>
				<li>Photo2.png</li>
				<li>Photo3.png</li>
				<li>Photo4.png</li>
				<li>...More images</li>
			</ul>
			<li>Photographer 2</li>
			<ul>
				<li>Photo1.png</li>
				<li>Photo2.png</li>
				<li>Photo3.png</li>
				<li>Photo4.png</li>
				<li>...More images</li>
			</ul>
			<li>...More photographers</li>
		</ul>
	</ul>
	
	<h3 class="apsubtitle">Gallery Selector Embed</h3>
	<p>To help participants find their gallery easily, you can embed the following widget.</p>
	<pre>
		&lt;iframe src="{Endpoints.frontend.base}/selectGallery" width="100%" height="400px" frameborder="0"&gt;&lt;/iframe&gt;
	</pre>
	<p>The widget will appear like this:</p>
	<iframe src="{Endpoints.frontend.base}/selectGallery" width="100%" height="400px" frameborder="0"></iframe>
</div>

<style lang="postcss">
	.file-structure {
		list-style-type: none;
	}
	.file-structure li {
		margin-left: 1rem;
	}
	.file-structure ul {
		margin-left: 1rem;
	}
</style>