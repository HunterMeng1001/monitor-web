import { useEffect, useRef, useCallback } from 'react';
import { useMonitoringDataStore } from '../stores/monitoringDataStore';
import {
  generateSystemMetrics,
  updateSystemMetrics,
  generateMonitorTasksList,
  updateMonitorTasks,
  generateAlertDataList,
  generateNewAlert,
  generateLoadBalancerStatus,
  updateLoadBalancerStatus,
  generateTimeSeriesDataPoint,
} from '../utils/mockDataGenerator';

export const useDataStream = () => {
  const { 
    dataStreamState,
    setServers,
    setTasks,
    setAlerts,
    setLoadBalancers,
    setHistoryData,
    addHistoryDataPoint,
    setSystemHealth,
    setDataStreamState,
    pauseDataStream,
  } = useMonitoringDataStore();
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initializedRef = useRef(false);
  
  // 初始化数据
  const initializeData = useCallback(() => {
    if (initializedRef.current) return;
    
    // 生成初始数据
    const initialServers = generateSystemMetrics();
    const initialTasks = generateMonitorTasksList();
    const initialAlerts = generateAlertDataList(10);
    const initialLoadBalancers = generateLoadBalancerStatus();
    const initialHistoryData = Array.from({ length: 15 }, (_, i) => {
      const timestamp = Date.now() - (15 - i) * 60 * 1000;
      return generateTimeSeriesDataPoint(timestamp);
    });
    
    // 设置初始数据
    setServers(initialServers);
    setTasks(initialTasks);
    setAlerts(initialAlerts);
    setLoadBalancers(initialLoadBalancers);
    setHistoryData(initialHistoryData);
    
    initializedRef.current = true;
    
    // 直接更新dataStreamState而不是调用refreshData，避免潜在的循环依赖
    setDataStreamState({
      lastUpdate: Date.now(),
      connectionStatus: 'connected',
      error: null
    });
  }, [setServers, setTasks, setAlerts, setLoadBalancers, setHistoryData, setDataStreamState]);
  
  // 更新数据
  const updateData = useCallback(() => {
    // 从store获取当前服务器数据，而不是依赖闭包中的servers
    const currentServers = useMonitoringDataStore.getState().servers;
    
    // 确保数据已初始化
    if (!initializedRef.current || currentServers.length === 0) {
      return;
    }
    
    // 更新系统指标
    const updatedServers = updateSystemMetrics(currentServers);
    setServers(updatedServers);
    
    // 添加到历史记录
    const historyDataPoint = generateTimeSeriesDataPoint();
    addHistoryDataPoint(historyDataPoint);
    
    // 更新监控任务
    const currentTasks = useMonitoringDataStore.getState().tasks;
    const updatedTasks = updateMonitorTasks(currentTasks);
    setTasks(updatedTasks);
    
    // 生成新告警
    const newAlert = generateNewAlert(updatedServers);
    if (newAlert) {
      const currentAlerts = useMonitoringDataStore.getState().alerts;
      setAlerts([newAlert, ...currentAlerts].slice(0, 100)); // 限制告警数量
    }
    
    // 更新负载均衡状态
    const currentLoadBalancers = useMonitoringDataStore.getState().loadBalancers;
    const updatedLoadBalancers = updateLoadBalancerStatus(currentLoadBalancers);
    setLoadBalancers(updatedLoadBalancers);
    
    // 计算系统健康状态
    const unhealthyCount = updatedServers.filter(server => 
      server.cpuUsage > 85 || server.memoryUsage > 90 || server.loadAverage1m > 5
    ).length;
    
    if (unhealthyCount === 0) {
      setSystemHealth('healthy');
    } else if (unhealthyCount < updatedServers.length / 2) {
      setSystemHealth('warning');
    } else {
      setSystemHealth('error');
    }
    
    // 直接更新dataStreamState而不是调用refreshData，避免潜在的循环依赖
    setDataStreamState({
      lastUpdate: Date.now(),
      connectionStatus: 'connected',
      error: null
    });
  }, [setServers, addHistoryDataPoint, setTasks, setAlerts, setLoadBalancers, setSystemHealth, setDataStreamState]);
  
  // 启动数据流
  useEffect(() => {
    if (dataStreamState.isRunning) {
      // 初始化数据（如果还没有初始化）
      initializeData();
      
      // 设置定时更新
      intervalRef.current = setInterval(() => {
        updateData();
      }, dataStreamState.updateInterval);
    } else {
      // 停止数据流
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [dataStreamState.isRunning, dataStreamState.updateInterval, initializeData, updateData]);
  
  // 确保数据流启动
  useEffect(() => {
    if (!initializedRef.current && dataStreamState.isRunning) {
      initializeData();
    }
  }, [dataStreamState.isRunning, initializeData]);
  
  // 手动刷新数据
  const refreshDataHandler = useCallback(() => {
    updateData();
  }, [updateData]);
  
  // 重置数据
  const resetData = useCallback(() => {
    initializedRef.current = false;
    initializeData();
  }, [initializeData]);
  
  return {
    refreshData: refreshDataHandler,
    resetData,
    isInitialized: initializedRef.current,
  };
};