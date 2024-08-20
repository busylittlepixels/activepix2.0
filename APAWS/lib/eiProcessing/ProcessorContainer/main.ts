import * as aws from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { AndriiCodeDetector } from './AndriiDetector';
import { processImage } from './Toolkit';

// Ensure all required environment variables are defined
const requiredEnvVars = ['MEDIA_BUCKET', 'PROCESSED_BUCKET', 'METADATA_TABLE', 'PARTICIPANT_TABLE', 'SQS_QUEUE_URL'];


// while (true){}
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Environment variable ${envVar} is not defined`);
    }
}

//Log proccess name and id, so we can check with health check
console.log('Proccess name: ', process.title);
console.log('Proccess id: ', process.pid);


// Access the environment variables
const mediaBucket = process.env.MEDIA_BUCKET as string;
const processedBucket = process.env.PROCESSED_BUCKET as string;
const metadataTable = process.env.METADATA_TABLE as string;
const participantTable = process.env.PARTICIPANT_TABLE as string;
const queueUrl = process.env.SQS_QUEUE_URL as string;

// Initialize the SQS service
const sqs = new aws.SQS({ region: process.env.AWS_REGION });



// Mock function to simulate image processing
// async function processImage(messageData: {
//     key: string;
// }, workspacePath: string, imageBuffer:Buffer): Promise<void> {
    
//     //Initialize detector
//     const detector = new AndriiCodeDetector(workspacePath)
//     // Here you would add your image processing logic
//     console.log(`Processing image with data: ${messageData}`);
//     console.log(`Media bucket: ${mediaBucket}`);
//     console.log(`Processed bucket: ${processedBucket}`);
//     console.log(`Metadata table: ${metadataTable}`);
//     console.log(`Participant table: ${participantTable}`);

//     const codeMapPromise = detector.detectCodes()

//     //Perform resizing
    

    
//     const codeMap = await codeMapPromise
// }

// Function to poll the SQS queue for messages
async function pollQueue(): Promise<void> {
    console.log('Starting to poll SQS queue...');

    while (true) {
        try {
            // Fetch messages from the SQS queue
            //TODO: Big potential speedup here, we can fetch multiple messages at once.
            const result = await sqs.receiveMessage({
                QueueUrl: queueUrl,
                MaxNumberOfMessages: 1,  // Adjust based on your needs
                WaitTimeSeconds: 20,       // Long polling
            }).promise();

            const s3 = new aws.S3();
            if (result.Messages && result.Messages.length > 0) {
                for (const message of result.Messages) {
                    if (message.Body) {
                        try {
                            //Clear existing workspace, if any
                            console.log('Clearing workspace');
                            try{
                            fs.rmdirSync('workspace', { recursive: true });
                            } catch (error) {
                                console.error('Failed to clear workspace:', error);
                                console.log('Likely the folder does not exist, continuing...');
                            }
                            //Setup workspace.
                            //Make a folder called 'workspace'
                            //Download the image to workspace
                            fs.mkdirSync('workspace', { recursive: true });
                            const workspacePath = path.resolve('workspace');
                            let data;
                            try {
                                data = JSON.parse(message.Body);
                            } catch (error) {
                                console.error('Failed to parse message body:', error);
                                return;
                            }
                            const mediaKey = data.key;
                            const mediaPath = path.join(workspacePath, mediaKey);
                            console.log('Downloading image from S3:', mediaKey);
                            const s3res = await s3.getObject({ Bucket: mediaBucket, Key: mediaKey }).promise();
                            console.log('Downloaded image from S3:', mediaKey);
                            const imageBuffer = s3res.Body as Buffer;
                            fs.writeFileSync(mediaPath, imageBuffer as Buffer);

                            const ddb = new aws.DynamoDB()
                            // Process the image
                            await processImage({
                                s3: s3,
                                ddb: ddb,
                                processedBucket: processedBucket,
                                ingressBucket: mediaBucket,
                                imageMetadataTable: metadataTable,
                                participantMetadataTable: participantTable,
                                ingressKey: mediaKey,
                                workspacePath: workspacePath
                            });

                            console.log('Done, deleting message from queue');

                            // Delete the message from the queue after successful processing
                            await sqs.deleteMessage({
                                QueueUrl: queueUrl,
                                ReceiptHandle: message.ReceiptHandle as string,
                            }).promise();

                            console.log(`Message processed and deleted: ${message.MessageId}`);
                        } catch (error) {
                            console.error(`Failed to process message ${message.MessageId}:`, error);
                        }
                    }
                }
            } else {
                console.log('No messages available, polling again...');
            }
        } catch (error) {
            console.error('Error fetching messages from SQS:', error);
        }
    }
}

// Start polling the queue
pollQueue().catch((error) => {
    console.error('Polling failed:', error);
});
