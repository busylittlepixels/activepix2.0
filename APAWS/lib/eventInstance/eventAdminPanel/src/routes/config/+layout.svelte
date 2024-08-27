<script lang="ts">
	import { goto } from "$app/navigation";
	import { AuthStore, initAuthStore, login } from "$lib/Authentication";
	import { onDestroy, onMount } from "svelte";

    onMount(() => {
        initAuthStore();
        if(!$AuthStore?.user){
            goto("/");
        }
    });

    onDestroy(() => {
        console.log("Destroying");
    });
</script>
<slot></slot>

<style lang="postcss">
    .wrapper {
        @apply flex items-center justify-center h-screen;
    }
    .wrapper-inner {
        @apply flex flex-col gap-4;
    }
</style>