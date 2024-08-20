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
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { LBSveltekit } from './Constructs/LBSveltekit';
import { EventInstanceProcessingStack } from './eiProcessing-stack';
import path = require('path');
export interface EventInstanceStackProps extends cdk.StackProps {
  // Define construct properties here
  name: string;
  subdomain: string;
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
    const namepfx = `${props.name}-`

    //Use the default VPC if one is not provided
    if (!props.vpc) {
      props.vpc = ec2.Vpc.fromLookup(this, 'DefaultVPC', {
        isDefault: true,
      }) as ec2.Vpc;
    }

    //Create buckets for media ingress and processed media
    const MediaIngressBucket = new s3.Bucket(this, namepfx + 'MediaIngressBucket', {
      bucketName: namepfx.toLowerCase() + 'media-ingress-bucket',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      autoDeleteObjects: true,
      cors: [  // Add CORS configuration here
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST, s3.HttpMethods.DELETE, s3.HttpMethods.HEAD],
          allowedOrigins: ['*'],  // Allow any origin
          allowedHeaders: ['*'],  // Allow any headers
          exposedHeaders: ['ETag'],  // Expose specific headers
          maxAge: 3000,  // Cache duration in seconds
        },
      ],
    });
    const ProcessedBucket = new s3.Bucket(this, namepfx + 'ProcessedBucket', {
      bucketName: namepfx.toLowerCase() + 'processed-bucket',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: true,  // Allow public read access at bucket creation
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,  // Optionally configure block public access settings
    });
    
    // Manually add a policy if needed
    ProcessedBucket.addToResourcePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['s3:GetObject'],
      resources: [`${ProcessedBucket.bucketArn}/*`],
      principals: [new iam.ArnPrincipal('*')],
    }));


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

    //Get the hosted zone for the domain
    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'races.activepix.com',
    });

    //Create a certificate for the subdomains
    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName: `${props.subdomain}.races.activepix.com`,
      subjectAlternativeNames: [
        `cms.${props.subdomain}.races.activepix.com`,
        `admin.${props.subdomain}.races.activepix.com`,
        `ingress.${props.subdomain}.races.activepix.com`,
      ],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });
    
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

    

    

    //Create an API Gateway for the LGetMediaForParticipant Lambda function
    const api = new cdk.aws_apigateway.LambdaRestApi(this, namepfx + 'ParticipantAPI', {
      handler: LGetMediaForParticipant,
      proxy: false,
    });

    //Create a resource for the API Gateway
    const participant = api.root.addResource('forParticipant');
    participant.addMethod('POST');

    // Define IAM Role for PayloadCMS ECS Task
    const payloadCMSTaskRole = new iam.Role(this, namepfx + 'ECSTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'Role that the ECS tasks use to interact with AWS services',
    });

    // Attach S3 permissions to the role

    // Create the Loadbalanced PayloadCMS construct
    this.EventInstanceCMS = new LBPayloadCMS(this, namepfx + 'LBPayloadCMS', {
      containerImage: this.payloadCMSImage.imageUri,
      name: namepfx,
      vpc: props.vpc,
      cluster: this.cluster,
      mediaIngressBucket: MediaIngressBucket,
      tags: {
        'eventname': props.name,
      },
      bucketProps: {
        bucketName: namepfx.toLowerCase() + 'payload-cms-bucket',
      },
      environment: {
        "PUBLIC_GALLERY_DOMAIN": `${props.subdomain}.${hostedZone.zoneName}`,
        "PUBLIC_ADMIN_DOMAIN": `admin.${props.subdomain}.${hostedZone.zoneName}`,
        "PUBLIC_CMS_DOMAIN": `cms.${props.subdomain}.${hostedZone.zoneName}`,
        "PUBLIC_INGRESS_DOMAIN": MediaIngressBucket.bucketDomainName,
        "PUBLIC_API_DOMAIN": api.url,
      },
      certificate
    });

    //Create a subdomain for the PayloadCMS service
    const cmsSubdomain = new route53.ARecord(this, 'CMSSubdomain', {
      zone: hostedZone,
      recordName: `cms.${props.subdomain}`,
      target: route53.RecordTarget.fromAlias(new route53Targets.LoadBalancerTarget(this.EventInstanceCMS.loadBalancer)),
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
      certificate,
      environment: {
        "PUBLIC_GALLERY_DOMAIN": `${props.subdomain}.${hostedZone.zoneName}`,
        "PUBLIC_ADMIN_DOMAIN": `admin.${props.subdomain}.${hostedZone.zoneName}`,
        "PUBLIC_CMS_DOMAIN": `cms.${props.subdomain}.${hostedZone.zoneName}`,
        "PUBLIC_INGRESS_DOMAIN": MediaIngressBucket.bucketDomainName,
        "PUBLIC_API_DOMAIN": api.url,
      }
    });

    //Create a subdomain for the gallery
    const eventSubdomain = new route53.ARecord(this, 'EventSubdomain', {
      zone: hostedZone,
      recordName: `${props.subdomain}`,
      target: route53.RecordTarget.fromAlias(new route53Targets.LoadBalancerTarget(this.EventInstanceGallery.loadBalancer)),
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
      certificate,
      environment: {
        "PUBLIC_GALLERY_DOMAIN": `${props.subdomain}.${hostedZone.zoneName}`,
        "PUBLIC_ADMIN_DOMAIN": `admin.${props.subdomain}.${hostedZone.zoneName}`,
        "PUBLIC_CMS_DOMAIN": `cms.${props.subdomain}.${hostedZone.zoneName}`,
        "PUBLIC_INGRESS_DOMAIN": MediaIngressBucket.bucketDomainName,
        "PUBLIC_API_DOMAIN": api.url,
      }
    });

    //Create a subdomain for the admin panel
    const adminSubdomain = new route53.ARecord(this, 'AdminSubdomain', {
      zone: hostedZone,
      recordName: `admin.${props.subdomain}`,
      target: route53.RecordTarget.fromAlias(new route53Targets.LoadBalancerTarget(this.EventInstanceAdmin.loadBalancer)),
    });


    //Provision SSL certificates for the subdomains
    

    //Output the domain of the Gallery service
    new cdk.CfnOutput(this, namepfx + 'GalleryDomain', {
      value: `${props.subdomain}.races.activepix.com`,
      description: 'The domain of the Gallery service',
    });

    //Output the domain of the Admin service
    new cdk.CfnOutput(this, namepfx + 'AdminDomain', {
      value: `admin.${props.subdomain}.races.activepix.com`,
      description: 'The domain of the Admin service',
    });

    //Output the domain of the PayloadCMS service
    new cdk.CfnOutput(this, namepfx + 'PayloadCMSDomain', {
      value: `cms.${props.subdomain}.races.activepix.com`,
      description: 'The domain of the PayloadCMS service',
    });


    

    // Add a bucket policy to allow public write access to the MediaIngressBucket
    MediaIngressBucket.addToResourcePolicy(new cdk.aws_iam.PolicyStatement({
      effect: cdk.aws_iam.Effect.ALLOW,
      actions: ['s3:PutObject'],
      resources: [`${MediaIngressBucket.bucketArn}/*`],
      principals: [new cdk.aws_iam.AnyPrincipal()],
    }));
    

    //Create the OpenCV2 Lambda Layer from the eventInstance/LambdaLayers/opencv-python-headless-4.5.5.62.zip file
    // const opencvLayer = new lambda.LayerVersion(this, namepfx + 'OpenCVLayer', {
    //   code: lambda.Code.fromAsset('./lib/eventInstance/LambdaLayers/opencv-python-headless-4.5.5.62.zip'),
    //   compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
    //   description: 'OpenCV2 Lambda Layer',
    // });


    //Create LProcessImage Lambda function
    // const LProcessImage = new lambda.Function(this, namepfx + 'LProcessImage', {
    //   runtime: lambda.Runtime.NODEJS_20_X,
    //   handler: 'index.handler',
    //   code: lambda.Code.fromAsset('./lib/eventInstance/Lambdas/LProcessMedia'),
    //   environment: {
    //     MEDIA_BUCKET: MediaIngressBucket.bucketName,
    //     PROCESSED_BUCKET: ProcessedBucket.bucketName,
    //     PARTICIPANT_METADATA_TABLE: ParticipantMetadataTable.tableName,
    //     IMAGE_METADATA_TABLE: ProcessedImageMetadataTable.tableName,
    //   },
    //   timeout: cdk.Duration.seconds(60),
    //   memorySize: 2048,
    //   // layers: [opencvLayer],
    // })

    

    // //Grant the Lambda function read on the MediaIngressBucket
    // //Grant the Lambda function write on the ProcessedBucket
    // MediaIngressBucket.grantRead(LProcessImage);
    // ProcessedBucket.grantWrite(LProcessImage);

    // //Grant the Lambda function read/write on the ProcessedImageMetadataTable
    // ProcessedImageMetadataTable.grantReadWriteData(LProcessImage);
    // //Grant the Lambda function read/write on the ParticipantMetadataTable
    // ParticipantMetadataTable.grantReadWriteData(LProcessImage);

    // //Create a trigger for the Lambda function
    // MediaIngressBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(LProcessImage));


    

    //Output the URL of the Participant API
    new cdk.CfnOutput(this, namepfx + 'ParticipantAPIURL', {
      value: api.url,
      description: 'The URL of the Participant API',
    });

  
   
    
    //Output the url of the MediaIngressBucket
    new cdk.CfnOutput(this, namepfx + 'MediaIngressBucketURL', {
      value: `http://${MediaIngressBucket.bucketDomainName}`,
      description: 'The URL of the Media Ingress Bucket',
    });


    //PROCESSING!
    // Create an SQS queue for image processing tasks
    // TODO: Configure a dead-letter queue for handling failed tasks. At the moment the ProcessorContainer will just drop the message on receipt.
    const imageProcessingQueue = new sqs.Queue(this, 'ImageProcessingQueue', {
      visibilityTimeout: cdk.Duration.minutes(15),
    });
    //New lambda for queuing instead
    const queueMediaIngressForProcessing = new lambda.Function(this, 'QueueMediaIngressForProcessing', {
      // functionName: 'QueueMediaIngressForProcessing',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'eiProcessing/LQueueMediaIngressForProcessing')),
      environment: {
          MEDIA_BUCKET: MediaIngressBucket.bucketName,
          PROCESSED_BUCKET: ProcessedBucket.bucketName,
          IMAGE_METADATA_TABLE: ProcessedImageMetadataTable.tableName,
          PARTICIPANT_METADATA_TABLE: ParticipantMetadataTable.tableName,
          SQS_QUEUE_URL: imageProcessingQueue.queueUrl,
      },
    });
    // Grant the Lambda function permissions to send messages to the SQS queue
    imageProcessingQueue.grantSendMessages(queueMediaIngressForProcessing);

    // Ensure the Lambda function is created before the notification is added
    queueMediaIngressForProcessing.node.addDependency(imageProcessingQueue);
    
    // Add S3 event notification to trigger the Lambda function
    MediaIngressBucket.addEventNotification(
        s3.EventType.OBJECT_CREATED,
        new s3n.LambdaDestination(queueMediaIngressForProcessing)
    );
    
    //Create role for processor
    const processorRole = new iam.Role(this, 'ProcessorRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });
    processorRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'));
    //Allow logging to CloudWatch
    processorRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess'));
    // Grant the ECS task permissions to access S3 and DynamoDB
    MediaIngressBucket.grantReadWrite(processorRole);
    ProcessedBucket.grantReadWrite(processorRole);
    ProcessedImageMetadataTable.grantReadWriteData(processorRole);
    ParticipantMetadataTable.grantReadWriteData(processorRole);

    // Grant the ECS task permissions to read from SQS
    imageProcessingQueue.grantConsumeMessages(processorRole);

    // Create an ECR asset for the Docker image
    const processorImage = new ecrAssets.DockerImageAsset(this, 'ProcessorImage', {
      directory: path.join(__dirname, 'eiProcessing/ProcessorContainer'),
    });

    const processorSecurityGroup = new ec2.SecurityGroup(this, 'ProcessorSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for the ECS Fargate processor service',
    });

    //Allow access to ECR
    processorSecurityGroup.addIngressRule(ec2.Peer.ipv4(props.vpc.vpcCidrBlock), ec2.Port.tcp(443));

    // Define a task definition for ECS Fargate
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
        memoryLimitMiB: 4096,  // Adjust memory limit as needed
        cpu: 2048,  // Adjust CPU units as needed
        taskRole: processorRole,
        executionRole: processorRole,
    });

    const container = taskDefinition.addContainer('ProcessorContainer', {
        image: ecs.ContainerImage.fromDockerImageAsset(processorImage),
        memoryReservationMiB: 2048,
        cpu: 1024,
        environment: {
            MEDIA_BUCKET: MediaIngressBucket.bucketName,
            PROCESSED_BUCKET: ProcessedBucket.bucketName,
            METADATA_TABLE: ProcessedImageMetadataTable.tableName,
            PARTICIPANT_TABLE: ParticipantMetadataTable.tableName,
            SQS_QUEUE_URL: imageProcessingQueue.queueUrl,
        },
        // healthCheck: {
        //     command: ['CMD-SHELL', 'pgrep -f "node" || exit 1'],
        //     interval: cdk.Duration.seconds(10),
        //     timeout: cdk.Duration.seconds(5),
        //     retries: 3,
        //     startPeriod: cdk.Duration.seconds(20),
        // },
        logging: new ecs.AwsLogDriver({
            streamPrefix: namepfx+'ProcessorTask',
            
        }),
    });

    container.addPortMappings({
        containerPort: 80,
    });

    // Define an ECS Fargate service using the provided cluster
    const service = new ecs.FargateService(this, 'ProcessorService', {
        cluster: this.cluster,
        taskDefinition,
        desiredCount: 1,
        assignPublicIp: true,
        securityGroups: [processorSecurityGroup],
    });

    // Auto scaling based on CPU utilization
    const scaling = service.autoScaleTaskCount({
        minCapacity: 1,
        maxCapacity: 10,
    });

    scaling.scaleOnCpuUtilization('ProcessorServiceCpuScaling', {
        targetUtilizationPercent: 50,
    });
  }
}
