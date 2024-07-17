#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {config} from 'dotenv';
import 'source-map-support/register';
import {K8sTheHardWayStack} from '../lib/k8s-the-hard-way-stack';

const app = new cdk.App();

config();

new K8sTheHardWayStack(app, 'K8sTheHardWayStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
