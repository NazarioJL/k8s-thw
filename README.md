# k8s-thw

## What's this?

This is a project to setup the required infrastructure to run [Kubernetes The Hard Way](https://github.com/kelseyhightower/kubernetes-the-hard-way) in the AWS cloud.

## EC2 Instance types

This will provision EC2 instance types to match the [tutorial specs](https://github.com/kelseyhightower/kubernetes-the-hard-way/blob/master/docs/01-prerequisites.md). This will provision [t4](https://aws.amazon.com/ec2/instance-types/t4/) Graviton instances which are ARM-based architectures.

### Requirements

| Name    | CPU | RAM   | Storage | Instance  |
|---------|-----|-------|---------|-----------|
| jumpbox | 1   | 512MB | 10GB    | t4g.nano  |
| server  | 2   | 2GB   | 20GB    | t4g.small |
| node-0  | 2   | 2GB   | 20GB    | t4g.small |
| node-1  | 2   | 2GB   | 20GB    | t4g.small |

## Setup

This project will deploy resources to your AWS account. 

1. You will first need to create a [key-pair](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html) so you can later connect to your EC2 instances. This also means you can use this key to execute commands over ssh into the k8s compute instances.

```shell
aws ec2 create-key-pair \
    --key-name k8s-thw-key-pair \
    --key-type rsa \
    --key-format pem \
    --query "KeyMaterial" \
    --output text > k8s-thw-key-pair.pem
```

1. Remember to change the key-pair file permissions

```shell
chmod 400 k8s-thw-key-pair.pem
```

1. First create an `.env` file (See [env.template](./.env.template)) and set the `CDK_DEFAULT_ACCOUNT` to your _AWS ACCOUNT_ value and 
`CDK_DEFAULT_REGION` to your region. 

> Note: this currently only supports `us-east-1` and `us-west-2` regions. 

1. Bootstrap your account
```shell
npm cdk boostrap
```

1. Deploy your resources
```shell
npx cdk deploy
```

Done! You should now be able to `SSH` into your `jumpbox` server. 

### Deleting your stack

```shell
aws cloudformation delete-stack --stack-name K8sTheHardWayStack
```

## Connecting to your instances

This uses an EC2 key pair to connect to your instances. In this repository, we will use the same key-pair to connect to all your instances. 

## Useful commands

* `npm run build`   compile typescript to js
* `npm run fix`     format your code
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

> You can use `--require-approval never` on your deploy to skip any prompts