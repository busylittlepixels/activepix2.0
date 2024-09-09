<script lang="ts">
	import { Endpoints } from "$lib/Endpoints";
    import * as papa from "papaparse";
	import QueryString from "qs";
	import { createEventDispatcher } from "svelte";
    
    let totalToUpload = 0;
    let currentlyUploaded = 0;
    let isUploading = false;

    const dispatch = createEventDispatcher();
    type RacerDatum = {
        firstName:string,
        lastName:string,
        distance:string,
        time:string
    }
    let loadedData:{
        [participantCode:string]:RacerDatum
    } = {}
    let fileErrors:string[] = []
    let files:FileList;
    function validateParticipantData(parsed:papa.ParseResult<any>) {
        let headers = parsed.meta.fields ?? []
        if(!headers.includes("participantCode")) {
            fileErrors.push("Missing participantCode column");
        }
        if(!headers.includes("firstName")) {
            fileErrors.push("Missing firstName column");
        }
        if(!headers.includes("lastName")) {
            fileErrors.push("Missing lastName column");
        }
        if(!headers.includes("distance")) {
            fileErrors.push("Missing distance column");
        }

        if(!headers.includes("time")) {
            fileErrors.push("Missing time column");
        }
        return true;
    }
    async function selectFile() {
        
        let file = files.item(0);
        if(!file) {
            console.error("No file selected");
            return;
        };
        let fileText = await file.text();
        let parsed = papa.parse(fileText, {header: true});
        console.log(parsed);
        if(parsed.errors.length) {
            fileErrors = parsed.errors.map(error => error.message);
            return;
        }
        if(!validateParticipantData(parsed)) {
            return;
        }
        console.log("File selected", file);
        let data = {} as {[participantCode:string]:RacerDatum};
        parsed.data.forEach((row) => {
            let rowData = row as any;
            let participantCode = rowData["participantCode"];
            data[participantCode] = {
                firstName: rowData["firstName"],
                lastName: rowData["lastName"],
                distance: rowData["distance"],
                time: rowData["time"]
            }
        });
        loadedData = data;
    }
    let selectFileFormWrapper:HTMLFormElement;
    async function selectFileSubmitted() {
        selectFileFormWrapper.style.opacity = "0.5";
        selectFileFormWrapper.style.pointerEvents = "none";
        await selectFile();
        selectFileFormWrapper.style.opacity = "1";
        selectFileFormWrapper.style.pointerEvents = "all";
    }

    async function updateParticipantData() {
        const participantDataEndpoint = Endpoints.cms.participantData.base;

        isUploading = true;
        totalToUpload = Object.keys(loadedData).length;
        currentlyUploaded = 0;
        //Loop through each participant and create/update the participant data
        for(let participantCode in loadedData) {
            //query for current participant data
            console.log('Updating participant data for participant number: ', participantCode);
            const participantDataQuery = `?`+QueryString.stringify({
                where: {
                    participantCode: {
                        equals: participantCode
                    }
                }
            });
            let response = await fetch(participantDataEndpoint + participantDataQuery, {
                method: "GET",
            }).then(response => response.json());
            let participantData = response.docs[0];
            if(participantData) {
                //Update the participant data
                console.log('Participant data exists, updating');
                response = await fetch(participantDataEndpoint + '/' + participantData.id, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `JWT ` + localStorage.getItem("token"),
                    },
                    body: JSON.stringify({
                        participantCode: participantCode,
                        additionalData:{
                            ...loadedData[participantCode]
                        }
                    })
                }).then(response => response.json());
                if(response.errors?.length) {
                    fileErrors = response.errors.map((error:any) => 'Error updating participant data: ' + error.message);
                }
            } else {
                //Create the participant data
                console.log('Participant data does not exist, creating');
                response = await fetch(participantDataEndpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `JWT ` + localStorage.getItem("token"),
                    },
                    body: JSON.stringify({
                        participantCode: participantCode,
                        additionalData: {
                            ...loadedData[participantCode]
                        }
                    })
                }).then(response => response.json());
                if(response.errors?.length) {
                    fileErrors = response.errors.map((error:any) => 'Error creating participant data: ' + error.message);
                }
            }
            currentlyUploaded++;
        }
        
        // let response = await fetch(Endpoints.races + '/'+raceid, {
        //     method: "PATCH",
        //     headers: {
        //         "Content-Type": "application/json",
        //         "Authorization": `JWT ` + localStorage.getItem("token"),
        //     },
        //     body: JSON.stringify({
        //         racerData: loadedData
        //     })
        // });
        // let data = await response.json();
        // if(!data.errors?.length) {
        //     dispatch("participantDataUpdated", data.doc);
        //     alert("Participant data updated successfully");
        // } else {
        //     fileErrors = data.errors.map((error:any) => 'Error updating event: ' + error.message);
        // }

    }

    let updateParticipantDataFormWrapper:HTMLElement
    async function updateParticipantDataSubmitted() {
        updateParticipantDataFormWrapper.style.opacity = "0.5";
        updateParticipantDataFormWrapper.style.pointerEvents = "none";
        await updateParticipantData();
        updateParticipantDataFormWrapper.style.opacity = "1";
        updateParticipantDataFormWrapper.style.pointerEvents = "all";

    }
</script>

<div class="wrapper" bind:this={updateParticipantDataFormWrapper}>
    <form class="form select-file flex flex-row items-center gap-4" bind:this={selectFileFormWrapper}>
        {#if fileErrors.length > 0}
        <div class="w-full alert alert-error mb-2 prose text-white py-1">
            {#each fileErrors as error}
              <p class="m-0">{error}</p>
            {/each}
          </div>
          {/if}
        <input id="select-file-input" type="file" accept=".csv" bind:files={files} />
        <button class="btn btn-primary" type="button" on:click={selectFileSubmitted}>Select File</button>
    </form>
    <h2>Participant Data Preview ({Object.keys(loadedData).length} rows):</h2>
    {#if Object.keys(loadedData).length > 0}
        <table class="table table-zebra">
            <thead>
                <tr>
                    <th>Participant Number</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Distance</th>
                    <th>Time</th>
                </tr>
            </thead>
            <tbody style="">
                {#each Object.keys(loadedData).slice(0,10) as participantCode}
                    <tr>
                        <td>{participantCode}</td>
                        <td>{loadedData[participantCode].firstName}</td>
                        <td>{loadedData[participantCode].lastName}</td>
                        <td>{loadedData[participantCode].distance}</td>
                        <td>{loadedData[participantCode].time}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
    <button class="btn btn-primary mt-2" on:click={updateParticipantDataSubmitted}>Save participant data
        {#if isUploading}
        ({currentlyUploaded}/{totalToUpload})
        {/if}
    </button>
</div>