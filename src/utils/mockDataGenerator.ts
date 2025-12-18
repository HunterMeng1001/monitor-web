import { MonitorTask, AlertData, ServerMetrics, LoadBalancerData, TimeSeriesDataPoint, DataGenerationConfig } from '../types/monitoring';

// 生成随机ID
function generateId(prefix = ''): string {
  return `${prefix}${Math.random().toString(36).substring(2, 11)}`;
}

// 生成随机整数
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成随机浮点数
function randomFloat(min: number, max: number, decimals = 2): number {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
}

// 生成随机时间戳（最近N小时内）
function randomTimestamp(hours = 24): number {
  const now = Date.now();
  const hoursAgo = now - hours * 60 * 60 * 1000;
  return randomInt(hoursAgo, now);
}

// 生成随机集群名
function randomClusterName(): string {
  const clusters = [
    '生产环境-华东',
    '生产环境-华北',
    '测试环境-华南',
    '预发布环境-西部',
    '开发环境-东部'
  ];
  return clusters[randomInt(0, clusters.length - 1)];
}

// 生成随机服务器名
function randomServerName(): string {
  const prefixes = ['web', 'api', 'db', 'cache', 'mq', 'worker'];
  const prefix = prefixes[randomInt(0, prefixes.length - 1)];
  const number = randomInt(1, 99);
  return `${prefix}-server-${number}`;
}

// 生成随机任务描述
function randomTaskDescription(): string {
  const descriptions = [
    '系统性能监控任务',
    '服务可用性检测',
    '安全漏洞扫描',
    '资源使用率分析',
    '网络延迟测试',
    '数据库性能评估',
    'API响应时间监控',
    '日志文件分析'
  ];
  return descriptions[randomInt(0, descriptions.length - 1)];
}

// 生成随机告警描述
function randomAlertDescription(severity: AlertData['severity']): string {
  const criticalDesc = [
    '服务器宕机',
    'CPU使用率超过95%',
    '内存溢出',
    '磁盘空间不足',
    '网络连接中断'
  ];
  
  const highDesc = [
    'CPU使用率超过85%',
    '内存使用率超过90%',
    '响应时间超过阈值',
    '错误率增加',
    '磁盘空间即将耗尽'
  ];
  
  const mediumDesc = [
    'CPU使用率较高',
    '内存使用率偏高',
    '网络延迟增加',
    '服务响应变慢',
    '磁盘使用率增长'
  ];
  
  const lowDesc = [
    '轻微性能波动',
    '日志异常',
    '配置变更',
    '定时任务执行',
    '系统资源正常波动'
  ];
  
  let descriptions;
  switch (severity) {
    case 'critical':
      descriptions = criticalDesc;
      break;
    case 'high':
      descriptions = highDesc;
      break;
    case 'medium':
      descriptions = mediumDesc;
      break;
    case 'low':
      descriptions = lowDesc;
      break;
    default:
      descriptions = lowDesc;
  }
  
  return descriptions[randomInt(0, descriptions.length - 1)];
}

// 生成监控任务数据
export function generateMonitorTask(): MonitorTask {
  const statusOptions: MonitorTask['status'][] = ['queued', 'running', 'failed', 'completed'];
  const status = statusOptions[randomInt(0, statusOptions.length - 1)];
  const progress = status === 'completed' ? 100 : 
                  status === 'failed' ? randomInt(0, 80) : 
                  status === 'running' ? randomInt(10, 90) : 0;
  
  const createdAt = randomTimestamp(4); // 最近4小时内
  const updatedAt = status === 'completed' || status === 'failed' ? 
                    createdAt + randomInt(5, 60) * 60 * 1000 : // 任务持续5-60分钟
                    createdAt + randomInt(1, 10) * 60 * 1000; // 更新时间在创建后1-10分钟
  
  return {
    id: generateId('task-'),
    name: randomTaskDescription(),
    targetCluster: randomClusterName(),
    status,
    progress,
    createdAt,
    updatedAt
  };
}

// 生成多个监控任务数据
export function generateMonitorTasks(count: number): MonitorTask[] {
  const tasks: MonitorTask[] = [];
  for (let i = 0; i < count; i++) {
    tasks.push(generateMonitorTask());
  }
  // 按更新时间倒序排列
  return tasks.sort((a, b) => b.updatedAt - a.updatedAt);
}

// 生成异常告警数据
export function generateAlertData(): AlertData {
  const severityOptions: AlertData['severity'][] = ['critical', 'high', 'medium', 'low'];
  const severity = severityOptions[randomInt(0, severityOptions.length - 1)];
  
  return {
    id: generateId('alert-'),
    timestamp: randomTimestamp(12), // 最近12小时内
    sourceServer: randomServerName(),
    severity,
    description: randomAlertDescription(severity),
    acknowledged: Math.random() > 0.7 // 30%概率已确认
  };
}

// 生成多个异常告警数据
export function generateAlertDataList(count: number): AlertData[] {
  const alerts: AlertData[] = [];
  for (let i = 0; i < count; i++) {
    alerts.push(generateAlertData());
  }
  // 按时间倒序排列
  return alerts.sort((a, b) => b.timestamp - a.timestamp);
}

// 生成服务器核心指标数据
export function generateServerMetrics(serverId?: string, serverName?: string): ServerMetrics {
  const id = serverId || generateId('server-');
  const name = serverName || randomServerName();
  
  // 生成具有一定关联性的指标数据
  const baseLoad = randomFloat(0.2, 0.8); // 基础负载
  const cpuUsage = Math.min(100, baseLoad * 100 + randomFloat(-10, 20));
  const memoryUsage = Math.min(100, baseLoad * 90 + randomFloat(-5, 15));
  const diskUsage = Math.min(100, randomFloat(30, 85));
  
  // 网络IO与CPU负载有一定关联
  const networkBase = baseLoad * 50;
  const networkIn = Math.max(0.1, networkBase + randomFloat(-20, 30));
  const networkOut = Math.max(0.1, networkBase * 0.7 + randomFloat(-15, 20));
  
  // 负载平均值与CPU使用率相关
  const loadAverage1m = Math.min(10, cpuUsage / 10 + randomFloat(-0.5, 1));
  
  return {
    serverId: id,
    serverName: name,
    cpuUsage: parseFloat(cpuUsage.toFixed(2)),
    memoryUsage: parseFloat(memoryUsage.toFixed(2)),
    diskUsage: parseFloat(diskUsage.toFixed(2)),
    networkIO: {
      inbound: parseFloat(networkIn.toFixed(2)),
      outbound: parseFloat(networkOut.toFixed(2))
    },
    loadAverage1m: parseFloat(loadAverage1m.toFixed(2)),
    timestamp: Date.now()
  };
}

// 生成多个服务器核心指标数据
export function generateServerMetricsList(count: number): ServerMetrics[] {
  const metrics: ServerMetrics[] = [];
  for (let i = 0; i < count; i++) {
    metrics.push(generateServerMetrics());
  }
  return metrics;
}

// 生成负载均衡数据
export function generateLoadBalancerData(): LoadBalancerData {
  const nodeCount = randomInt(3, 8);
  const nodes = [];
  
  // 生成节点数据，确保有一定的负载差异
  const baseLoad = randomFloat(10, 50);
  
  for (let i = 0; i < nodeCount; i++) {
    const loadVariation = randomFloat(0.5, 2.5); // 负载变化系数
    const netIn = baseLoad * loadVariation + randomFloat(-5, 10);
    const netOut = netIn * 0.8 + randomFloat(-3, 8);
    
    // 根据负载确定节点状态
    let status: 'healthy' | 'warning' | 'error';
    if (netIn > baseLoad * 2) {
      status = Math.random() > 0.5 ? 'warning' : 'error';
    } else if (netIn < baseLoad * 0.7) {
      status = Math.random() > 0.7 ? 'warning' : 'healthy';
    } else {
      status = 'healthy';
    }
    
    nodes.push({
      id: generateId('node-'),
      name: randomServerName(),
      netIn: parseFloat(Math.max(0.1, netIn).toFixed(2)),
      netOut: parseFloat(Math.max(0.1, netOut).toFixed(2)),
      status
    });
  }
  
  // 计算是否负载不均衡
  const netInValues = nodes.map(node => node.netIn);
  const maxNetIn = Math.max(...netInValues);
  const minNetIn = Math.min(...netInValues);
  const ratio = maxNetIn / minNetIn;
  const isImbalanced = ratio > 3;
  
  return {
    id: generateId('lb-'),
    name: `负载均衡器-${randomInt(1, 99)}`,
    nodes,
    isImbalanced,
    ratio: parseFloat(ratio.toFixed(2)),
    timestamp: Date.now()
  };
}

// 生成多个负载均衡数据
export function generateLoadBalancerDataList(count: number): LoadBalancerData[] {
  const lbData: LoadBalancerData[] = [];
  for (let i = 0; i < count; i++) {
    lbData.push(generateLoadBalancerData());
  }
  return lbData;
}

// 生成时序数据点
export function generateTimeSeriesDataPoint(timestamp?: number): TimeSeriesDataPoint {
  const time = timestamp || Date.now();
  
  // 生成具有一定关联性的指标数据
  const baseLoad = randomFloat(0.3, 0.8);
  const cpu = baseLoad * 100 + randomFloat(-10, 15);
  const memory = baseLoad * 90 + randomFloat(-5, 10);
  const disk = randomFloat(40, 80);
  
  return {
    timestamp: time,
    cpu: parseFloat(Math.min(100, Math.max(0, cpu)).toFixed(2)),
    memory: parseFloat(Math.min(100, Math.max(0, memory)).toFixed(2)),
    disk: parseFloat(Math.min(100, Math.max(0, disk)).toFixed(2))
  };
}

// 生成时序数据序列（最近N分钟）
export function generateTimeSeriesData(minutes = 15, intervalSeconds = 60): TimeSeriesDataPoint[] {
  const data: TimeSeriesDataPoint[] = [];
  const now = Date.now();
  const intervalMs = intervalSeconds * 1000;
  const pointsCount = Math.floor(minutes * 60 / intervalSeconds);
  
  // 生成基准值，用于创建平滑变化的数据
  let baseCpu = randomFloat(30, 70);
  let baseMemory = randomFloat(40, 75);
  let baseDisk = randomFloat(50, 70);
  
  for (let i = pointsCount - 1; i >= 0; i--) {
    const timestamp = now - i * intervalMs;
    
    // 平滑变化，避免剧烈波动
    baseCpu += randomFloat(-5, 5);
    baseCpu = Math.min(95, Math.max(5, baseCpu));
    
    baseMemory += randomFloat(-3, 3);
    baseMemory = Math.min(90, Math.max(20, baseMemory));
    
    baseDisk += randomFloat(-1, 1);
    baseDisk = Math.min(85, Math.max(30, baseDisk));
    
    data.push({
      timestamp,
      cpu: parseFloat(baseCpu.toFixed(2)),
      memory: parseFloat(baseMemory.toFixed(2)),
      disk: parseFloat(baseDisk.toFixed(2))
    });
  }
  
  return data;
}

// 生成初始数据配置
export function generateInitialDataConfig(): DataGenerationConfig {
  return {
    serversCount: randomInt(5, 12),
    tasksCount: randomInt(8, 20),
    alertsCount: randomInt(5, 15),
    updateInterval: randomInt(1000, 2000), // 1-2秒更新间隔
    historyRetentionMinutes: 15
  };
}

// 生成系统指标（与generateServerMetricsList相同，但用于不同的使用场景）
export function generateSystemMetrics(): ServerMetrics[] {
  return generateServerMetricsList(randomInt(5, 12));
}

// 更新系统指标
export function updateSystemMetrics(currentMetrics: ServerMetrics[]): ServerMetrics[] {
  return currentMetrics.map(metric => {
    // 在原有基础上进行小幅变动
    const cpuChange = randomFloat(-5, 5);
    const memoryChange = randomFloat(-3, 3);
    const diskChange = randomFloat(-1, 1);
    const networkInChange = randomFloat(-10, 10);
    const networkOutChange = randomFloat(-8, 8);
    const loadChange = randomFloat(-0.5, 0.5);
    
    return {
      ...metric,
      cpuUsage: parseFloat(Math.min(100, Math.max(0, metric.cpuUsage + cpuChange)).toFixed(2)),
      memoryUsage: parseFloat(Math.min(100, Math.max(0, metric.memoryUsage + memoryChange)).toFixed(2)),
      diskUsage: parseFloat(Math.min(100, Math.max(0, metric.diskUsage + diskChange)).toFixed(2)),
      networkIO: {
        inbound: parseFloat(Math.max(0.1, metric.networkIO.inbound + networkInChange).toFixed(2)),
        outbound: parseFloat(Math.max(0.1, metric.networkIO.outbound + networkOutChange).toFixed(2))
      },
      loadAverage1m: parseFloat(Math.min(10, Math.max(0, metric.loadAverage1m + loadChange)).toFixed(2)),
      timestamp: Date.now()
    };
  });
}

// 生成监控任务（与generateMonitorTasks相同，但用于不同的使用场景）
export function generateMonitorTasksList(): MonitorTask[] {
  return generateMonitorTasks(randomInt(8, 20));
}

// 更新监控任务
export function updateMonitorTasks(currentTasks: MonitorTask[]): MonitorTask[] {
  return currentTasks.map(task => {
    // 只更新运行中的任务
    if (task.status === 'running') {
      const progressIncrement = randomInt(1, 10);
      const newProgress = Math.min(100, task.progress + progressIncrement);
      
      // 随机决定任务是否完成或失败
      let newStatus: 'queued' | 'running' | 'failed' | 'completed' = task.status;
      if (newProgress >= 100) {
        const rand = Math.random();
        if (rand > 0.9) {
          newStatus = 'failed';
        } else {
          newStatus = 'completed';
        }
      }
      
      return {
        ...task,
        progress: newProgress,
        status: newStatus,
        updatedAt: Date.now()
      };
    }
    
    // 随机将排队中的任务转为运行中
    if (task.status === 'queued' && Math.random() > 0.7) {
      return {
        ...task,
        status: 'running',
        progress: randomInt(5, 20),
        updatedAt: Date.now()
      };
    }
    
    return task;
  });
}

// 生成新告警（基于系统指标）
export function generateNewAlert(metrics: ServerMetrics[]): AlertData | null {
  // 检查metrics数组是否为空或未定义
  if (!metrics || metrics.length === 0) {
    return null;
  }
  
  // 10%概率生成新告警
  if (Math.random() > 0.9) {
    const server = metrics[randomInt(0, metrics.length - 1)];
    
    // 确保server对象及其属性存在
    if (!server || typeof server.cpuUsage !== 'number') {
      return null;
    }
    
    let severity: AlertData['severity'] = 'low';
    let description = '';
    
    // 根据指标确定告警级别和描述
    if (server.cpuUsage > 90) {
      severity = 'critical';
      description = `服务器 ${server.serverName || '未知服务器'} CPU使用率超过90%`;
    } else if (server.memoryUsage > 90) {
      severity = 'critical';
      description = `服务器 ${server.serverName || '未知服务器'} 内存使用率超过90%`;
    } else if (server.diskUsage > 90) {
      severity = 'high';
      description = `服务器 ${server.serverName || '未知服务器'} 磁盘使用率超过90%`;
    } else if (server.loadAverage1m > 5) {
      severity = 'high';
      description = `服务器 ${server.serverName || '未知服务器'} 负载过高`;
    } else if (server.cpuUsage > 80) {
      severity = 'medium';
      description = `服务器 ${server.serverName || '未知服务器'} CPU使用率较高`;
    } else if (server.memoryUsage > 80) {
      severity = 'medium';
      description = `服务器 ${server.serverName || '未知服务器'} 内存使用率较高`;
    } else {
      // 随机生成低级别告警
      severity = 'low';
      description = `服务器 ${server.serverName || '未知服务器'} 出现轻微性能波动`;
    }
    
    return {
      id: generateId('alert-'),
      timestamp: Date.now(),
      sourceServer: server.serverName || '未知服务器',
      severity,
      description,
      acknowledged: false
    };
  }
  
  return null;
}

// 生成负载均衡状态（与generateLoadBalancerDataList相同，但用于不同的使用场景）
export function generateLoadBalancerStatus(): LoadBalancerData[] {
  return generateLoadBalancerDataList(randomInt(2, 4));
}

// 更新负载均衡状态
export function updateLoadBalancerStatus(currentLBData: LoadBalancerData[]): LoadBalancerData[] {
  return currentLBData.map(lb => {
    // 更新每个节点的网络IO
    const updatedNodes = lb.nodes.map(node => {
      const netInChange = randomFloat(-5, 5);
      const netOutChange = randomFloat(-4, 4);
      const newNetIn = parseFloat(Math.max(0.1, node.netIn + netInChange).toFixed(2));
      const newNetOut = parseFloat(Math.max(0.1, node.netOut + netOutChange).toFixed(2));
      
      // 根据新的网络IO更新节点状态
      const avgNetIn = lb.nodes.reduce((sum, n) => sum + n.netIn, 0) / lb.nodes.length;
      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      
      if (newNetIn > avgNetIn * 2) {
        status = Math.random() > 0.5 ? 'warning' : 'error';
      } else if (newNetIn < avgNetIn * 0.5) {
        status = Math.random() > 0.7 ? 'warning' : 'healthy';
      }
      
      return {
        ...node,
        netIn: newNetIn,
        netOut: newNetOut,
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