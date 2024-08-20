import { S3Event } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { SQS } from 'aws-sdk';


/**
 * ENV
 * 
    MEDIA_BUCKET: props.mediaIngressBucket.bucketName,
    JOB_QUEUE: jobQueue.jobQueueArn,
    JOB_DEFINITION: jobDefinition.jobDefinitionArn,
 */

/**
 * LQueueMediaIngressForProcessing
 * Takes items submitted to the media bucket and queues them for processing with our batch processing stack.
 */
export const handler = async (event: S3Event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    console.log('Env:', process.env)
    //Setup context
    const MEDIA_BUCKET = process.env.MEDIA_BUCKET;
    const PROCESSED_BUCKET = process.env.PROCESSED_BUCKET;
    const IMAGE_METADATA_TABLE = process.env.IMAGE_METADATA_TABLE;
    const PARTICIPANT_METADATA_TABLE = process.env.PARTICIPANT_METADATA_TABLE;
    const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;
    if (!MEDIA_BUCKET) {
        throw new Error('MEDIA_BUCKET environment variable not set');
    }
    if (!PROCESSED_BUCKET) {
        throw new Error('PROCESSED_BUCKET environment variable not set');
    }
    if (!IMAGE_METADATA_TABLE) {
        throw new Error('IMAGE_METADATA_TABLE environment variable not set');
    }
    if (!PARTICIPANT_METADATA_TABLE) {
        throw new Error('PARTICIPANT_METADATA_TABLE environment variable not set');
    }
    if (!SQS_QUEUE_URL) {
        throw new Error('SQS_QUEUE_URL environment variable not set');
    }

    const sqs = new SQS();
    for (const record of event.Records) {
        const bucket = record.s3.bucket.name;
        const key = record.s3.object.key;

        console.log(`Queueing for processing, image: ${key} from bucket: ${bucket}`);

        // Construct the message to be sent to the SQS queue
        const messageBody = JSON.stringify({
            bucket,
            key,
        });

        // Send the message to the SQS queue
        try {
            const result = await sqs.sendMessage({
                QueueUrl: SQS_QUEUE_URL,
                MessageBody: messageBody
            }).promise();
            console.log(`Message sent to SQS, MessageId: ${result.MessageId}`);
        } catch (error) {
            console.log(error)
            console.error(`Failed to send message to SQS`);
            throw new Error(`Failed to send message to SQS: ${error}`);
        }
    }


}
