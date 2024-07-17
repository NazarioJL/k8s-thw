/**
 * Defines a compute instance required for creating the K8s cluster
 */
export interface K8sComputeConfig {
  id: string;
  name: string;
  privateIpAddress: string;
  fqdn: string;
  podSubnetCidr?: string | undefined;
}
