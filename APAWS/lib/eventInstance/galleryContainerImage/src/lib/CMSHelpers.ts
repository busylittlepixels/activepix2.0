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
}