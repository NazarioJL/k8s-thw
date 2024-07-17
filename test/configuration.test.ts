import {createFileEchoCommands, K8S_COMPUTE_CONFIG} from '../lib/configuration';

describe('configuration', () =>
  describe('createMachineFileContents', () => {
    it('returnsCorrectData', () => {
      console.log(createFileEchoCommands(K8S_COMPUTE_CONFIG));
      expect(createFileEchoCommands(K8S_COMPUTE_CONFIG)).toEqual([
        'echo 10.200.2.0 server.kubernetes.local server >> /home/machines.txt',
        'echo 10.200.2.1 node-0.kubernetes.local node-0 10.200.0.0/24 >> /home/machines.txt',
        'echo 10.200.2.2 node-1.kubernetes.local node-1 10.200.1.0/24 >> /home/machines.txt',
      ]);
    });
  }));
