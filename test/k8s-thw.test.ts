import * as cdk from 'aws-cdk-lib';
import {Template} from 'aws-cdk-lib/assertions';
import * as K8SThw from '../lib/k8s-the-hard-way-stack';

test('Created correct amount of resources', () => {
  const app = new cdk.App();
  const stack = new K8SThw.K8sTheHardWayStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::EC2::Instance', 1 + 3);
  template.resourceCountIs('AWS::EC2::VPC', 1);
});
