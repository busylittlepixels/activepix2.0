import { Endpoints } from "./Endpoints";
import type { MediaData } from "./EventTypes";

export namespace EventData {
    export async function getImagesForParticipant(
        participantCode:number,
        alternateFetch?:any
    ) : Promise<MediaData[]>{ 
        let fetcher = fetch;
        if(alternateFetch){
            fetcher = alternateFetch;
        }
        const response = await fetcher(Endpoints.galleryData.forParticipant, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({participantCode})
        });
        if(!response.ok){
            throw new Error("Failed to fetch images for participant");
        }
        return await response.json();
    }
}