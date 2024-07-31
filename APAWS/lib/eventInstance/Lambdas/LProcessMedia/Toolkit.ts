import * as AWS from 'aws-sdk';
import * as sharp from 'sharp';

const sizes: {
    size: number;
    name: string;
}[] = [
    { size: 500, name: 'thumbnail' },
    { size: 2000, name: 'large' },
];

interface BasicContext {
    s3: AWS.S3;
    ddb: AWS.DynamoDB;
    processedBucket: string;
    ingressBucket: string;
    metadataTable: string;
    
}


interface ProcessImageContext extends BasicContext {
    ingressKey: string;
}
type ProcessImageFailure = {
    success: false;
    message: string;
    data?: any;
}
type ProcessImageSuccess = {
    success: true;
    message: string;
    data?: any;
}
type ProcessImageResult = ProcessImageFailure | ProcessImageSuccess;
export async function processImage(ctx: ProcessImageContext) : Promise<ProcessImageResult> {
    const params = {
        Bucket: ctx.ingressBucket,
        Key: ctx.ingressKey,
    };
    console.log('Getting object from S3', params);
    const data = await ctx.s3.getObject(params).promise()
    .then(data => {
        return data.Body
    })
    //Check data is a buffer
    if (!Buffer.isBuffer(data)) {
        return {
            success: false,
            message: 'Data is not a buffer',
            data
        }
    }

    //Convert to PNG and fix orientation
    console.log('Performing rotation fix and conversion to PNG');
    let imageBuffer = await sharp(data).rotate().png().toBuffer();

    //Process the image while generating sizes
    //to be implemented.
    let participantCodesPromise = getParticipantCodes({
        ibuffer: imageBuffer
    });

    //Generate sizes
    console.log('Generating image sizes');
    let imageSizes = await Promise.all(sizes.map(size => {
        return generateImageSize({
            s3: ctx.s3,
            ingressMediaKey: ctx.ingressKey,
            ingressMediaData: imageBuffer,
            processedBucket: ctx.processedBucket,
            size: size.size,
            sizeName: size.name,
        });
    }))

    //Save metadata
    console.log('Saving media metadata');
    let metadataItem = {
        ingressKey: ctx.ingressKey,
        participantCodes: await participantCodesPromise,
        thumbnailKey: imageSizes.find(key => key.includes('thumbnail')) || '',
        fullsizeKey: imageSizes.find(key => key.includes('large')) || '',
    };

    await ctx.ddb.putItem({
        TableName: ctx.metadataTable,
        Item: {
            ingressKey: { S: ctx.ingressKey },
            participantCodes: { NS: metadataItem.participantCodes.map(code => code.toString()) },
            thumbnailKey: { S: metadataItem.thumbnailKey },
            fullsizeKey: { S: metadataItem.fullsizeKey },
        }
    }).promise();

    //Update participant data:
    /*
    PARTICIPANT DATA:
    {
        participantCode: number,
        ingressKeys: string[], // A list of ingress keys that the participant has been detected in.
    }
    */
    console.log('Updating participant data');
    let participantCodes = metadataItem.participantCodes;
    await Promise.all(participantCodes.map(async code => {
        let participantData = await ctx.ddb.getItem({
            TableName: ctx.metadataTable,
            Key: { participantCode: { N: code.toString() } }
        }).promise();
        let ingressKeys = participantData?.Item?.ingressKeys as string[] || [] as string[];
        ingressKeys.push(metadataItem.ingressKey);
        await ctx.ddb.putItem({
            TableName: ctx.metadataTable,
            Item: {
                participantCode: { N: code.toString() },
                ingressKeys: { SS: ingressKeys },
            }
        }).promise();
    }));
    


    console.log('Finishing up')
    return {
        success: true,
        message: 'Image processed successfully',
        data: {
            sizes: sizes.map(size => {
                return `${size.name}: ${size.size}px`;
            }),
            processedImages: imageSizes,
        }
    }
    

}


interface GenerateImageSizeContext {
    s3: AWS.S3;
    ingressMediaKey: string;
    ingressMediaData: Buffer;
    processedBucket: string;
    size: number; // Max width & height in px.
    sizeName: string; // E.g. 'thumbnail', 'fullsize', etc.
}
// This function will generate a new image with the specified size, upload it to the processed bucket, and return the key.
async function generateImageSize(ctx: GenerateImageSizeContext): Promise<string> {
    // Do the image resizing here.
    // Return the new image data.
    let ibuffer = sharp(ctx.ingressMediaData).resize(ctx.size, ctx.size).png({quality: 80}).toBuffer();
    // Upload the new image to the processed bucket.
    let keyWithoutExtension = ctx.ingressMediaKey.split('.').slice(0, -1).join('.');
    let key = `${keyWithoutExtension}-${ctx.sizeName}.png`;
    let params = {
        Bucket: ctx.processedBucket,
        Key: key,
        Body: await ibuffer,
    };
    await ctx.s3.putObject(params).promise();
    return key;
}

interface GetParticipantCodesContext {
    ibuffer: Buffer;
}
async function getParticipantCodes(ctx: GetParticipantCodesContext): Promise<number[]> {
    // Do the OCR here.
    // Return the participant codes.
    return [1,2,3,4,5];
}