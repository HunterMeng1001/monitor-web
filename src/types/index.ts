// 系统指标类型
export interface SystemMetrics {
  id: string;
  serverName: string;
  region: string;
  tags: string[];
  cpu: {
    usage: number;
    cores: number;
    load: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    inbound: number;
    outbound: number;
  };
  timestamp: number;
  health: 'healthy' | 'warning' | 'critical';
}

// 监控任务类型
export interface MonitorTask {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  startTime: number;
  endTime?: number;
  serverId: string;
  type: 'performance' | 'availability' | 'security' | 'custom';
}

// 告警记录类型
export interface AlertRecord {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  serverId: string;
  timestamp: number;
  acknowledged: boolean;
  resolved: boolean;
}

// 负载均衡状态
export interface LoadBalancerStatus {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance';
  nodes: {
    id: string;
    name: string;
    status: 'online' | 'offline' | 'degraded';
    load: number;
    connections: number;
  }[];
  totalConnections: number;
  health: 'healthy' | 'warning' | 'critical';
}

// 图表数据点
export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

// 图表配置
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'gauge';
  title: string;
  dataKey: string;
  color?: string;
  timeRange?: number; // 分钟
  refreshInterval?: number; // 毫秒
}

// 过滤条件
export interface FilterCriteria {
  searchText?: string;
  regions?: string[];
  tags?: string[];
  status?: string[];
  health?: string[];
}

// 主题类型
export type ThemeType = 'dark' | 'light';

//```// 数据流状态 - 统一的数据流状态接口
export interface DataStreamState {
  isRunning: boolean;
  updateInterval: number;
  lastUpdate: number;
  autoRefresh: boolean;
  // 新增属性以支持更好的状态管理
  connectionStatus?: 'connected' | 'disconnected' | 'reconnecting';
  error?: string | null;
  retryCount?: number;
}
```
// 应用状态
export interface AppState {
  theme: ThemeType;
  dataStream: DataStreamState;
  filters: FilterCriteria;
  selectedServers: string[];
  timeRange: number; // 分钟
}