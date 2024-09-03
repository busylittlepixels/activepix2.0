import { CollectionConfig } from "payload/types";

const Media:CollectionConfig = {
    slug: 'media',
    upload: true,
    access: {
        read: () => true,
        create: ({ req }) => {
            //TODO: FIX THIS
            return true;
            // if(req.user){
            //     return true
            // } else{
            //     console.log(req.user)
            //     console.log('You must be logged in to upload media')
            // }
        }
    },
    fields: [
        
    ]
}

export default Media