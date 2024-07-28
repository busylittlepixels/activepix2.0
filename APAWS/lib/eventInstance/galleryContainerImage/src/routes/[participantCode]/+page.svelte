<script lang="ts">
	import ThemedGallery from "$lib/ThemedGallery.svelte";
	import type { PageData } from "./$types";

    export let data:PageData;

</script>

<ThemedGallery galleryData={data}/>