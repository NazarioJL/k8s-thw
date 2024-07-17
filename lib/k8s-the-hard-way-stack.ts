import {CfnOutput, Stack, StackProps} from 'aws-cdk-lib';
import {
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  IpAddresses,
  KeyPair,
  MachineImage,
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
  Vpc,
} from 'aws-cdk-lib/aws-ec2';
import {Construct} from 'constructs';
import {createFileEchoCommands, K8S_COMPUTE_CONFIG} from './configuration';

export class K8sTheHardWayStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, 'VPC', {
      ipAddresses: IpAddresses.cidr('10.200.0.0/16'),
      subnetConfiguration: [
        {
          name: 'PrivateSubnet',
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 20,
        },
        {
          name: 'PublicSubnet',
          subnetType: SubnetType.PUBLIC,
          cidrMask: 20,
        },
      ],
      enableDnsSupport: true,
      enableDnsHostnames: true,
      maxAzs: 1,
    });

    // Creates security group to manage traffic for hosts from within the VPC
    const securityGroup = new SecurityGroup(this, 'SecurityGroup', {
      vpc,
      allowAllOutbound: true,
      description:
        'AWS::EC2::SecurityGroup to manage security for hosts inside VPC.',
    });

    securityGroup.addIngressRule(
      Peer.ipv4(vpc.vpcCidrBlock),
      Port.allTraffic(),
      'Allow all traffic within VPC'
    );

    // The tutorial requires Debian 12 (Bookworm) ARM64
    // This only has images for 'us-east-1' and 'us-west-2' regions
    // If this solution is to be deployed to another region see:
    // https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html
    const machineImage = MachineImage.genericLinux({
      'us-east-1': 'ami-0248a5a860febde32',
      'us-west-2': 'ami-064f166867d15035d',
    });

    // Import key-pair that will be used for SSH access for all instances
    const keyPair = KeyPair.fromKeyPairName(
      this,
      'KeyPair',
      'k8s-thw-key-pair'
    );

    // Create 'jumpbox' instance with security groups
    const publicSecurityGroup = new SecurityGroup(
      this,
      'JumpboxSecurityGroup',
      {
        vpc,
        allowAllOutbound: true,
        description:
          'Manages the network security for the jumpbox, allows public ssh access.',
        securityGroupName: 'PublicSecurityGroupWithSSH',
      }
    );

    publicSecurityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(22),
      'Allow SSH access from anywhere'
    );

    const jumpboxInstance = new Instance(this, 'JumpboxInstance', {
      vpc,
      privateIpAddress: '10.200.16.100',
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.NANO),
      machineImage: machineImage,
      securityGroup: publicSecurityGroup,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
      requireImdsv2: true,
      keyPair: keyPair,
    });

    const commands = createFileEchoCommands(K8S_COMPUTE_CONFIG);
    jumpboxInstance.userData.addCommands(...commands);

    new CfnOutput(this, 'JumpboxInstanceId', {
      value: jumpboxInstance.instanceId,
    });

    const privateSecurityGroup = new SecurityGroup(
      this,
      'PrivateSecurityGroup',
      {
        vpc,
        description:
          'This security group manages the permissions for the k8s compute instances.',
        securityGroupName: 'PrivateSecurityGroupWithSSH',
      }
    );

    privateSecurityGroup.addIngressRule(
      Peer.ipv4(vpc.vpcCidrBlock),
      Port.tcp(22),
      'Allow SSH traffic from inside the VPC'
    );

    K8S_COMPUTE_CONFIG.forEach(config => {
      const instance = new Instance(this, config.id, {
        vpc,
        privateIpAddress: config.privateIpAddress,
        instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
        machineImage: machineImage,
        securityGroup: privateSecurityGroup,
        vpcSubnets: {
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
        requireImdsv2: true,
        keyPair: keyPair,
      });

      new CfnOutput(this, `${config.id}PrivateDNSName`, {
        value: instance.instancePrivateDnsName,
      });
    });
  }
}
