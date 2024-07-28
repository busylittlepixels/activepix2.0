/**
 * LProcessImage - Lambda function that processes images uploaded to MediaIngress bucket, outputting to ProcessedMedia bucket.
    - Scans the images for participant codes.
    - Applies any overlays to the image
    - Creates a max 2000x2000 variant of the image and uploads it to the ProcessedMedia bucket.
    - Creates a max 500x500 variant of the image and uploads it to the ProcessedMedia bucket.
    - Creates an entry in the ProcessedImageMetadata table for each image containing:
    - - Detected participant codes
    - - Thumbnail URL
    - - Fullsize URL

    Notes from CDK:
    environment: {
        MEDIA_BUCKET: MediaIngressBucket.bucketName,
        PROCESSED_BUCKET: ProcessedBucket.bucketName,
        METADATA_TABLE: ProcessedImageMetadataTable.tableName
    },
 */
import { S3Event } from 'aws-lambda';
export declare const handler: (event: S3Event) => Promise<void>;
