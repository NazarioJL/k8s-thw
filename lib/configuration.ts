import {K8sComputeConfig} from './types';

// This configuration represents the k8s compute instances in the 'machines.txt' file described in:
// https://github.com/kelseyhightower/kubernetes-the-hard-way/blob/master/docs/03-compute-resources.md
export const K8S_COMPUTE_CONFIG: K8sComputeConfig[] = [
  {
    id: 'ServerInstance',
    name: 'server',
    privateIpAddress: '10.200.2.1',
    fqdn: 'server.kubernetes.local',
  },
  {
    id: 'Node0Instance',
    name: 'node-0',
    privateIpAddress: '10.200.2.2',
    fqdn: 'node-0.kubernetes.local',
    podSubnetCidr: '10.200.0.0/24',
  },
  {
    id: 'Node1Instance',
    name: 'node-1',
    privateIpAddress: '10.200.2.3',
    fqdn: 'node-1.kubernetes.local',
    podSubnetCidr: '10.200.1.0/24',
  },
];

export const createFileEchoCommands = (
  config: K8sComputeConfig[],
  fileName = '/home/machines.txt'
): string[] => {
  return config.map(conf => {
    //return `${conf.privateIpAddress} ${conf.fqdn} ${conf.name} ${conf.podSubnetCidr ?? ''}`;
    return (
      `echo ${conf.privateIpAddress} ${conf.fqdn} ${conf.name}` +
      (conf.podSubnetCidr ? ` ${conf.podSubnetCidr}` : '') +
      ` >> ${fileName}`
    );
  });
};
