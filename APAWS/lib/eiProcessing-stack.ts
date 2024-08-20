import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as path from 'path';
import * as ecrAssets from 'aws-cdk-lib/aws-ecr-assets';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface EventInstanceProcessingStackProps extends cdk.StackProps {
    vpc: ec2.IVpc;
    processorRole: iam.IRole;
    cluster: ecs.ICluster;
    imageProcessingQueue: sqs.IQueue;
    mediaIngressBucket: s3.IBucket;
    processedMediaBucket: s3.IBucket;
    processedImageMetadataTable: dynamodb.ITable;
    participantMetadataTable: dynamodb.ITable;
}

export class EventInstanceProcessingStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: EventInstanceProcessingStackProps) {
        super(scope, id, props);

        

        

        

        // Define the Lambda function that pushes S3 events to the SQS queue
        

        

        
    }
}
