export type DiskUsage = {
  fs: string;
  mount: string;
  total: number;
  used: number;
  free: number;
  percentUsed: number;
};

export type MetricSnapshot = {
  timestamp: number;
  cpu: {
    overall: number; // 0–100
    cores: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percentUsed: number;
  };
  network: {
    bytesIn: number; // bytes/sec since last tick
    bytesOut: number;
  };
  disk: DiskUsage[];
};

export type SystemInfo = {
  hostname: string;
  os: string;
  platform: string;
  arch: string;
  nodeVersion: string;
  uptime: number;
};
