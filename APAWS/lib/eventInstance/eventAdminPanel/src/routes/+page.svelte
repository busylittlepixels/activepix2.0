<script lang="ts">
    import { goto } from "$app/navigation";
    import { AuthStore, isAuthed, login } from "$lib/Authentication";
	import { CMSHelpers } from "$lib/CMSHelpers";
    import { onMount } from "svelte";

    onMount(async () => {
        let Authed = await isAuthed();
        if(Authed) {
            goto('/dashboard');
        }
    });

    let username:string = ""//"admin@activepix.com";
    let password:string = ""//"LoudZone42!";
    async function handleSubmit(){
        await login(username, password).then((res) => {
            if(res){
                goto("/config");
            } else {
                alert("Login failed");
            }
        });
    }
</script>
<div class="outer">
    <form on:submit|preventDefault={handleSubmit}>
        <input class="apinput-text" type="text" id="username" placeholder="Your email address" bind:value={username} />
        <input class="apinput-text" type="password" placeholder="Your password" id="password" bind:value={password} />
        <button class="apbtn-primary" type="submit">Login</button>
    </form>
</div>


<style lang="postcss">
    .outer{
        @apply flex items-center justify-center h-screen;
    }
    form {
        @apply flex flex-col bg-zinc-100 p-4 py-8 rounded gap-2;
        max-width: 500px;
        width: 100%;
        margin: auto;
    }

    input[type="text"], input[type="password"] {
        @apply p-2 my-1 border border-zinc-300 rounded bg-zinc-200;
    }
    button {
        /* @apply apbtn-primary; */
    }
</style>