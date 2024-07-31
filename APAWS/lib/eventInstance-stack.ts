import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { LBPayloadCMS } from './Constructs/LBPayloadCMS';
import * as ecrAssets from 'aws-cdk-lib/aws-ecr-assets';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';

export interface EventInstanceStackProps extends cdk.StackProps {
  // Define construct properties here
  name: string;
  vpc?: ec2.Vpc;
  
}

export class EventInstanceStack extends cdk.Stack {
  readonly payloadCMSImage: ecrAssets.DockerImageAsset;
  readonly cluster: ecs.Cluster;
  readonly EventInstanceCMS: LBPayloadCMS;
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
    });

    // Output the LoadBalancer DNS name
    new cdk.CfnOutput(this, namepfx + 'LoadBalancerDNS', {
      value: this.EventInstanceCMS.loadBalancer.loadBalancerDnsName,
      description: 'The DNS name of the LoadBalancer',
    });
    
    // Output the LoadBalancer URL
    new cdk.CfnOutput(this, namepfx + 'LoadBalancerURL', {
      value: 'http://' + this.EventInstanceCMS.loadBalancer.loadBalancerDnsName,
      description: 'The URL of the LoadBalancer',
    });
  }
}
