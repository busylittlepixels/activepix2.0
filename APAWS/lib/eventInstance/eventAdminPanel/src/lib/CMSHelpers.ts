import * as qs from 'qs'
export namespace CMSTypes {
    export type Media = {
        id: string;
        updatedAt: string;
        createdAt: string;
        url?: string | null;
        filename?: string | null;
        mimeType?: string | null;
        filesize?: number | null;
        width?: number | null;
        height?: number | null;
        focalX?: number | null;
        focalY?: number | null;
    }
    export type Galleryconfig = {
        id: string;
        title?: string | null;
        logo?: string | Media | null;
        date?: string | null;
        location?: string | null;
        overlayImage?: string | Media | null;
        ctaText?: string | null;
        ctaMedia?: string | Media | null;
        ctaUrl?: string | null;
        ctaAltText?: string | null;
        ctaAltMedia?: string | Media | null;
        ctaAltUrl?: string | null;
        updatedAt?: string | null;
        createdAt?: string | null;
    }
    export type Participantdatum = {
        id: string;
        participantCode: string;
        additionalData?:
          | {
              [k: string]: unknown;
            }
          | unknown[]
          | string
          | number
          | boolean
          | null;
        updatedAt: string;
        createdAt: string;
      }
}
export namespace CMSHelpers {
    export async function getParticipantData (participantCode: string) : Promise<null | {
        [key: string]: any
    }> {
        const query = {
            where: {
                participantCode: {
                    equals: participantCode
                }
            }
        }
        let queryStr = qs.stringify(query)
        let response = await fetch(`/api/participantdata?${queryStr}`)
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

    export async function patchGalleryConfig(galleryConfig: Partial<CMSTypes.Galleryconfig>) {
        let response = await fetch(`/api/galleryconfig`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(galleryConfig),
        });

        if(response.status !== 200) {
            console.log('Error patching gallery config', response.status)
            return null
        }

        let data;
        try {
            data = await response.json()
        } catch (e) {
            console.log('Error parsing gallery config patch response', e)
            return null
        }

        return data;
    }
}