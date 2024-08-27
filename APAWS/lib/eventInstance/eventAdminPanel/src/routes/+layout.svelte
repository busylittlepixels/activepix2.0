<script>
	import '../app.postcss';
	import Header from './Header.svelte';
	import APBackground from './APBackground.svelte';
	import { AuthStore, initAuthStore, isAuthed } from '$lib/Authentication';
	import Sidebar from './Sidebar.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	async function checkAuth() {
		let Authed = await isAuthed();
		if(!Authed) {
			goto('/');
		}
	}
	onMount(() => {
		checkAuth();
		const unsubscribePage = page.subscribe((value) => {
			initAuthStore().then(() => {
				checkAuth();
			});
		});
		const unsubscribeAuth = AuthStore.subscribe((value) => {
			initAuthStore().then(() => {
				checkAuth();
			});
		});
		return [
			unsubscribePage,
			unsubscribeAuth
		];
	})
	
	
	
</script>
{#await isAuthed()}

{:then isAuthenticated}
	{#if $AuthStore?.token}
		<!-- isauthed -->
		<APBackground>
			<Header/>
			<div class="main-content">
				<Sidebar/>
				<div class="page-content appage-segment p-4">
					<slot></slot>
				</div>
			</div>
		</APBackground>
	{:else}
		<!-- notauthed -->
		<APBackground>
			<Header/>
			<slot></slot>
		</APBackground>
	{/if}
{:catch error}
  <p>Error checking authentication</p>
{/await}


<style lang="postcss">
	.content {
		min-height: 100%;
	}
	.main-content {
		@apply flex gap-2 mt-2;
		min-height: 100%;
	}
	.main-content > div {
		min-height: 100%;
	}
	.page-content {
		@apply flex-1;
	}
</style>