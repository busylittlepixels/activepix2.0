import * as qs from 'qs'
import { Endpoints } from './Endpoints'

export namespace CMSHelpers {
    export async function getParticipantData (participantCode: string, altFetch?:any) : Promise<null | {
        [key: string]: any
    }> {
        const fetcher = altFetch || fetch
        const query = {
            where: {
                participantCode: {
                    equals: participantCode
                }
            }
        }
        let queryStr = qs.stringify(query)
        console.log(Endpoints.cms.participantData.base + `?${queryStr}`)
        let response = await fetcher(Endpoints.cms.participantData.base + `?${queryStr}`)
        if(response.status !== 200) {
            console.log('Error fetching participant data', response.status)
            return null
        }
        let data;
        try {
            data = await response.json()
        } catch (e) {
            console.log('Error parsing participant data response', e)
            return null
        }

        return data;
    }
    export type TMediaItem = {
        id: string;
        url: string;
        updatedAt: string;
        createdAt: string;
    }
    export type TGalleryConfig = {
        title: string;
        logo: TMediaItem | undefined;
        overlayImage: TMediaItem | undefined;
        ctaText: string;
        ctaImage: TMediaItem | undefined;
        ctaUrl: string;
        ctaAltText: string;
        ctaAltImage: TMediaItem | undefined;
        ctaAltUrl: string;
        updatedAt: string;
    }
    export async function getGalleryConfig (altFetch?:any) : Promise<TGalleryConfig> {
        const fetcher = altFetch || fetch
        let response = await fetcher(Endpoints.cms.galleryConfig.base + '?depth=3')
        if(response.status !== 200) {
            console.log('Error fetching gallery config', response.status)
            throw new Error('Error fetching gallery config')
        }
        let data;
        try {
            data = await response.json()
        } catch (e) {
            console.log('Error parsing gallery config response', e)
            throw new Error('Error parsing gallery config response')
        }

        return data;
    }
}