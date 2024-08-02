<script lang="ts">
	import ThemedGallery from "$lib/ThemedGallery.svelte";
	import type { PageData } from "./$types";

    export let data:PageData;

</script>
<!-- <pre>
	{JSON.stringify(data, null, 2)}
</pre> -->
<ThemedGallery galleryData={data}/>