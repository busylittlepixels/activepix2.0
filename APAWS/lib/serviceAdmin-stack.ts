import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { EventInstanceStack } from './eventInstance-stack';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface ServiceAdminStackProps extends cdk.StackProps {

}
export class ServiceAdminStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, 'APAWS_VPC', {
      maxAzs: 2
    });
    
    const eventInstanceProps = {
      name: 'APAWS_TEST_EVENT_INSTANCE',
      vpc: vpc
    }
    const stack = new EventInstanceStack(this, eventInstanceProps.name, eventInstanceProps);
    
    new cdk.CfnOutput(this, 'TestStackDNSName', {
      value: stack.EventInstanceCMS.loadBalancer.loadBalancerDnsName,
      description: 'The DNS name of the Test Stack LoadBalancer',
    });

    new cdk.CfnOutput(this, 'TestStackURL', {
      value: 'http://' + stack.EventInstanceCMS.loadBalancer.loadBalancerDnsName,
      description: 'The URL of the Test Stack LoadBalancer',
    });
  }
}
