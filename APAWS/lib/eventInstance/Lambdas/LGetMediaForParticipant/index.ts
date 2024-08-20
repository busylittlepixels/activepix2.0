import { APIGatewayEvent } from "aws-lambda";
import * as AWS from 'aws-sdk';

/*
Handles the API Gateway event for the /forParticipant endpoint
Expects a participantCode in the body in format: {
    participantCode: number
}
Returns a list of S3 urls from the ProcessedBucket for the
participant code in the format: [
    {
        ingress: <key:string>,
        thumbnail: <url:string>,
        large: <url:string>
    }
]
 */
export const handler = async (event: APIGatewayEvent) => {


    // Check if it's an OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: ''
        }   
    }

    //Setup context
    const ddb = new AWS.DynamoDB()
    const PROCESSED_BUCKET = process.env.PROCESSED_BUCKET;
    const PARTICIPANT_METADATA_TABLE = process.env.PARTICIPANT_METADATA_TABLE;
    const IMAGE_METADATA_TABLE = process.env.IMAGE_METADATA_TABLE;
    if (!PROCESSED_BUCKET) {
        throw new Error('PROCESSED_BUCKET environment variable not set');
    }

    if (!PARTICIPANT_METADATA_TABLE) {
        throw new Error('PARTICIPANT_METADATA_TABLE environment variable not set');
    }

    if (!IMAGE_METADATA_TABLE) {
        throw new Error('IMAGE_METADATA_TABLE environment variable not set');
    }
    

    //Parse the body
    console.log('Received event:', JSON.stringify(event, null, 2));
    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch (e) {
        console.error('Failed to parse request body', e);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Invalid request body'
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        }
    }

    //Check the body
    if (!body.participantCode) {
        console.log('Missing participantCode in body', body);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'participantCode is required'
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        }
    }

    //Get the participant code
    const participantCode = body.participantCode;

    //Query the metadata table
    let participantQueryResult;
    try {
        participantQueryResult = await ddb.query({
            TableName: PARTICIPANT_METADATA_TABLE,
            KeyConditionExpression: 'participantCode = :participantCode',
            ExpressionAttributeValues: {
                ':participantCode': { N: participantCode.toString() }
            }
        }).promise();
    } catch (e) {
        console.error('Failed to query metadata table', e);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to query metadata table'
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        }
    }

    //Process the participantQueryResult
    let items = participantQueryResult.Items || [];
    
    let responseItems = await Promise.all(items.map(async (item) => {
        const ingressKeysForParticipant = item.ingressKeys.SS || [];
        //For each key, query the image metadata table and return an object:
        //Query for the image metadata
        return await Promise.all(ingressKeysForParticipant.map(async key => {
            let imageMetadataQueryResult;
            try {
                imageMetadataQueryResult = await ddb.getItem({
                    TableName: IMAGE_METADATA_TABLE,
                    Key: { ingressKey: { S: key } }
                }).promise();
            } catch (e) {
                console.error('Failed to query image metadata table', e);
                return {
                    error: 'Failed to query image metadata table'
                }
            }
            console.log({
                key: key,
                imageMetadataQueryResult: imageMetadataQueryResult
            })
            const thumbnailKey = imageMetadataQueryResult.Item?.thumbnailKey.S
            const fullsizeKey = imageMetadataQueryResult.Item?.fullsizeKey.S

            if(!thumbnailKey || !fullsizeKey) {
                console.error('Missing thumbnail or fullsize key', imageMetadataQueryResult.Item);
                return {
                    error: 'Missing thumbnail or fullsize key'
                }
            }


            return {
                ingress: key,
                thumbnail: `https://${PROCESSED_BUCKET}.s3.amazonaws.com/${thumbnailKey}`,
                large: `https://${PROCESSED_BUCKET}.s3.amazonaws.com/${fullsizeKey}`
            }
        }))
    }))
    //return first item, incase theres two instances of the same participant in the db. There shouldn't be.
    console.log('Successfully processed request', responseItems[0]);
    return {
        statusCode: 200,
        body: JSON.stringify(responseItems[0]),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    }
    
}