import { CollectionConfig } from "payload/types";

const Media:CollectionConfig = {
    slug: 'media',
    upload: true,
    access: {
        read: () => true,
    },
    fields: [
        
    ]
}

export default Media