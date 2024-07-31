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

    import { S3Event} from 'aws-lambda';
    import * as AWS from 'aws-sdk';
import * as Toolkit from './Toolkit';

export const handler = async (event: S3Event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    //Setup context
    const MEDIA_BUCKET = process.env.MEDIA_BUCKET;
    const PROCESSED_BUCKET = process.env.PROCESSED_BUCKET;
    const METADATA_TABLE = process.env.METADATA_TABLE;
    if (!MEDIA_BUCKET) {
        throw new Error('MEDIA_BUCKET environment variable not set');
    }
    if (!PROCESSED_BUCKET) {
        throw new Error('PROCESSED_BUCKET environment variable not set');
    }
    if (!METADATA_TABLE) {
        throw new Error('METADATA_TABLE environment variable not set');
    }

    const s3 = new AWS.S3();
    const ddb = new AWS.DynamoDB()


    let errors:any[] = [];
    let successes:any[] = [];
    for (const record of event.Records) {
        const bucket = record.s3.bucket.name;
        const key = record.s3.object.key;
        console.log(`Processing image: ${key} from bucket: ${bucket}`);
        //
        // Process the image
        //
        let attemptResult = await Toolkit.processImage({
            s3,
            ddb,
            ingressBucket: MEDIA_BUCKET,
            processedBucket: PROCESSED_BUCKET,
            ingressKey: key,
            metadataTable: METADATA_TABLE,
        });

        if (!attemptResult.success) {
            console.error(`Failed to process image: ${key} from bucket: ${bucket}`, attemptResult);
            continue;
        } else {
            console.log(`Successfully processed image: ${key} from bucket: ${bucket}`, attemptResult);
            successes.push(attemptResult);
        }
    }

    if (errors.length > 0) {
        console.error('Failed to process some images', errors);
    }
    console.log({
        message: 'Processing finished with, ' + errors.length + ' errors',
        errors: errors,
        successes: successes,
    })
    // return {
    //     statusCode: 200,
    //     Body: JSON.stringify(),
    // };
}