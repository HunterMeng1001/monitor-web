import { create } from 'zustand';
import { SystemMetrics, MonitorTask, AlertRecord, LoadBalancerStatus } from '../types';

interface DataStore {
  // 系统指标数据
  metrics: SystemMetrics[];
  metricsHistory: Record<string, SystemMetrics[]>;
  
  // 监控任务数据
  tasks: MonitorTask[];
  
  // 告警记录数据
  alerts: AlertRecord[];
  
  // 负载均衡状态
  loadBalancers: LoadBalancerStatus[];
  
  // 更新方法
  setMetrics: (metrics: SystemMetrics[]) => void;
  updateMetrics: (newMetrics: SystemMetrics) => void;
  addMetricsToHistory: (serverId: string, metrics: SystemMetrics) => void;
  
  setTasks: (tasks: MonitorTask[]) => void;
  updateTask: (taskId: string, updates: Partial<MonitorTask>) => void;
  
  setAlerts: (alerts: AlertRecord[]) => void;
  addAlert: (alert: AlertRecord) => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  
  setLoadBalancers: (loadBalancers: LoadBalancerStatus[]) => void;
  updateLoadBalancer: (id: string, updates: Partial<LoadBalancerStatus>) => void;
  
  // 清理历史数据
  cleanupHistory: (maxAgeMinutes: number) => void;
}

export const useDataStore = create<DataStore>((set, get) => ({
  // 初始数据
  metrics: [],
  metricsHistory: {},
  tasks: [],
  alerts: [],
  loadBalancers: [],
  
  // 系统指标相关方法
  setMetrics: (metrics) => set({ metrics }),
  
  updateMetrics: (newMetrics) => {
    set((state) => {
      const existingIndex = state.metrics.findIndex(m => m.id === newMetrics.id);
      let updatedMetrics;
      
      if (existingIndex >= 0) {
        updatedMetrics = [...state.metrics];
        updatedMetrics[existingIndex] = newMetrics;
      } else {
        updatedMetrics = [...state.metrics, newMetrics];
      }
      
      return { metrics: updatedMetrics };
    });
  },
  
  addMetricsToHistory: (serverId, metrics) => {
    set((state) => {
      const history = state.metricsHistory[serverId] || [];
      const updatedHistory = [...history, metrics];
      
      // 限制历史数据长度，保留最近100个数据点
      const limitedHistory = updatedHistory.slice(-100);
      
      return {
        metricsHistory: {
          ...state.metricsHistory,
          [serverId]: limitedHistory,
        },
      };
    });
  },
  
  // 监控任务相关方法
  setTasks: (tasks) => set({ tasks }),
  
  updateTask: (taskId, updates) => {
    set((state) => ({
      tasks: state.tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    }));
  },
  
  // 告警记录相关方法
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
  
  resolveAlert: (alertId) => {
    set((state) => ({
      alerts: state.alerts.map(alert =>
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ),
    }));
  },
  
  // 负载均衡相关方法
  setLoadBalancers: (loadBalancers) => set({ loadBalancers }),
  
  updateLoadBalancer: (id, updates) => {
    set((state) => ({
      loadBalancers: state.loadBalancers.map(lb =>
        lb.id === id ? { ...lb, ...updates } : lb
      ),
    }));
  },
  
  // 清理历史数据
  cleanupHistory: (maxAgeMinutes) => {
    const cutoffTime = Date.now() - maxAgeMinutes * 60 * 1000;
    
    set((state) => {
      const cleanedHistory: Record<string, SystemMetrics[]> = {};
      
      Object.entries(state.metricsHistory).forEach(([serverId, history]) => {
        cleanedHistory[serverId] = history.filter(
          metrics => metrics.timestamp >= cutoffTime
        );
      });
      
      return { metricsHistory: cleanedHistory };
    });
  },
}));