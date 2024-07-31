import * as qs from 'qs'

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
}