#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EventInstanceStack } from '../lib/eventInstance-stack';
import { ServiceAdminStack, ServiceAdminStackProps } from '../lib/serviceAdmin-stack';
import { Service } from 'aws-cdk-lib/aws-servicediscovery';
import { Vpc } from 'aws-cdk-lib/aws-ec2';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT, // or a specific account id
  region: process.env.CDK_DEFAULT_REGION // or a specific region, e.g., 'us-east-1'
};
const serviceAdminProps:ServiceAdminStackProps = {
  env: env
}
// new ServiceAdminStack(app, 'APAWS-SA', serviceAdminProps);
new EventInstanceStack(app, 'APAWS-EI-TEST', {
  name: 'APAWSEI-test',
  env: env
});