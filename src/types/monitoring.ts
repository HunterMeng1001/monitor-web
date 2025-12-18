// 监控任务类型
export interface MonitorTask {
  id: string;
  name: string;
  targetCluster: string;
  status: 'queued' | 'running' | 'failed' | 'completed';
  progress: number; // 0-100
  createdAt: number;
  updatedAt: number;
}

// 异常告警数据
export interface AlertData {
  id: string;
  timestamp: number;
  sourceServer: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  acknowledged: boolean;
}

// 服务器核心指标数据
export interface ServerMetrics {
  serverId: string;
  serverName: string;
  cpuUsage: number; // 0-100
  memoryUsage: number; // 0-100
  diskUsage: number; // 0-100
  networkIO: {
    inbound: number; // MB/s
    outbound: number; // MB/s
  };
  loadAverage1m: number; // 0-10
  timestamp: number;
}

// 负载均衡数据
export interface LoadBalancerData {
  id: string;
  name: string;
  nodes: {
    id: string;
    name: string;
    netIn: number;
    netOut: number;
    status: 'healthy' | 'warning' | 'error';
  }[];
  isImbalanced: boolean;
  ratio: number; // 最大值/最小值比值
  timestamp: number;
}

// 时序数据点
export interface TimeSeriesDataPoint {
  timestamp: number;
  cpu: number;
  memory: number;
  disk: number;
}

// 数据流状态 - 从 types/index.ts 导入统一接口
export { DataStreamState } from './index';

// 系统健康状态
export type HealthStatus = 'healthy' | 'warning' | 'error';

// 数据生成配置
export interface DataGenerationConfig {
  serversCount: number;
  tasksCount: number;
  alertsCount: number;
  updateInterval: number; // 毫秒
  historyRetentionMinutes: number;
}

// 历史数据存储
export interface HistoryDataStorage {
  data: TimeSeriesDataPoint[];
  maxSize: number; // 最大数据点数量
  retentionMinutes: number;
}