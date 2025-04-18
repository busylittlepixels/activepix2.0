<script lang="ts">
    export let titleText: string;
    export let subtitleText: string;
    export let heroImageURL: string;
</script>

<div class="hero" style="background-image:url('{heroImageURL}')">
    <div class="content-container">
        <div class="title-container">
            <h1>{titleText}</h1>
        </div>
        <div class="subtitle-container">
            <p>{subtitleText}</p>
        </div>
    </div>
</div>

<style lang="postcss">
    .hero {
        @apply bg-cover bg-center;
        height: 100vh;
        width: 100%;
    }
    .content-container {
        min-width: 600px;
        max-width: 100%;
    }

    .title-container{
        @apply p-2;
        background-color: rgba(0,0,0,0.3);
        color: #fff;
        font-size: 4em;
    }
</style>