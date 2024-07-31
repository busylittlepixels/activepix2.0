import { CollectionConfig } from "payload/types";

const ParticipantData:CollectionConfig = {
    slug: 'participantdata',
    access: {
        read: () => true,
    },
    fields: [
        {
            name: 'participantCode',
            label: 'Participant Code',
            type: 'text',
            required: true,
        },
        {
            name: 'additionalData',
            label: 'Additional Data',
            type: 'json',
        }
    ]
}

export default ParticipantData