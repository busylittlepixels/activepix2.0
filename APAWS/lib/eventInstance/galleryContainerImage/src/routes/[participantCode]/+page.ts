import { EventData } from '$lib/EventData';
import type { ThemedGalleryData } from '$lib/EventTypes';
import { ETheme } from '$lib/Theme';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
    //Get B64 encoded participant number from 'participantCode' URL parameter
    const participantCode = atob(params.participantCode);
    //Parse participant number to integer
    const participantNumber = parseInt(participantCode);

    if(isNaN(participantNumber)){
        throw new Error("Invalid participant code");
    }

    //Get gallery data from API
    const mediaData = await EventData.getImagesForParticipant(participantNumber, fetch);

    let galleryData:ThemedGalleryData = {
        theme: ETheme.Test,
        participantCode: participantNumber,
        media: mediaData
    };

    return galleryData

};