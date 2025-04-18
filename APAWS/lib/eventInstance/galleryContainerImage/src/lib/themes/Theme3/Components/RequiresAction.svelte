<script lang="ts">
	import { onMount } from "svelte";

/**
 * Simple component that takes:
 * - Action - An async function that returns a boolean
 * - Content Slot - The content to display if the action succeeds
 * - Action Slot - The content to display if the action fails. Usually
 *                 a modal that triggers the action.
 */

    export let action:()=>Promise<boolean>;

    //Retest whether the action is successful
    export async function retestAction() {
        actionresult = ActionResult.Pending;
        let actionSuccess = await action();
        actionresult = actionSuccess ? ActionResult.Success : ActionResult.Failure;
    }
    

    enum ActionResult {
        Success,
        Failure,
        Pending
    }
    let actionresult:ActionResult = ActionResult.Pending;


    onMount(async ()=>{
        retestAction();
    })
</script>

{#if actionresult === ActionResult.Success}
    <slot name="content"/>
{:else if actionresult === ActionResult.Failure}
    <slot name="action"/>
{:else}
    <slot name="loading"/>
{/if}