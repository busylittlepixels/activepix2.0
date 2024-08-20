import type { CMSHelpers } from "./CMSHelpers"
import type { ETheme } from "./Theme"

export type MediaData = {
    ingress: string,
    thumbnail: string,
    large: string,
}
/*
{
  "success": true,
  "theme": "Theme2",
  "participantCode": 1266,
  "media": [
    [
      {
        "ingress": "IMG_6026.JPG",
        "thumbnail": "https://apawsei-test-processed-bucket.s3.amazonaws.com/IMG_6026-thumbnail.png",
        "large": "https://apawsei-test-processed-bucket.s3.amazonaws.com/IMG_6026-large.png"
      },
      {
        "ingress": "IMG_6027.JPG",
        "thumbnail": "https://apawsei-test-processed-bucket.s3.amazonaws.com/IMG_6027-thumbnail.png",
        "large": "https://apawsei-test-processed-bucket.s3.amazonaws.com/IMG_6027-large.png"
      },
      {
        "ingress": "IMG_6028.JPG",
        "thumbnail": "https://apawsei-test-processed-bucket.s3.amazonaws.com/IMG_6028-thumbnail.png",
        "large": "https://apawsei-test-processed-bucket.s3.amazonaws.com/IMG_6028-large.png"
      },
      {
        "ingress": "IMG_6029.JPG",
        "thumbnail": "https://apawsei-test-processed-bucket.s3.amazonaws.com/IMG_6029-thumbnail.png",
        "large": "https://apawsei-test-processed-bucket.s3.amazonaws.com/IMG_6029-large.png"
      },
      {
        "ingress": "IMG_6030.JPG",
        "thumbnail": "https://apawsei-test-processed-bucket.s3.amazonaws.com/IMG_6030-thumbnail.png",
        "large": "https://apawsei-test-processed-bucket.s3.amazonaws.com/IMG_6030-large.png"
      },
      {
        "ingress": "IMG_6031.JPG",
        "thumbnail": "https://apawsei-test-processed-bucket.s3.amazonaws.com/IMG_6031-thumbnail.png",
        "large": "https://apawsei-test-processed-bucket.s3.amazonaws.com/IMG_6031-large.png"
      }
    ]
  ],
  "participantData": null,
  "galleryConfig": {
    "detectionStrategy": "alpha"
  }
}
*/
export type ThemedGalleryData = {
    success: boolean,
    theme: ETheme,
    participantCode: number,
    media: MediaData[],
    participantData: any,//| undefined,
    galleryConfig: CMSHelpers.TGalleryConfig
}