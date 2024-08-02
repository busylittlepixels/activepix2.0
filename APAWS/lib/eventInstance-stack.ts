import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { LBPayloadCMS } from './Constructs/LBPayloadCMS';
import * as ecrAssets from 'aws-cdk-lib/aws-ecr-assets';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import { LBSveltekit } from './Constructs/LBSveltekit';
export interface EventInstanceStackProps extends cdk.StackProps {
  // Define construct properties here
  name: string;
  vpc?: ec2.Vpc;
}

export class EventInstanceStack extends cdk.Stack {
  readonly payloadCMSImage: ecrAssets.DockerImageAsset;
  readonly cluster: ecs.Cluster;
  readonly EventInstanceCMS: LBPayloadCMS;
  readonly EventInstanceGallery: LBSveltekit;
  readonly EventInstanceAdmin: LBSveltekit;
  constructor(scope: Construct, id: string, props: EventInstanceStackProps) {
    super(scope, id, props);
    const namepfx = `ei-${props.name}-`

    //Use the default VPC if one is not provided
    if (!props.vpc) {
      props.vpc = ec2.Vpc.fromLookup(this, 'DefaultVPC', {
        isDefault: true,
      }) as ec2.Vpc;
    }

    //Create a payloadCMS docker image asset from the ./eventInstance/event-cms directory
    this.payloadCMSImage = new ecrAssets.DockerImageAsset(this, 'PayloadCMSImage', {
      directory: './lib/eventInstance/event-cms',
      assetName: namepfx + 'PayloadCMSImage',
    });

    //Create a new ECS cluster for this EventInstance
    this.cluster = new ecs.Cluster(this, namepfx + 'Cluster', {
      vpc: props.vpc,
      clusterName: namepfx + 'Cluster',
    });
    
    // Create the Loadbalanced PayloadCMS construct
    this.EventInstanceCMS = new LBPayloadCMS(this, namepfx + 'LBPayloadCMS', {
      containerImage: this.payloadCMSImage.imageUri,
      name: namepfx,
      vpc: props.vpc,
      cluster: this.cluster,
      tags: {
        'eventname': props.name,
      },
      bucketProps: {
        bucketName: namepfx.toLowerCase() + 'payload-cms-bucket',
      }
    });

    //Create the gallery docker image asset from the ./eventInstance/galleryContainerImage directory
    const galleryImage = new ecrAssets.DockerImageAsset(this, 'GalleryImage', {
      directory: './lib/eventInstance/galleryContainerImage',
      assetName: namepfx + 'GalleryImage',
    });

    //Create the LBSveltekit construct for the gallery
    this.EventInstanceGallery = new LBSveltekit(this, namepfx + 'Gallery', {
      containerImage: galleryImage.imageUri,
      name: namepfx,
      vpc: props.vpc,
      cluster: this.cluster,
      tags: {
        'eventname': props.name,
      },
    });

    //Create the admin docker image asset from the ./eventInstance/eventAdminPanel directory
    const adminImage = new ecrAssets.DockerImageAsset(this, 'AdminImage', {
      directory: './lib/eventInstance/eventAdminPanel',
      assetName: namepfx + 'AdminImage',
    });

    //Create the LBSveltekit construct for the admin panel
    this.EventInstanceAdmin = new LBSveltekit(this, namepfx + 'Admin', {
      containerImage: adminImage.imageUri,
      name: namepfx,
      vpc: props.vpc,
      cluster: this.cluster,
      tags: {
        'eventname': props.name,
      },
    });
    
    //Output the URL of the EventInstanceAdmin service
    new cdk.CfnOutput(this, namepfx + 'AdminURL', {
      value: 'http://' + this.EventInstanceAdmin.loadBalancer.loadBalancerDnsName,
      description: 'The URL of the Admin service',
    });
    

    //Output the URL of the gallery service
    new cdk.CfnOutput(this, namepfx + 'GalleryURL', {
      value: 'http://' + this.EventInstanceGallery.loadBalancer.loadBalancerDnsName,
      description: 'The URL of the Gallery service',
    });

    //Output the URL of the PayloadCMS service
    new cdk.CfnOutput(this, namepfx + 'PayloadCMSURL', {
      value: 'http://' + this.EventInstanceCMS.loadBalancer.loadBalancerDnsName,
      description: 'The URL of the PayloadCMS service',
    });

    
    /**
 * LProcessImage - Lambda function that processes images uploaded to MediaIngress bucket, outputting to ProcessedMedia bucket.
    - Scans the images for participant codes.
    - Applies any overlays to the image
    - Creates a max 2000x2000 variant of the image and uploads it to the ProcessedMedia bucket.
    - Creates a max 500x500 variant of the image and uploads it to the ProcessedMedia bucket.
    - Creates an entry in the ProcessedImageMetadata table for each image containing:
    - - Detected participant codes
    - - Thumbnail URL
    - - Fullsize URL

    Notes from CDK:
    environment: {
        MEDIA_BUCKET: MediaIngressBucket.bucketName,
        PROCESSED_BUCKET: ProcessedBucket.bucketName,
        METADATA_TABLE: ProcessedImageMetadataTable.tableName
    },
 */

    //Create buckets
    const MediaIngressBucket = new s3.Bucket(this, namepfx + 'MediaIngressBucket', {
      bucketName: namepfx.toLowerCase() + 'media-ingress-bucket',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const ProcessedBucket = new s3.Bucket(this, namepfx + 'ProcessedBucket', {
      bucketName: namepfx.toLowerCase() + 'processed-bucket',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    //Create DynamoDB tables
    const ProcessedImageMetadataTable = new ddb.Table(this, namepfx + 'ProcessedImageMetadataTable', {
      partitionKey: { name: 'ingressKey', type: ddb.AttributeType.STRING },
      tableName: namepfx.toLowerCase() + 'processed-image-metadata-table',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const ParticipantMetadataTable = new ddb.Table(this, namepfx + 'ParticipantMetadataTable', {
      partitionKey: { name: 'participantCode', type: ddb.AttributeType.NUMBER },
      tableName: namepfx.toLowerCase() + 'participant-metadata-table',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });


    //Create LProcessImage Lambda function
    const LProcessImage = new lambda.Function(this, namepfx + 'LProcessImage', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('./lib/eventInstance/Lambdas/LProcessMedia'),
      environment: {
        MEDIA_BUCKET: MediaIngressBucket.bucketName,
        PROCESSED_BUCKET: ProcessedBucket.bucketName,
        PARTICIPANT_METADATA_TABLE: ParticipantMetadataTable.tableName,
        IMAGE_METADATA_TABLE: ProcessedImageMetadataTable.tableName,
      },
      timeout: cdk.Duration.seconds(45),
      memorySize: 512,
    })

    //Grant the Lambda function read on the MediaIngressBucket
    //Grant the Lambda function write on the ProcessedBucket
    MediaIngressBucket.grantRead(LProcessImage);
    ProcessedBucket.grantWrite(LProcessImage);

    //Grant the Lambda function read/write on the ProcessedImageMetadataTable
    ProcessedImageMetadataTable.grantReadWriteData(LProcessImage);
    //Grant the Lambda function read/write on the ParticipantMetadataTable
    ParticipantMetadataTable.grantReadWriteData(LProcessImage);

    //Create a trigger for the Lambda function
    MediaIngressBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(LProcessImage));


    //Create LGetMediaForParticipant Lambda function
    const LGetMediaForParticipant = new lambda.Function(this, namepfx + 'LGetMediaForParticipant', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('./lib/eventInstance/Lambdas/LGetMediaForParticipant'),
      environment: {
        MEDIA_BUCKET: MediaIngressBucket.bucketName,
        PROCESSED_BUCKET: ProcessedBucket.bucketName,
        PARTICIPANT_METADATA_TABLE: ParticipantMetadataTable.tableName,
        IMAGE_METADATA_TABLE: ProcessedImageMetadataTable.tableName,
      },
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
    })

    //Grant the Lambda function read on the ParticipantMetadataTable
    //Grant the Lambda function read on the ProcessedImageMetadataTable
    ParticipantMetadataTable.grantReadData(LGetMediaForParticipant);
    ProcessedImageMetadataTable.grantReadData(LGetMediaForParticipant);
  }
}
