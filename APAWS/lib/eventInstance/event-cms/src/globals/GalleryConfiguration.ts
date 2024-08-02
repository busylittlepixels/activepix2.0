import { GlobalConfig } from "payload/types";

const GalleryConfiguration:GlobalConfig = {
    slug: 'galleryconfig',
    access: {
        read: () => true,
    },
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
            name: 'overlayImageLandscape',
            label: 'Overlay Image Landscape',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: 'overlayImagePortrait',
            label: 'Overlay Image Portrait',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: 'ctaText',
            label: 'CTA Text',
            type: 'text',
        },
        {
            name: 'ctaLink',
            label: 'CTA Link',
            type: 'text',
        },
        {
            name: 'ctaImage',
            label: 'CTA Image',
            type: 'upload',
            relationTo: 'media',
        },
        {
            name: 'ctaAltText',
            label: 'CTA Alt Text',
            type: 'text',
        },
        {
            name: 'ctaAltLink',
            label: 'CTA Alt Link',
            type: 'text',
        },
        {
            name: 'ctaAltImage',
            label: 'CTA Alt Image',
            type: 'upload',
            relationTo: 'media',
        },
    ]
}

export default GalleryConfiguration