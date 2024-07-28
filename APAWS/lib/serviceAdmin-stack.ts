import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface ServiceAdminStackProps extends cdk.StackProps {

}
export class ServiceAdminStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'ApawsQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
