<script lang="ts">
    import { goto } from "$app/navigation";
    import { AuthStore, isAuthed, login } from "$lib/Authentication";
	import { CMSHelpers } from "$lib/CMSHelpers";
    import { onMount } from "svelte";
	import { get } from "svelte/store";

    onMount(async () => {
        let Authed = await isAuthed();
        // if(Authed) {
        //     goto('/dashboard');
        // }
    });

    let username:string = ""//"admin@activepix.com";
    let password:string = ""
    let loginMode:"manager"|"photographer" = "manager";
    async function handleSubmit(){
        await login(username, password).then((res) => {
            if(res){
                    let role = get(AuthStore)?.user?.role
                    console.log(get(AuthStore))
                    if(role === "manager" || role === "admin"){
                        goto("/dashboard");
                        return
                    } else if(role === "photographer"){
                        goto("/photographer");
                        return
                    } else {
                        alert("Invalid role");
                        return;
                    }
            } else {
                alert("Login failed");
                return;
            }
        });
    }
</script>
<div class="outer">
    <form on:submit|preventDefault={handleSubmit}>
        <input class="apinput-text" type="text" id="username" placeholder="Your email address" bind:value={username} />
        <input class="apinput-text" type="password" placeholder="Your password" id="password" bind:value={password} />
        <div class="flex flex-row gap-2">
            <button class="apbtn-primary flex-grow w-1" type="submit">Login as Manager</button>
            <button class="apbtn-primary flex-grow w-1" type="submit" on:click={() => loginMode = "photographer"}>Login as Photographer</button>
        </div>
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