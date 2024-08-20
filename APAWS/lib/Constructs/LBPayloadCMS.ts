import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as docdb from 'aws-cdk-lib/aws-docdb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

interface LBPayloadCMSProps extends cdk.StackProps {
  containerImage: string;
  name: string;
  tags?: { [key: string]: string };
  vpc: ec2.Vpc;
  cluster?: ecs.Cluster;
  bucketProps?: s3.BucketProps;
  taskMemoryLimitMiB?: number;
  taskCpuUnits?: number;
  containerPort?: number;
  desiredCount?: number;
  certificate: acm.ICertificate;
  mediaIngressBucket?: s3.Bucket;
  processedBucket?: s3.Bucket;
  environment?: { [key: string]: string };
}

export class LBPayloadCMS extends Construct {
  public readonly bucket: s3.Bucket;
  public readonly cluster: ecs.Cluster;
  public readonly service: ecs.FargateService;
  public readonly loadBalancer: elbv2.ApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props: LBPayloadCMSProps) {
    super(scope, id);

    const {
      vpc,
      cluster,
      bucketProps,
      containerImage,
      name,
      tags,
      taskMemoryLimitMiB = 2048,
      taskCpuUnits = 1024,
      containerPort = 80,
      desiredCount = 1,
    } = props;

    // Apply tags to all resources
    if (tags) {
      for (const [key, value] of Object.entries(tags)) {
        cdk.Tags.of(this).add(key, value);
      }
    }

    // S3 Bucket
    this.bucket = new s3.Bucket(this, `${name}PayloadCMSBucket`, {
      ...bucketProps,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    // VPC
    const vpcInstance = vpc ?? new ec2.Vpc(this, `${name}PayloadCMSVpc`, { maxAzs: 2 });

    // ECS Cluster
    this.cluster = cluster ?? new ecs.Cluster(this, `${name}PayloadCMSCluster`, {
      vpc: vpcInstance,
    });

    const executionRole = new iam.Role(this, `${name}ExecutionRole`, {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess'),
      ],
    });

    // Allow payload to access mediaIngressBucket
    if(props.mediaIngressBucket) {
      executionRole.addToPolicy(new iam.PolicyStatement({
        actions: [
          's3:GetObject',
          's3:PutObject',
          's3:ListBucket'
        ],
        resources: [
          props.mediaIngressBucket.bucketArn,
          `${props.mediaIngressBucket.bucketArn}/*`,
        ]
      }));
    }
    // Allow payload to access processedBucket
    if(props.processedBucket) {
      executionRole.addToPolicy(new iam.PolicyStatement({
        actions: [
          's3:GetObject',
          's3:PutObject',
          's3:ListBucket'
        ],
        resources: [
          props.processedBucket.bucketArn,
          `${props.processedBucket.bucketArn}/*`,
        ]
      }));
    }
    
    // DocumentDB to replace MongoDB
    const dbUsername = 'ddbadmin';
    const dbPassword = name + "dbadmin";

    const documentDB = new docdb.DatabaseCluster(this, 'DocumentDB', {
      vpc: vpcInstance,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MEDIUM),
      masterUser: {
        username: dbUsername,
        password: new cdk.SecretValue(dbPassword),
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Security Group for ECS tasks
    const ecsSecurityGroup = new ec2.SecurityGroup(this, 'EcsSecurityGroup', {
      vpc: vpcInstance,
      description: 'Allow ECS tasks to access DocumentDB',
    });

    // Allow ECS tasks to communicate with DocumentDB
    documentDB.connections.allowDefaultPortFrom(ecsSecurityGroup, 'Allow ECS to DocumentDB');

    // Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, `${name}PayloadCMSTaskDef`, {
      memoryLimitMiB: taskMemoryLimitMiB,
      cpu: taskCpuUnits,
      executionRole: executionRole,
    });

    if (props.mediaIngressBucket) {
      const s3PolicyStatement = new iam.PolicyStatement({
        actions: [
          's3:GetObject',
          's3:PutObject',
          's3:ListBucket',
          's3:GetBucketLocation',
          's3:GetObjectAcl',
        ],
        resources: [
          props.mediaIngressBucket.bucketArn,
          `${props.mediaIngressBucket.bucketArn}/*`,
        ],
      });
    
      // Adding the policy to the task role
      taskDefinition.taskRole.addToPrincipalPolicy(s3PolicyStatement);
    }

    
    const uri = 'mongodb://' + dbUsername + ':' + dbPassword + '@' + documentDB.clusterEndpoint.hostname + ':' + documentDB.clusterEndpoint.port + '/?tls=true&tlsCAFile=global-bundle.pem&replicaSet=rs0&retryWrites=false';


    const environment = {
      DATABASE_URI: uri,
      S3_BUCKET: this.bucket.bucketName,
      INGRESS_S3_BUCKET: props.mediaIngressBucket ? props.mediaIngressBucket.bucketName : '',
      PAYLOAD_SECRET: name + "-b53006edc",
      ...props.environment,
    }
    const container = taskDefinition.addContainer(`${name}PayloadCMSContainer`, {
      image: ecs.ContainerImage.fromRegistry(containerImage),
      memoryLimitMiB: taskMemoryLimitMiB,
      cpu: taskCpuUnits,
      logging: new ecs.AwsLogDriver({ streamPrefix: name + 'PayloadCMSContainer' }),
      environment: environment,
    });

    container.addPortMappings({
      containerPort: containerPort,
    });

    // Fargate Service
    this.service = new ecs.FargateService(this, `${name}PayloadCMSService`, {
      cluster: this.cluster,
      taskDefinition: taskDefinition,
      desiredCount: desiredCount,
      healthCheckGracePeriod: cdk.Duration.seconds(10),
      assignPublicIp: true, // while debugging
      securityGroups: [ecsSecurityGroup],
    });

    // Load Balancer
    this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, `${name}PayloadCMSLB`, {
      vpc: vpcInstance,
      internetFacing: true,
    });

    const httpsListener = this.loadBalancer.addListener(`${name}PayloadCMSHttpsListener`, {
      port: 443,
      open: true,
      certificates: [props.certificate],
    });
    
    //Redirect HTTP to HTTPS
    this.loadBalancer.addListener(`${name}PayloadCMSHttpListener`, {
      port: 80,
      open: true,
      defaultAction: elbv2.ListenerAction.redirect({
        protocol: 'HTTPS',
        port: '443',
        permanent: true,
      }),
    })

    httpsListener.addTargets(`${name}ECS`, {
      port: 80,
      targets: [this.service],
      healthCheck: {
        path: "/api/health",
        interval: cdk.Duration.seconds(10),
        timeout: cdk.Duration.seconds(9),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 2,
        healthyHttpCodes: '200-399',
      },
    });

    // Grant permissions
    this.bucket.grantReadWrite(this.service.taskDefinition.taskRole);
  }
}