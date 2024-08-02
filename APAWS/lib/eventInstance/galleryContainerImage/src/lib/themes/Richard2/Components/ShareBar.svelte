<script lang="ts">


function copyLinkToClipboard(){
        if(baseURL){
            navigator.clipboard.writeText(baseURL)+'%3Fnomodal%3Dtrue'
        } else {
            navigator.clipboard.writeText(window.location.href)+'%3Fnomodal%3Dtrue'
        }
        linkLastCopied = Date.now()
    }

</script>