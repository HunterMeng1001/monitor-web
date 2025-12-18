import { 
  MonitorTask, 
  AlertData, 
  ServerMetrics, 
  LoadBalancerData, 
  TimeSeriesDataPoint, 
  DataStreamState,
  HealthStatus,
  HistoryDataStorage,
  DataGenerationConfig 
} from '../types/monitoring';

import {
  generateMonitorTasks,
  generateAlertDataList,
  generateServerMetricsList,
  generateLoadBalancerDataList,
  generateTimeSeriesData,
  generateTimeSeriesDataPoint,
  generateInitialDataConfig
} from './mockDataGenerator';

// 数据管理器类
class DataManager {
  private dataStreamState: DataStreamState;
  private config: DataGenerationConfig;
  private updateTimer: NodeJS.Timeout | null = null;
  private servers: ServerMetrics[] = [];
  private tasks: MonitorTask[] = [];
  private alerts: AlertData[] = [];
  private loadBalancers: LoadBalancerData[] = [];
  private historyData: HistoryDataStorage = {
    data: [],
    maxSize: 900, // 15分钟，每秒一个数据点
    retentionMinutes: 15
  };

  constructor() {
    this.config = generateInitialDataConfig();
    this.dataStreamState = {
      isRunning: false,
      updateInterval: this.config.updateInterval,
      lastUpdate: 0,
      autoRefresh: true
    };
    
    this.initializeData();
  }

  // 初始化数据
  private initializeData(): void {
    this.servers = generateServerMetricsList(this.config.serversCount);
    this.tasks = generateMonitorTasks(this.config.tasksCount);
    this.alerts = generateAlertDataList(this.config.alertsCount);
    this.loadBalancers = generateLoadBalancerDataList(3); // 默认3个负载均衡器
    this.historyData.data = generateTimeSeriesData(this.config.historyRetentionMinutes, 60);
  }

  // 启动数据流
  startDataStream(): void {
    if (this.dataStreamState.isRunning) return;
    
    this.dataStreamState.isRunning = true;
    this.dataStreamState.lastUpdate = Date.now();
    
    this.updateTimer = setInterval(() => {
      this.updateData();
    }, this.dataStreamState.updateInterval);
  }

  // 暂停数据流
  pauseDataStream(): void {
    if (!this.dataStreamState.isRunning) return;
    
    this.dataStreamState.isRunning = false;
    
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  // 刷新数据
  refreshData(): void {
    this.updateData();
  }

  // 更新数据
  private updateData(): void {
    const now = Date.now();
    this.dataStreamState.lastUpdate = now;
    
    // 更新服务器指标
    this.updateServerMetrics();
    
    // 更新任务状态
    this.updateTasks();
    
    // 随机生成新告警
    if (Math.random() > 0.8) { // 20%概率生成新告警
      const newAlert = generateAlertDataList(1)[0];
      this.alerts.unshift(newAlert);
      // 保持告警数量在合理范围内
      if (this.alerts.length > this.config.alertsCount * 2) {
        this.alerts = this.alerts.slice(0, this.config.alertsCount * 2);
      }
    }
    
    // 更新负载均衡器数据
    this.updateLoadBalancers();
    
    // 更新历史数据
    this.updateHistoryData();
  }

  // 更新服务器指标
  private updateServerMetrics(): void {
    this.servers = this.servers.map(server => {
      // 基于当前值生成新的指标，确保平滑变化
      const cpuChange = (Math.random() - 0.5) * 10; // -5 到 +5 的变化
      const memoryChange = (Math.random() - 0.5) * 6; // -3 到 +3 的变化
      const diskChange = (Math.random() - 0.5) * 2; // -1 到 +1 的变化
      
      const newCpu = Math.max(0, Math.min(100, server.cpuUsage + cpuChange));
      const newMemory = Math.max(0, Math.min(100, server.memoryUsage + memoryChange));
      const newDisk = Math.max(0, Math.min(100, server.diskUsage + diskChange));
      
      // 网络IO与CPU有一定关联
      const networkBase = newCpu / 2;
      const newInbound = Math.max(0.1, networkBase + (Math.random() - 0.5) * 20);
      const newOutbound = Math.max(0.1, newInbound * 0.8 + (Math.random() - 0.5) * 15);
      
      // 负载平均值与CPU使用率相关
      const newLoadAverage = Math.min(10, newCpu / 10 + (Math.random() - 0.5) * 1);
      
      return {
        ...server,
        cpuUsage: parseFloat(newCpu.toFixed(2)),
        memoryUsage: parseFloat(newMemory.toFixed(2)),
        diskUsage: parseFloat(newDisk.toFixed(2)),
        networkIO: {
          inbound: parseFloat(newInbound.toFixed(2)),
          outbound: parseFloat(newOutbound.toFixed(2))
        },
        loadAverage1m: parseFloat(newLoadAverage.toFixed(2)),
        timestamp: Date.now()
      };
    });
  }

  // 更新任务状态
  private updateTasks(): void {
    this.tasks = this.tasks.map(task => {
      // 只更新运行中和排队的任务
      if (task.status === 'running') {
        const progressIncrement = Math.random() * 10; // 0-10的进度增加
        const newProgress = Math.min(100, task.progress + progressIncrement);
        
        // 随机决定任务是否完成或失败
        if (newProgress >= 100) {
          const statusOptions: MonitorTask['status'][] = ['completed', 'failed'];
          const newStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
          
          return {
            ...task,
            status: newStatus,
            progress: 100,
            updatedAt: Date.now()
          };
        }
        
        return {
          ...task,
          progress: parseFloat(newProgress.toFixed(2)),
          updatedAt: Date.now()
        };
      } else if (task.status === 'queued') {
        // 排队任务有一定概率开始运行
        if (Math.random() > 0.7) { // 30%概率开始运行
          return {
            ...task,
            status: 'running',
            progress: Math.random() * 10, // 初始进度0-10
            updatedAt: Date.now()
          };
        }
      }
      
      return task;
    });
    
    // 随机生成新任务
    if (Math.random() > 0.9 && this.tasks.length < this.config.tasksCount * 1.5) { // 10%概率生成新任务
      const newTask = generateMonitorTasks(1)[0];
      this.tasks.unshift(newTask);
    }
  }

  // 更新负载均衡器数据
  private updateLoadBalancers(): void {
    this.loadBalancers = this.loadBalancers.map(lb => {
      // 更新每个节点的网络IO
      const updatedNodes = lb.nodes.map(node => {
        // 基于当前值生成新的网络IO，确保平滑变化
        const netInChange = (Math.random() - 0.5) * 10;
        const netOutChange = (Math.random() - 0.5) * 8;
        
        const newNetIn = Math.max(0.1, node.netIn + netInChange);
        const newNetOut = Math.max(0.1, node.netOut + netOutChange);
        
        // 根据网络IO确定节点状态
        let status: 'healthy' | 'warning' | 'error';
        const avgNetIn = lb.nodes.reduce((sum, n) => sum + n.netIn, 0) / lb.nodes.length;
        
        if (newNetIn > avgNetIn * 2) {
          status = Math.random() > 0.5 ? 'warning' : 'error';
        } else if (newNetIn < avgNetIn * 0.7) {
          status = Math.random() > 0.7 ? 'warning' : 'healthy';
        } else {
          status = 'healthy';
        }
        
        return {
          ...node,
          netIn: parseFloat(newNetIn.toFixed(2)),
          netOut: parseFloat(newNetOut.toFixed(2)),
          status
        };
      });
      
      // 重新计算是否负载不均衡
      const netInValues = updatedNodes.map(node => node.netIn);
      const maxNetIn = Math.max(...netInValues);
      const minNetIn = Math.min(...netInValues);
      const ratio = maxNetIn / minNetIn;
      const isImbalanced = ratio > 3;
      
      return {
        ...lb,
        nodes: updatedNodes,
        isImbalanced,
        ratio: parseFloat(ratio.toFixed(2)),
        timestamp: Date.now()
      };
    });
  }

  // 更新历史数据
  private updateHistoryData(): void {
    // 生成新的数据点
    const newDataPoint = generateTimeSeriesDataPoint(Date.now());
    
    // 添加到历史数据
    this.historyData.data.push(newDataPoint);
    
    // 检查是否超出保留时间
    const retentionMs = this.historyData.retentionMinutes * 60 * 1000;
    const cutoffTime = Date.now() - retentionMs;
    
    // 移除超出保留时间的数据点
    this.historyData.data = this.historyData.data.filter(
      point => point.timestamp >= cutoffTime
    );
    
    // 如果数据点数量超过最大值，移除最旧的数据点
    if (this.historyData.data.length > this.historyData.maxSize) {
      this.historyData.data = this.historyData.data.slice(-this.historyData.maxSize);
    }
  }

  // 计算系统健康状态
  calculateSystemHealth(): HealthStatus {
    // 如果没有服务器数据，默认为健康
    if (this.servers.length === 0) return 'healthy';
    
    // 计算不健康的服务器数量
    let unhealthyCount = 0;
    let warningCount = 0;
    
    this.servers.forEach(server => {
      const health = this.calculateServerHealth(server);
      if (health === 'error') {
        unhealthyCount++;
      } else if (health === 'warning') {
        warningCount++;
      }
    });
    
    // 如果有超过30%的服务器不健康，系统状态为错误
    if (unhealthyCount > this.servers.length * 0.3) {
      return 'error';
    }
    
    // 如果有超过50%的服务器警告或有不健康服务器，系统状态为警告
    if (warningCount > this.servers.length * 0.5 || unhealthyCount > 0) {
      return 'warning';
    }
    
    // 否则系统状态为健康
    return 'healthy';
  }

  // 计算单个服务器健康状态
  calculateServerHealth(server: ServerMetrics): HealthStatus {
    // 基于规则：cpu>85%或mem>90%或load1m>5则不健康
    if (server.cpuUsage > 85 || server.memoryUsage > 90 || server.loadAverage1m > 5) {
      return 'error';
    }
    
    // 警告阈值：cpu>70%或mem>80%或load1m>3
    if (server.cpuUsage > 70 || server.memoryUsage > 80 || server.loadAverage1m > 3) {
      return 'warning';
    }
    
    return 'healthy';
  }

  // 判断负载均衡是否倾斜
  isLoadBalancerImbalanced(lb: LoadBalancerData): boolean {
    return lb.isImbalanced;
  }

  // 获取历史数据
  getHistoryData(minutes?: number): TimeSeriesDataPoint[] {
    if (!minutes) return this.historyData.data;
    
    const cutoffTime = Date.now() - minutes * 60 * 1000;
    return this.historyData.data.filter(point => point.timestamp >= cutoffTime);
  }

  // 获取当前数据
  getCurrentData() {
    return {
      servers: this.servers,
      tasks: this.tasks,
      alerts: this.alerts,
      loadBalancers: this.loadBalancers,
      historyData: this.historyData.data,
      systemHealth: this.calculateSystemHealth(),
      dataStreamState: { ...this.dataStreamState }
    };
  }

  // 设置更新间隔
  setUpdateInterval(interval: number): void {
    this.dataStreamState.updateInterval = interval;
    this.config.updateInterval = interval;
    
    // 如果数据流正在运行，重启它以应用新的间隔
    const wasRunning = this.dataStreamState.isRunning;
    if (wasRunning) {
      this.pauseDataStream();
      this.startDataStream();
    }
  }

  // 获取数据流状态
  getDataStreamState(): DataStreamState {
    return { ...this.dataStreamState };
  }

  // 销毁数据管理器
  destroy(): void {
    this.pauseDataStream();
  }
}

// 创建单例实例
export const dataManager = new DataManager();

// 导出数据管理器类
export { DataManager };