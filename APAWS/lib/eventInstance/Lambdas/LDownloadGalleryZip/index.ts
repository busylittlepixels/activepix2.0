import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as JSZip from 'jszip';
export type HandlerContext = {
    event: APIGatewayProxyEvent;
    processedBucket: string;
    ingressBucket: string;
    zipDownloadsBucket: string;
    participantMetadataTable: string;
    imageMetadataTable: string;

}

// The main handler function for the Lambda
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    const ingressBucket = process.env.INGRESS_BUCKET;
    const processedBucket = process.env.PROCESSED_BUCKET;
    const zipDownloadsBucket = process.env.ZIP_DOWNLOADS_BUCKET
    const participantMetadataTable = process.env.PARTICIPANT_METADATA_TABLE;
    const imageMetadataTable = process.env.IMAGE_METADATA_TABLE;

    if(!ingressBucket) {
        throw new Error('INGRESS_BUCKET environment variable not set');
    }
    if(!processedBucket) {
        throw new Error('PROCESSED_BUCKET environment variable not set');
    }

    if(!zipDownloadsBucket) {
        throw new Error('ZIP_DOWNLOADS_BUCKET environment variable not set');
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
                ingressBucket,
                processedBucket,
                zipDownloadsBucket,
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
            'Access-Control-Allow-Methods': 'OPTIONS,GET',
        },
        body: '',
    };
};

// Async function to handle GET requests
//Expects an comma seperate list of ingressKeys in the query string
//Creates a zip of the images
// pushes it to zipDownloads bucket
// returns the url of the zip
const handleGet = async (ctx:HandlerContext): Promise<APIGatewayProxyResult> => {
    const { event, ingressBucket, processedBucket, zipDownloadsBucket, participantMetadataTable, imageMetadataTable } = ctx;
    const s3 = new AWS.S3();
    const ingressKeys = event.queryStringParameters?.ingressKeys;
    if (!ingressKeys) {
        return {
            statusCode: 400,
            headers: defaultHeaders(),
            body: JSON.stringify({ message: 'Missing query parameter ingressKeys' }),
        };
    }
    const keys = ingressKeys.split(',');
    const zipKey = `gallery-${Date.now()}.zip`;
    const zipParams = {
        Bucket: zipDownloadsBucket,
        Key: zipKey,
    };
    const zipUrl = `https://${zipDownloadsBucket}.s3.amazonaws.com/${zipKey}`;
    const zip = new JSZip();
    for (const key of keys) {
        const params = {
            Bucket: ingressBucket,
            Key: key,
        };
        console.log('Attempting key:', key);
        const data = await s3.getObject(params).promise();
        const body = data.Body as any;
        if (!body) {
            return {
                statusCode: 404,
                headers: defaultHeaders(),
                body: JSON.stringify({ message: `Key ${key} not found` }),
            };
        }
        const image = zip.file(key);
        if (image) {
            return {
                statusCode: 500,
                headers: defaultHeaders(),
                body: JSON.stringify({ message: `Key ${key} already exists in zip` }),
            };
        }
        zip.file(key, body);
    }
    const zipData = await zip.generateAsync({ type: 'nodebuffer' });
    await s3.putObject({ ...zipParams, Body: zipData }).promise();
    return {
        statusCode: 200,
        headers: defaultHeaders(),
        body: JSON.stringify({ url: zipUrl }),
    };
};



// Helper function to define default headers (including CORS headers)
const defaultHeaders = (): { [header: string]: string } => {
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Adjust according to your security needs
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    };
};
