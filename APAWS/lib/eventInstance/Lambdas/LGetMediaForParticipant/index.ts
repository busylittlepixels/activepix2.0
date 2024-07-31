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

    //Setup context
    const ddb = new AWS.DynamoDB()
    const PROCESSED_BUCKET = process.env.PROCESSED_BUCKET;
    const METADATA_TABLE = process.env.METADATA_TABLE;
    if (!PROCESSED_BUCKET) {
        throw new Error('PROCESSED_BUCKET environment variable not set');
    }

    if (!METADATA_TABLE) {
        throw new Error('METADATA_TABLE environment variable not set');
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
            })
        }
    }

    //Check the body
    if (!body.participantCode) {
        console.log('Missing participantCode in body', body);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'participantCode is required'
            })
        }
    }

    //Get the participant code
    const participantCode = body.participantCode;

    //Query the metadata table
    let queryResult;
    try {
        queryResult = await ddb.query({
            TableName: METADATA_TABLE,
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
            })
        }
    }

    //Process the query result
    let items = queryResult.Items || [];
    
    let responseItems = items.map(item => {
        return {
            ingress: item.ingressKey.S,
            thumbnail: `https://${PROCESSED_BUCKET}.s3.amazonaws.com/${item.thumbnailKey.S}`,
            large: `https://${PROCESSED_BUCKET}.s3.amazonaws.com/${item.fullsizeKey.S}`
        }
    })
    console.log('Successfully processed request', responseItems);
    return {
        statusCode: 200,
        body: JSON.stringify(responseItems)
    }
    
}