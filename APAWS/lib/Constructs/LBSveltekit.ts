import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as docdb from 'aws-cdk-lib/aws-docdb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface LBSveltekitProps extends cdk.StackProps {
  containerImage: string;
  name: string;
  tags?: { [key: string]: string };
  vpc?: ec2.Vpc;
  cluster?: ecs.Cluster;
  taskMemoryLimitMiB?: number;
  taskCpuUnits?: number;
  containerPort?: number;
  desiredCount?: number;
}

export class LBSveltekit extends Construct {
  public readonly cluster: ecs.Cluster;
  public readonly service: ecs.FargateService;
  public readonly loadBalancer: elbv2.ApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props: LBSveltekitProps) {
    super(scope, id);

    const {
      vpc,
      cluster,
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

    // Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, `${name}TaskDef`, {
      memoryLimitMiB: taskMemoryLimitMiB,
      cpu: taskCpuUnits,
      executionRole: executionRole,
    });
    const container = taskDefinition.addContainer(`${name}Container`, {
      image: ecs.ContainerImage.fromRegistry(containerImage),
      memoryLimitMiB: taskMemoryLimitMiB,
      cpu: taskCpuUnits,
      logging: new ecs.AwsLogDriver({ streamPrefix: name }),
      environment: {
        PORT: '80',
        NODE_ENV: 'production',
      },
    });

    container.addPortMappings({
      containerPort: containerPort,
    });

    // Fargate Service
    this.service = new ecs.FargateService(this, `${name}Service`, {
      cluster: this.cluster,
      taskDefinition: taskDefinition,
      desiredCount: desiredCount,
      healthCheckGracePeriod: cdk.Duration.seconds(30),
      assignPublicIp: true, // while debugging
    });

    // Load Balancer
    this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, `${name}Loadbalancer`, {
      vpc: vpcInstance,
      internetFacing: true,
    });

    const listener = this.loadBalancer.addListener(`${name}PublicListener`, {
      port: 80,
      open: true,
    });

    listener.addTargets(`${name}ECS`, {
      port: 80,
      targets: [this.service],
      healthCheck: {
        path: "/api/health",
        interval: cdk.Duration.seconds(25),
        timeout: cdk.Duration.seconds(20),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 2,
        healthyHttpCodes: '200-399',
      },
    });
  }
}