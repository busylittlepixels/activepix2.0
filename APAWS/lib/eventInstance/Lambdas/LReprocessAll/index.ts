import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
export type HandlerContext = {
    event: APIGatewayProxyEvent;
    imageProcessingQueue: string;
    ingressBucket: string;
    processedBucket: string;
    participantMetadataTable: string;
    imageMetadataTable: string;
    
}

// The main handler function for the Lambda
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    const processedBucket = process.env.PROCESSED_BUCKET;
    const participantMetadataTable = process.env.PARTICIPANT_METADATA_TABLE;
    const imageMetadataTable = process.env.IMAGE_METADATA_TABLE;
    const ingressBucket = process.env.INGRESS_BUCKET;
    const imageProcessingQueue = process.env.IMAGE_PROCESSING_QUEUE;

    if(!processedBucket) {
        throw new Error('PROCESSED_BUCKET environment variable not set');
    }

    if(!participantMetadataTable) {
        throw new Error('PARTICIPANT_METADATA_TABLE environment variable not set');
    }

    if(!imageMetadataTable) {
        throw new Error('IMAGE_METADATA_TABLE environment variable not set');
    }

    if(!ingressBucket) {
        throw new Error('INGRESS_BUCKET environment variable not set');
    }

    if(!imageProcessingQueue) {
        throw new Error('IMAGE_PROCESSING_QUEUE environment variable not set');
    }

    switch (event.httpMethod) {
        case 'OPTIONS':
            return handleOptions();

        case 'GET':
            return await handleGet({
                event,
                processedBucket,
                participantMetadataTable,
                imageMetadataTable,
                ingressBucket,
                imageProcessingQueue
            });

        case 'POST':
            // return await handlePost({
            //     event,
            //     processedBucket,
            //     participantMetadataTable,
            //     imageMetadataTable,
            //     ingressBucket,
            //     imageProcessingQueue,
            // });

        default:
            return {
                statusCode: 405,
                headers: defaultHeaders(),
                body: JSON.stringify({ message: `Method ${event.httpMethod} not allowed` }),
            };
    }
};

// Handler for OPTIONS requests, typically used for CORS preflight requests
const handleOptions = (): APIGatewayProxyResult => {
    return {
        statusCode: 200,
        headers: {
            ...defaultHeaders(),
            'Access-Control-Allow-Methods': 'OPTIONS,POST',
        },
        body: '',
    };
};

//Fetch all S3 objects
const fetchAllObjects = async (s3: AWS.S3, bucket: string): Promise<AWS.S3.ObjectList> => {
    let allObjects: AWS.S3.ObjectList = [];
    let continuationToken: string | undefined = undefined;

    do {
        const params: AWS.S3.ListObjectsV2Request = {
            Bucket: bucket,
            ContinuationToken: continuationToken,
        };

        console.log(`Fetching objects from bucket: ${bucket}, continuationToken: ${continuationToken}`);
        const response = await s3.listObjectsV2(params).promise();
        if (response.Contents) {
            allObjects = allObjects.concat(response.Contents);
        }
        continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return allObjects;
};


// Async function to handle GET requests
const handleGet = async (ctx:HandlerContext): Promise<APIGatewayProxyResult> => {
    //Check query parameter 'debugKey' is set to 'AzureBean'
    const queryParams = ctx.event.queryStringParameters;
    const debugKey = queryParams?.debugKey;
    if(debugKey !== 'AzureBean') {
        return {
            statusCode: 400,
            headers: defaultHeaders(),
            body: JSON.stringify({ message: 'Invalid debugKey parameter' }),
        };
    }

    /*
    queing example:
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
    */

    //Loop through all items in the S3 bucket, and re-queue them for processing
    const s3 = new AWS.S3();
    const sqs = new AWS.SQS();

    const params = {
        Bucket: ctx.ingressBucket,
    };

    console.log(`Fetching all objects from bucket: ${ctx.ingressBucket}`);
    const s3Objects = await fetchAllObjects(s3, ctx.ingressBucket);

    //Limited to 1000 items, so we need to paginate


    let successCount = 0;
    let errorCount = 0;
    let totalCount = s3Objects.length;
    // for(const item of s3Objects.Contents || []) {
    //     const key = item.Key;

    //     console.log(`Queueing for processing, image: ${key} from bucket: ${ctx.ingressBucket}`);

    //     // Construct the message to be sent to the SQS queue
    //     const messageBody = JSON.stringify({
    //         bucket: ctx.ingressBucket,
    //         key,
    //     });

    //     // Send the message to the SQS queue
    //     try {
    //         const result = await sqs.sendMessage({
    //             QueueUrl: ctx.imageProcessingQueue,
    //             MessageBody: messageBody,
    //         }).promise();
    //         console.log(`Message sent to SQS, MessageId: ${result.MessageId}`);
    //         successCount++;
    //     } catch (error) {
    //         console.error(`Failed to send message to SQS`);
    //         throw new Error(`Failed to send message to SQS: ${error}`);
    //         errorCount++;
    //     }
    // }
    //Refactor to use Promise.all
    const promises = s3Objects.map(async (item) => {
        const key = item.Key;

        // console.log(`Queueing for processing, image: ${key} from bucket: ${ctx.ingressBucket}`);

        // Construct the message to be sent to the SQS queue
        const messageBody = JSON.stringify({
            bucket: ctx.ingressBucket,
            key,
        });

        // Send the message to the SQS queue
        try {
            const result = await sqs.sendMessage({
                QueueUrl: ctx.imageProcessingQueue,
                MessageBody: messageBody,
            }).promise();
            // console.log(`Message (${successCount + errorCount} / ${totalCount}) sent to SQS, MessageId: ${result.MessageId}`);
            successCount++;
        } catch (error) {
            console.error(`Failed to send message to SQS`);
            throw new Error(`Failed to send message to SQS: ${error}`);
            errorCount++;
        }
    });

    await Promise.all(promises || []);


    return {
        statusCode: 200,
        headers: defaultHeaders(),
        body: JSON.stringify({ message: 'Successfully requeued', successCount, errorCount }),
    };
};

// Async function to handle GET requests
// const handleGet = async (ctx:HandlerContext): Promise<APIGatewayProxyResult> => {
//     // Example: Retrieve query parameters or other logic for GET requests
//     const queryParams = ctx.event.queryStringParameters;

//     //Expects:
//     // limit: Number, or empty. If empty, default to 1000.
//     // lastEvaluatedKey: String, or empty. If empty, start from the beginning.

//     //Response:
//     // {
//     //     media: [
//     //         {
//     //             key: <string>,
//     //             [sizename]: <url:string>
//     //         }
//     //     ],
//     //     lastEvaluatedKey: <string>
//     // }
//     const limit = queryParams?.limit ? parseInt(queryParams.limit) : 1000;
//     const lastEvaluatedKey = queryParams?.lastEvaluatedKey;

//     if(limit < 1) {
//         return {
//             statusCode: 400,
//             headers: defaultHeaders(),
//             body: JSON.stringify({ message: 'Invalid limit parameter' }),
//         };
//     }

//     // Implement your logic here
//     const ddb = new AWS.DynamoDB.DocumentClient();

//     const params = {
//         TableName: ctx.imageMetadataTable,
//         Limit: limit,
//         ExclusiveStartKey: lastEvaluatedKey ? { ingressKey: lastEvaluatedKey } : undefined,
//     };

//     const result = await ddb.scan(params).promise();

//     const response = {
//         media: result.Items?.map((item: any) => {
//             return {
//                 ingressKey: item.ingressKey,
//                 thumbnail: `https://${ctx.processedBucket}.s3.amazonaws.com/${item.thumbnailKey}`,
//                 fullsize: `https://${ctx.processedBucket}.s3.amazonaws.com/${item.fullsizeKey}`,
//                 participantCodes: item.participantCodes,
//             };
//         }) || [],
//         lastEvaluatedKey: result.LastEvaluatedKey ? result.LastEvaluatedKey.ingressKey : undefined,
//     };

        
//     return {
//         statusCode: 200,
//         headers: defaultHeaders(),
//         body: JSON.stringify(response),
//     };
// };

// Async function to handle POST requests, setting the participant codes for a given key
// const handlePost = async (ctx: HandlerContext): Promise<APIGatewayProxyResult> => {
//     const body = JSON.parse(ctx.event.body || '{}');

//     const ingressKeys = body.ingressKeys ?? 'ALL';

//     // In the ingressbucket, re-add all keys to the queue
//     const s3 = new AWS.S3();
    
    
// };



// Helper function to define default headers (including CORS headers)
const defaultHeaders = (): { [header: string]: string } => {
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Adjust according to your security needs
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    };
};
