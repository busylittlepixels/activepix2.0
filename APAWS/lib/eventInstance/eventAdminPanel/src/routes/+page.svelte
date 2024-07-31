<script lang="ts">
    import { goto } from "$app/navigation";
    import { AuthStore, login } from "$lib/Authentication";
	import { CMSHelpers } from "$lib/CMSHelpers";
    import { onMount } from "svelte";

    let username:string = "admin@activepix.com";
    let password:string = "LoudZone42!";
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
<h1>Login</h1>
<form on:submit|preventDefault={handleSubmit}>
  <label for="username">Username</label>
  <input type="text" id="username" bind:value={username} />
  <label for="password">Password</label>
  <input type="password" id="password" bind:value={password} />
  <button type="submit">Login</button>
</form>