import { GlobalConfig } from "payload/types";

const GalleryConfiguration:GlobalConfig = {
    slug: 'galleryconfig',
    fields: [
        {
            name: 'title',
            label: 'Title',
            type: 'text',
        },
        {
            name: 'logo',
            label: 'Logo',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: 'overlayImage',
            label: 'Overlay Image',
            type: 'upload',
            relationTo: 'media',
        }
    ]
}

export default GalleryConfiguration