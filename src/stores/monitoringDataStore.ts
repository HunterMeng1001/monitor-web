import { create } from 'zustand';
import { 
  MonitorTask, 
  AlertData, 
  ServerMetrics, 
  LoadBalancerData, 
  TimeSeriesDataPoint, 
  DataStreamState,
  HealthStatus 
} from '../types/monitoring';

// 数据存储接口
interface MonitoringDataStore {
  // 数据状态
  servers: ServerMetrics[];
  tasks: MonitorTask[];
  alerts: AlertData[];
  loadBalancers: LoadBalancerData[];
  historyData: TimeSeriesDataPoint[];
  systemHealth: HealthStatus;
  dataStreamState: DataStreamState;
  filterText: string; // 添加过滤文本状态
  
  // 数据更新方法
  setServers: (servers: ServerMetrics[]) => void;
  updateServer: (serverId: string, updates: Partial<ServerMetrics>) => void;
  
  setTasks: (tasks: MonitorTask[]) => void;
  updateTask: (taskId: string, updates: Partial<MonitorTask>) => void;
  
  setAlerts: (alerts: AlertData[]) => void;
  addAlert: (alert: AlertData) => void;
  acknowledgeAlert: (alertId: string) => void;
  
  setLoadBalancers: (loadBalancers: LoadBalancerData[]) => void;
  updateLoadBalancer: (lbId: string, updates: Partial<LoadBalancerData>) => void;
  
  setHistoryData: (historyData: TimeSeriesDataPoint[]) => void;
  addHistoryDataPoint: (dataPoint: TimeSeriesDataPoint) => void;
  
  setSystemHealth: (health: HealthStatus) => void;
  setFilterText: (filterText: string) => void; // 添加设置过滤文本的方法
  
  // 数据流控制方法
  setDataStreamState: (state: Partial<DataStreamState>) => void;
  startDataStream: () => void;
  pauseDataStream: () => void;
  refreshData: () => void;
  setUpdateInterval: (interval: number) => void;
  
  // 数据查询方法
  getServerById: (serverId: string) => ServerMetrics | undefined;
  getTaskById: (taskId: string) => MonitorTask | undefined;
  getAlertById: (alertId: string) => AlertData | undefined;
  getLoadBalancerById: (lbId: string) => LoadBalancerData | undefined;
  getHistoryData: (minutes?: number) => TimeSeriesDataPoint[];
  
  // 过滤数据方法
  getFilteredServers: () => ServerMetrics[];
  getFilteredTasks: () => MonitorTask[];
  getFilteredAlerts: () => AlertData[];
  
  // 数据清理方法
  cleanupOldData: (retentionMinutes: number) => void;
}

// 创建监控数据存储
export const useMonitoringDataStore = create<MonitoringDataStore>((set, get) => ({
  // 初始数据状态
  servers: [],
  tasks: [],
  alerts: [],
  loadBalancers: [],
  historyData: [],
  systemHealth: 'healthy',
  dataStreamState: {
    isRunning: true,
    updateInterval: 1500,
    lastUpdate: Date.now(),
    autoRefresh: true,
    connectionStatus: 'connected',
    error: null,
    retryCount: 0,
  },
  filterText: '', // 初始化过滤文本
  
  // 服务器数据方法
  setServers: (servers) => set({ servers }),
  
  updateServer: (serverId, updates) => {
    set((state) => {
      const existingIndex = state.servers.findIndex(s => s.serverId === serverId);
      if (existingIndex >= 0) {
        const updatedServers = [...state.servers];
        updatedServers[existingIndex] = { ...updatedServers[existingIndex], ...updates };
        return { servers: updatedServers };
      }
      return state;
    });
  },
  
  // 任务数据方法
  setTasks: (tasks) => set({ tasks }),
  
  updateTask: (taskId, updates) => {
    set((state) => ({
      tasks: state.tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    }));
  },
  
  // 告警数据方法
  setAlerts: (alerts) => set({ alerts }),
  
  addAlert: (alert) => {
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 1000), // 限制告警数量
    }));
  },
  
  acknowledgeAlert: (alertId) => {
    set((state) => ({
      alerts: state.alerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ),
    }));
  },
  
  // 负载均衡器数据方法
  setLoadBalancers: (loadBalancers) => set({ loadBalancers }),
  
  updateLoadBalancer: (lbId, updates) => {
    set((state) => ({
      loadBalancers: state.loadBalancers.map(lb =>
        lb.id === lbId ? { ...lb, ...updates } : lb
      ),
    }));
  },
  
  // 历史数据方法
  setHistoryData: (historyData) => set({ historyData }),
  
  addHistoryDataPoint: (dataPoint) => {
    set((state) => {
      const updatedHistoryData = [...state.historyData, dataPoint];
      // 限制历史数据长度，保留最近15分钟的数据
      const retentionMs = 15 * 60 * 1000;
      const cutoffTime = Date.now() - retentionMs;
      const filteredHistoryData = updatedHistoryData.filter(
        point => point.timestamp >= cutoffTime
      );
      return { historyData: filteredHistoryData };
    });
  },
  
  // 系统健康状态方法
  setSystemHealth: (health) => set({ systemHealth: health }),
  
  // 设置过滤文本方法
  setFilterText: (filterText) => set({ filterText }),
  
  // 数据流控制方法
  setDataStreamState: (newState) => {
    set((state) => ({
      dataStreamState: { ...state.dataStreamState, ...newState }
    }));
  },
  
  startDataStream: () => {
    set((state) => ({
      dataStreamState: { ...state.dataStreamState, isRunning: true }
    }));
  },
  
  pauseDataStream: () => {
    set((state) => ({
      dataStreamState: { ...state.dataStreamState, isRunning: false }
    }));
  },
  
  refreshData: () => {
    set((state) => ({
      dataStreamState: { 
        ...state.dataStreamState, 
        lastUpdate: Date.now(),
        connectionStatus: 'connected',
        error: null
      }
    }));
  },
  
  setUpdateInterval: (interval) => {
    set((state) => ({
      dataStreamState: { ...state.dataStreamState, updateInterval: interval }
    }));
  },
  
  // 数据查询方法
  getServerById: (serverId) => {
    return get().servers.find(s => s.serverId === serverId);
  },
  
  getTaskById: (taskId) => {
    return get().tasks.find(t => t.id === taskId);
  },
  
  getAlertById: (alertId) => {
    return get().alerts.find(a => a.id === alertId);
  },
  
  getLoadBalancerById: (lbId) => {
    return get().loadBalancers.find(lb => lb.id === lbId);
  },
  
  getHistoryData: (minutes) => {
    const historyData = get().historyData;
    if (!minutes) return historyData;
    
    const cutoffTime = Date.now() - minutes * 60 * 1000;
    return historyData.filter(point => point.timestamp >= cutoffTime);
  },
  
  // 过滤数据方法实现
  getFilteredServers: () => {
    const { servers, filterText } = get();
    if (!filterText.trim()) return servers;
    
    const lowerFilterText = filterText.toLowerCase();
    return servers.filter(server => 
      server.serverName?.toLowerCase().includes(lowerFilterText) ||
      server.serverId?.toLowerCase().includes(lowerFilterText) ||
      server.region?.toLowerCase().includes(lowerFilterText) ||
      server.tags?.some(tag => tag.toLowerCase().includes(lowerFilterText))
    );
  },
  
  getFilteredTasks: () => {
    const { tasks, filterText } = get();
    if (!filterText.trim()) return tasks;
    
    const lowerFilterText = filterText.toLowerCase();
    return tasks.filter(task => 
      task.name?.toLowerCase().includes(lowerFilterText) ||
      task.id?.toLowerCase().includes(lowerFilterText) ||
      task.targetServer?.toLowerCase().includes(lowerFilterText)
    );
  },
  
  getFilteredAlerts: () => {
    const { alerts, filterText } = get();
    if (!filterText.trim()) return alerts;
    
    const lowerFilterText = filterText.toLowerCase();
    return alerts.filter(alert => 
      alert.sourceServer?.toLowerCase().includes(lowerFilterText) ||
      alert.description?.toLowerCase().includes(lowerFilterText) ||
      alert.severity?.toLowerCase().includes(lowerFilterText)
    );
  },
  
  // 数据清理方法
  cleanupOldData: (retentionMinutes) => {
    const cutoffTime = Date.now() - retentionMinutes * 60 * 1000;
    
    set((state) => {
      // 清理历史数据
      const filteredHistoryData = state.historyData.filter(
        point => point.timestamp >= cutoffTime
      );
      
      // 清理告警数据
      const filteredAlerts = state.alerts.filter(
        alert => alert.timestamp >= cutoffTime
      );
      
      return {
        historyData: filteredHistoryData,
        alerts: filteredAlerts
      };
    });
  },
}));