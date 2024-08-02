import type { CMSHelpers } from "./CMSHelpers"
import type { ETheme } from "./Theme"

export type MediaData = {
    ingress: string,
    thumbnail: string,
    large: string,
}

export type ThemedGalleryData = {
    theme: ETheme,
    participantCode: number,
    media: MediaData[],
    participantData: any,//| undefined,
    galleryConfig: CMSHelpers.TGalleryConfig
}