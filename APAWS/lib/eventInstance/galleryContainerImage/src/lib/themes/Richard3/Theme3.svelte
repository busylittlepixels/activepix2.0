<script lang="ts">
	import type { ThemedGalleryData } from "$lib/EventTypes";

    export let galleryData:ThemedGalleryData;

    import * as ModalManager from "$lib/ModalManager"

    const mapView = () => {
        ModalManager.openModal(ModalManager.ModalTypes.RouteView, {});
    };

    const pictureView = (media:ThemedGalleryData['media'][0]) => {
        ModalManager.openModal(ModalManager.ModalTypes.PictureView, {targetMedia:media});
    };

</script>
<!-- Background code -->
<div class="background w-full h-full"></div>
<div class="stripe">
    <svg width="1920" height="865" viewBox="0 0 1920 865" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-444.562 545.629C-659.298 971.212 -444.562 1260 -444.562 1260C-444.562 1260 976.861 -41.6196 2435.94 67.5393C3895.03 176.698 692.855 -379.299 -444.562 545.629Z" fill="#D9D9D9" fill-opacity="0.15"/>
        </svg>
</div>    

<p>yooyoy</p>