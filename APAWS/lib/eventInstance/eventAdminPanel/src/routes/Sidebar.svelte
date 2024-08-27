<script lang="ts">
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { writable, type Writable } from "svelte/store";

    const links = [
        { name: "Dashboard", url: "/dashboard" },
        // Markers Download: /downloadMarkers
        // Login Tokens: /loginTokens
        { name: "Configuration", url: "/config" },
        { name: "Download Markers", url: "/downloadMarkers" },
        { name: "Login Tokens", url: "/loginTokens" },
        { name: "Upload media", url: "/uploadMedia" },
        { name: "Upload participant data", url: "/uploadParticipantData" },
        { name: "Statistics", url: "/statistics" },
        { name: "Support", url: "/support" },
    ];

    function recomputeActiveLinks(currentURL: string) {
        return links.map((link) => ({
            ...link,
            active: currentURL.includes(link.url),
        }));
    }

    const activeLinks: Writable<{
        name: string;
        url: string;
        active: boolean;
    }[]> = writable([]);

    onMount(() => {
        // Subscribe to page changes
        const unsubscribe = page.subscribe(($page) => {
            const currentURL = $page.route.id ?? "";
            if (currentURL === "") {
                console.error('unable to compute route id');
                activeLinks.set([]);
            } else {
                activeLinks.set(recomputeActiveLinks(currentURL));
            }
        });

        return () => {
            unsubscribe();
        };
    });
</script>

<div class="sidebar-wrapper appage-segment">
    <img src="/logo.png" alt="logo" class="logo p-4"/>
    <div class="links">
        {#each $activeLinks as link}
            <a href={link.url} class:active={link.active}>{link.name}</a>
        {/each}
    </div>
</div>

<style lang="postcss">
    .logo {
        max-width: 300px;
        width: 100%;
        align-self: center;
    }
    .sidebar-wrapper {
        @apply flex flex-col gap-4 p-0;
        max-width: 400px;
        width: 100%;
    }
    .links {
        @apply flex flex-col gap-2;
    }
    .links a {
        @apply p-2;
        padding-left: 11px; /* 16px padding, -5px border. */
        border-left: 5px solid transparent;
        position: relative;

        transition: all 0.3s;
    }

    .links a.active {
        border-left: 5px solid white;
    }

    /*bg transition*/
    .links a:before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, rgba(254, 254, 254, 0.2) 0%, rgba(62, 76, 78, 0.14) 47.62%);
        opacity: 0;
        transition: opacity 0.3s;
    }
    .links a.active:before {
        opacity: 1;
    }
</style>
