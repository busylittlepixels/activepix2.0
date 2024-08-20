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
  env: env,
  subdomain: 'testServiceAdmin'
}
// new ServiceAdminStack(app, 'APAWS-SA', serviceAdminProps);
new EventInstanceStack(app, 'APAWS-EI-TEST', {
  name: 'APAWSEI-TEST',
  subdomain: 'test',
  env: env
});
new EventInstanceStack(app, 'APAWS-EI-TEST1', {
  name: 'APAWSEI-TEST1',
  subdomain: 'test1',
  env: env
});
new EventInstanceStack(app, 'APAWS-EI-TEST2', {
  name: 'APAWSEI-TEST2',
  subdomain: 'test2',
  env: env
});
new EventInstanceStack(app, 'APAWS-EI-TEST3', {
  name: 'APAWSEI-TEST3',
  subdomain: 'test3',
  env: env
});

new EventInstanceStack(app, 'APAWS-EI-STAGING', {
  name: 'APAWSEI-STAGING',
  subdomain: 'staging',
  env: env
});

//Set up runclare

new EventInstanceStack(app, 'APAWS-EI-RUNCLARE', {
  name: 'APAWSEI-RUNCLARE',
  subdomain: 'runclare',
  env: env
});