<script lang="ts">
    export let onBackgroundClick: (e:any) => void = () => {
        console.log("background clicked");
    };

    export let transparentBg = false

    
</script>

<div class="modal-outer" on:click|preventDefault={(e)=>{
    onBackgroundClick(e);
}}>
    <div class="modal-background">

    </div>
    <div class="modal-inner" on:click|stopPropagation class:modalTransparent={transparentBg}>
        <div class="background w-full h-full">
            <div class="stripe">
                <svg width="1920" height="865" viewBox="0 0 1920 865" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M-444.562 545.629C-659.298 971.212 -444.562 1260 -444.562 1260C-444.562 1260 976.861 -41.6196 2435.94 67.5393C3895.03 176.698 692.855 -379.299 -444.562 545.629Z" fill="#D9D9D9" fill-opacity="0.15"/>
                    </svg>
            </div>    
        </div>
        <slot></slot>
    </div>
</div>

<style lang="postcss">
    .modal-background {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: -1;
        backdrop-filter: blur(5px);
    }

    .modal-outer {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .modal-inner {
        flex: 0;
        background: transparent;
        /* background: rgba(25, 30, 36, 1); */
        padding: 0.5rem;
        border-radius: 0.5rem;
        max-width: 95%;
        max-height: 95%;
        overflow: auto;
        min-width: 600px;
        /* min-height: 400px; */
        position: relative;
    }

    .modalTransparent {
        background-color: rgba(0,0,0,0);
    }

    .background {
        background: rgba(25, 30, 36, 1);
        position: absolute;
        z-index: -2;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
    }

    .stripe {
      position: fixed;
      /* z-index: -1; */
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;

  }
  .stripe svg {
    width: 100%;
    height: auto;
  }
</style>