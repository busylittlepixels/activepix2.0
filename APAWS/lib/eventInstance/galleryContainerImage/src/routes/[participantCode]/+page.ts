import { CMSHelpers } from '$lib/CMSHelpers';
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
    const mediaDataPromise = EventData.getImagesForParticipant(participantNumber, fetch);
    //Get the participant data from CMS
    const participantDataPromise = CMSHelpers.getParticipantData(participantNumber.toString(), fetch)

    const galleryConfigPromise = CMSHelpers.getGalleryConfig(fetch);
    
    //Wait for both promises to resolve
    const [mediaData, participantData] = await Promise.all([mediaDataPromise, participantDataPromise]);

    let galleryData:ThemedGalleryData = {
        theme: ETheme.Theme3,
        participantCode: participantNumber,
        media: mediaData,
        participantData: participantData?.docs[0]?.additionalData ?? null,
        // galleryConfig: {} as any
        galleryConfig: (await galleryConfigPromise) ?? null
    };

    return galleryData

};