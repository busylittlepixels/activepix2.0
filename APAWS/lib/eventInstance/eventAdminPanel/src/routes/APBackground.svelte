<div class="ap-bg">
    <div class="bg-overlay"></div>
    <div class="content">
        <slot/>
    </div>
</div>

<style>
    .ap-bg {
        background-image: url('/running.jpeg');
        height: 100%;
        width: 100%;
        position: relative;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-attachment: fixed;
    }
    .bg-overlay {
        background-color: rgba(0, 0, 0, 0.65);
        height: 100%;
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
        /* transform: scale(1.1); */
        backdrop-filter: blur(5px);
    }
    .content {
        position: relative;
        width: 100%;
        height: 100%;
        z-index: 1;
    }   
</style>