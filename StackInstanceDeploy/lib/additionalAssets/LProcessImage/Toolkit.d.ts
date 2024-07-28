import * as AWS from 'aws-sdk';
interface BasicContext {
    s3: AWS.S3;
    ddb: AWS.DynamoDB;
    processedBucket: string;
    ingressBucket: string;
    metadataTable: string;
    participantTable: string;
}
interface ProcessImageContext extends BasicContext {
    ingressKey: string;
}
type ProcessImageFailure = {
    success: false;
    message: string;
    data?: any;
};
type ProcessImageSuccess = {
    success: true;
    message: string;
    data?: any;
};
type ProcessImageResult = ProcessImageFailure | ProcessImageSuccess;
export declare function processImage(ctx: ProcessImageContext): Promise<ProcessImageResult>;
export {};
