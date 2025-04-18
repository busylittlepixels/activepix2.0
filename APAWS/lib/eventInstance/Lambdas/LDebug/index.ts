import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
export type HandlerContext = {
    event: APIGatewayProxyEvent;
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

    if(!processedBucket) {
        throw new Error('PROCESSED_BUCKET environment variable not set');
    }

    if(!participantMetadataTable) {
        throw new Error('PARTICIPANT_METADATA_TABLE environment variable not set');
    }

    if(!imageMetadataTable) {
        throw new Error('IMAGE_METADATA_TABLE environment variable not set');
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
            });

        // case 'POST':
        //     return await handlePost({
        //         event,
        //         processedBucket,
        //         participantMetadataTable,
        //         imageMetadataTable,
        //     });

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
            'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
        },
        body: '',
    };
};

// Async function to handle GET requests
const handleGet = async (ctx:HandlerContext): Promise<APIGatewayProxyResult> => {
    //Check query params for debugKey === "AzureBean"
    //If not, return 400

    const debugKey = ctx.event.queryStringParameters?.debugKey;
    if(debugKey !== "AzureBean") {
        return {
            statusCode: 400,
            headers: defaultHeaders(),
            body: JSON.stringify({ message: 'Invalid key' }),
        };
    }

    //Retrieve all upload images from the IngressMedia bucket
    //Compare with the imageMetadataTable to generate a report of:
    //// - Percentage of images processed
    //// - Number of images processed
    //// - Number of images not processed
    //// - Images that have not been processed

    const report:{
        totalUploaded: number,
        totalProcessed: number,
        totalProcessedWithAtLeastOneParticipant: number,
        totalProcessedWithNoParticipants: number,
        hitrate: number,
        totalNotProcessed: number,
        averageParticipantsPerImage: number,
        notProcessed: string[],
        processed: string[],
        allKeys: string[],
        undefineds: number,
        misc:any
    } = {
        totalUploaded: 0,
        totalProcessed: 0,
        totalProcessedWithAtLeastOneParticipant: 0,
        totalProcessedWithNoParticipants: 0,
        hitrate: 0,
        totalNotProcessed: 0,
        averageParticipantsPerImage: 0,
        notProcessed: [],
        processed: [],
        allKeys: [],
        undefineds: 0,
        misc: {}
    }

    const s3 = new AWS.S3();
    const ddb = new AWS.DynamoDB.DocumentClient();

    // 1. Fetch all keys from the IngressMedia bucket
    const listParams = {
        Bucket: ctx.processedBucket,
    };
    const listResult = await s3.listObjectsV2(listParams).promise();
    const keys = listResult.Contents?.map((obj) => obj.Key) || [];
    //Filter undefineds
    const filteredKeys:string[] = []
    keys.forEach((key) => {
        if(key === undefined) {
            report.undefineds += 1
            return;
        }
        filteredKeys.push(key)
    })

    report.totalUploaded = keys.length;

    // 2. Fetch all keys from the imageMetadataTable
    const scanParams = {
        TableName: ctx.imageMetadataTable,
    };
    const scanResult = await ddb.scan(scanParams).promise();
    report.misc.scanResult = scanResult
    const processedKeys = scanResult.Items?.map((item) => item.ingressKey) || [];

    report.totalProcessed = processedKeys.length;
    report.allKeys = processedKeys;

    // 3. Compare the two lists to generate the report
    report.misc.reportdebug= {};
    report.misc.reportdebug.processedKeys = processedKeys;
    report.misc.reportdebug.notInProcessedKeys = [];
    report.misc.reportdebug.withNoParticipants = {}
    report.misc.reportdebug.withParticipants = {}
    processedKeys.forEach((key) => {
        report.processed.push(key);
        const item = scanResult.Items?.find((item) => item.ingressKey === key);
        report.misc[key] = item;
        //item.participantCodes is a Set
        // let participantCodes = [...((item?.participantCodes || new Set()) as Set<number>).values()]
        // participantCodes = participantCodes.filter((code) => code !== -1);
        // const participantCodes = Object.values(item?.participantCodes || {}).filter((code) => code !== -1);
        let participantCodes = ((Object.values(item?.participantCodes)?.[1]) as number[]) || [];

        
        
        participantCodes = participantCodes.filter((code) => code !== -1);

        //Par
        if (participantCodes.length > 0) {
            report.totalProcessedWithAtLeastOneParticipant += 1;
            report.misc.reportdebug.withParticipants[key] = {};
            report.misc.reportdebug.withParticipants[key].item = item;
            // report.misc.reportdebug.withParticipants[key].participantCodes = item?.participantCodes;
            report.misc.reportdebug.withParticipants[key].participantCodesFiltered = participantCodes;
            // report.misc.reportdebug.withParticipants[key].participantCodesType = typeof item?.participantCodes;
            // report.misc.reportdebug.withParticipants[key].participantCodesLength = item?.participantCodes?.length;
            return;
        } else {
            report.totalProcessedWithNoParticipants += 1;
            report.misc.reportdebug.withNoParticipants[key] = {};
            report.misc.reportdebug.withNoParticipants[key].item = item;
            report.misc.reportdebug.withNoParticipants[key].participantCodes = item?.participantCodes;
            report.misc.reportdebug.withNoParticipants[key].participantCodesFiltered = participantCodes;
            // report.misc.reportdebug.withNoParticipants[key].participantCodesFiltered = Object.values(item?.participantCodes || {}).filter((code) => code !== -1);
            // report.misc.reportdebug.withNoParticipants[key].participantCodesType = typeof item?.participantCodes;
            // report.misc.reportdebug.withNoParticipants[key].participantCodesLength = item?.participantCodes?.length;
        }
    });
    report.hitrate = report.totalProcessedWithAtLeastOneParticipant / report.totalProcessed;


    return {
        statusCode: 200,
        headers: defaultHeaders(),
        body: JSON.stringify(report),
    };


};

// Async function to handle POST requests, setting the participant codes for a given key
// const handlePost = async (ctx: HandlerContext): Promise<APIGatewayProxyResult> => {
//     const body = JSON.parse(ctx.event.body || '{}');

//     const key = body.key;
//     const participantCodes = body.participantCodes;

//     if (!key || !participantCodes || !Array.isArray(participantCodes)) {
//         return {
//             statusCode: 400,
//             headers: defaultHeaders(),
//             body: JSON.stringify({ message: 'Invalid request body (key, participantCodes, or isArray(participantCodes))' }),
//         };
//     }

//     const ddb = new AWS.DynamoDB.DocumentClient();

//     // 1. Fetch the existing participantCodes (String Set) from the imageMetadataTable
//     const getParams = {
//         TableName: ctx.imageMetadataTable,
//         Key: { ingressKey: key },
//     };

//     const getResult = await ddb.get(getParams).promise();

//     // Convert oldParticipantCodes set to an array
//     const oldParticipantCodes:string[] = getResult.Item?.participantCodes ? Array.from(getResult.Item.participantCodes) : [];

//     // 2. Update the imageMetadataTable with the new participantCodes (still as a set)
//     const updateImageMetadataParams = {
//         TableName: ctx.imageMetadataTable,
//         Key: { ingressKey: key },
//         UpdateExpression: 'SET participantCodes = :newCodes',
//         ExpressionAttributeValues: {
//             ':newCodes': ddb.createSet(participantCodes), // Store as a set
//         },
//         ReturnValues: 'ALL_NEW',
//     };

//     const updateImageMetadataResult = await ddb.update(updateImageMetadataParams).promise();

//     // 3. Update the participantMetadataTable for participants to remove or add the key
//     const removePromises = oldParticipantCodes
//         .filter((code: string) => !participantCodes.includes(code))
//         .map((code: string) => {
//             const removeParams = {
//                 TableName: ctx.participantMetadataTable,
//                 Key: { participantCode: Number(code) },  // Ensure correct type
//                 UpdateExpression: 'DELETE ingressKeys :key',
//                 ExpressionAttributeValues: {
//                     ':key': ddb.createSet([key]),
//                 },
//             };
//             return ddb.update(removeParams).promise();
//         });

//     const addPromises = participantCodes
//         .filter((code: string) => !oldParticipantCodes.includes(code))
//         .map((code: string) => {
//             const addParams = {
//                 TableName: ctx.participantMetadataTable,
//                 Key: { participantCode: Number(code) },  // Ensure correct type
//                 UpdateExpression: 'ADD ingressKeys :key',
//                 ExpressionAttributeValues: {
//                     ':key': ddb.createSet([key]),
//                 },
//             };
//             return ddb.update(addParams).promise();
//         });

//     // Wait for all update promises to resolve
//     await Promise.all([...removePromises, ...addPromises]);

//     // 4. Return the updated result
//     return {
//         statusCode: 200,
//         headers: defaultHeaders(),
//         body: JSON.stringify({
//             key: updateImageMetadataResult.Attributes?.ingressKey,
//             participantCodes: body.participantCodes,
//         }),
//     };
// };



// Helper function to define default headers (including CORS headers)
const defaultHeaders = (): { [header: string]: string } => {
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Adjust according to your security needs
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    };
};
