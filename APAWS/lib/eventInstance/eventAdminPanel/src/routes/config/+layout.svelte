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
{#if ($AuthStore?.user)}
    <slot></slot>
{:else}
    <a href="/">Unauthorized, please click here to login.</a>
{/if}