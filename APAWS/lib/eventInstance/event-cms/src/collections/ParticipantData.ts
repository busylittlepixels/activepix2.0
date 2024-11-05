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
        },
        {
            name: 'submittedData',
            label: 'Submitted Data',
            type: 'json',
            access: {
                read: ({req}) => {
                    return req.user && req.user.role === 'admin'
                },
                update: ({req}) => {
                    return req.user && req.user.role === 'admin'
                }
            }
        }
    ],
    endpoints: [
        {
            'path': '/:id/submit',
            'method': 'post',
            handler: async (req, res) => {
                const { id } = req.params;
                const { submittedData } = req.body;
                //Check submitted data is a JSON object
                if (typeof submittedData !== 'object') {
                    return res.status(400).send('Submitted data must be a JSON object');
                }
                //Overwrite existing keys in submittedData with new values. Leave other keys unchanged.
                const participantData = await req.payload.findByID({
                    collection: 'participantdata',
                    id,
                    overrideAccess: true,
                });
                if(!participantData){
                    return res.status(404).send('Participant not found:' + id);
                }
                const updatedData = {
                    ...participantData.submittedData as {},
                    ...submittedData,
                };

                const updatedAdditionalData = {
                    ...participantData.additionalData as {},
                    hasSubmitted: true,
                };

                await req.payload.update({
                    collection: 'participantdata',
                    id,
                    data: {
                        additionalData: updatedAdditionalData,
                        submittedData: updatedData,
                    },
                    overrideAccess: true,
                });

            }
        }
    ]
}

export default ParticipantData