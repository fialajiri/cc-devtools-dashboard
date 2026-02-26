import si from 'systeminformation';
import type { Systeminformation } from 'systeminformation';
import os from 'os';
import type { MetricSnapshot, SystemInfo } from '@/types/metrics';

// null on first call → network delta returns rx: 0, tx: 0 for that tick
let prevNet: Systeminformation.NetworkStatsData[] | null = null;

export async function getSystemInfo(): Promise<SystemInfo> {
  const [osInfo, versions] = await Promise.all([
    si.osInfo().catch(() => null),
    si.versions('node').catch(() => null),
  ]);

  const nodeVer = versions?.node ?? process.version;

  return {
    hostname: osInfo?.hostname ?? os.hostname(),
    os: osInfo ? `${osInfo.distro} ${osInfo.release}`.trim() : os.type(),
    platform: osInfo?.platform ?? process.platform,
    arch: osInfo?.arch ?? process.arch,
    nodeVersion: nodeVer.startsWith('v') ? nodeVer : `v${nodeVer}`,
    uptime: os.uptime(),
  };
}

export async function getMetricSnapshot(): Promise<MetricSnapshot> {
  const [load, fsData, currNet] = await Promise.all([
    si.currentLoad().catch(() => null),
    si.fsSize().catch(() => []),
    si.networkStats().catch(() => []),
  ]);

  // CPU
  const cpuOverall = load?.currentLoad ?? 0;
  const cpuCores = load?.cpus.map((c) => c.load) ?? [];

  // Memory (synchronous)
  const memTotal = os.totalmem();
  const memFree = os.freemem();
  const memUsed = memTotal - memFree;

  // Disk
  const disk = (fsData as Systeminformation.FsSizeData[])
    .filter((d) => d.size > 0)
    .map((d) => ({
      fs: d.fs,
      mount: d.mount,
      total: d.size,
      used: d.used,
      free: d.available,
      percentUsed: d.use,
    }));

  // Network delta
  let bytesIn = 0;
  let bytesOut = 0;
  if (prevNet !== null && currNet[0] && prevNet[0]) {
    bytesIn = Math.max(0, currNet[0].rx_bytes - prevNet[0].rx_bytes);
    bytesOut = Math.max(0, currNet[0].tx_bytes - prevNet[0].tx_bytes);
  }
  prevNet = currNet.length > 0 ? currNet : prevNet;

  return {
    timestamp: Date.now(),
    cpu: {
      overall: cpuOverall,
      cores: cpuCores,
    },
    memory: {
      total: memTotal,
      used: memUsed,
      free: memFree,
      percentUsed: (memUsed / memTotal) * 100,
    },
    network: {
      bytesIn,
      bytesOut,
    },
    disk,
  };
}
