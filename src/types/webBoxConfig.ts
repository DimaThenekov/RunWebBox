import type { FileItem } from './fileSystem';
import { type V86 } from 'v86';
import type { network_event } from './network';

export interface machine_config {
  id: number;
  listeners: string[];
}

export interface V86_config extends machine_config {
  type: 'V86';
  memory: number;
  mac: string;
}

export interface network_config extends machine_config {
  type: 'internet';
  files: {
    [url: string]: string;
  };
  proxy?: string;
}

export interface browser_config extends machine_config {
  type: 'browser';
  ip: [number, number, number, number];
  path: string;
}

export interface WebBoxConfig {
  version: string;
  file_system: FileItem;
  config: {
    machines: (V86_config | network_config | browser_config)[];
    default_browser: number;
  };
}

export interface network_listener {
  listen: (p: network_event) => void;
}

export interface V86_machine extends V86_config, network_listener {
  V86: V86;
}

export interface network_machine extends V86_config, network_listener {}

export interface browser_machine extends V86_config, network_listener {}
