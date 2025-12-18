import { useState, useEffect } from 'react';
import { Cpu, HardDrive, Activity, Zap, AlertTriangle } from 'lucide-react';
import { useMonitoringDataStore } from '../../stores/monitoringDataStore';
import { HealthStatus } from '../../types/monitoring';
import styles from './SystemStatus.module.css';

const SystemStatus = () => {
  const { getFilteredServers, loadBalancers, systemHealth } = useMonitoringDataStore();
  
  // 获取过滤后的服务器数据
  const servers = getFilteredServers();
  
  // 计算聚合指标
  const avgCpuUsage = servers.length > 0 
    ? servers.reduce((sum, server) => sum + server.cpuUsage, 0) / servers.length 
    : 0;
  
  const avgMemoryUsage = servers.length > 0 
    ? servers.reduce((sum, server) => sum + server.memoryUsage, 0) / servers.length 
    : 0;
  
  const avgDiskUsage = servers.length > 0 
    ? servers.reduce((sum, server) => sum + server.diskUsage, 0) / servers.length 
    : 0;
  
  const totalNetworkIn = servers.reduce((sum, server) => sum + server.networkIO.inbound, 0);
  const totalNetworkOut = servers.reduce((sum, server) => sum + server.networkIO.outbound, 0);
  
  // 计算健康度
  const healthyCount = servers.filter(server => {
    // 使用与数据管理器相同的健康度判断逻辑
    if (server.cpuUsage > 85 || server.memoryUsage > 90 || server.loadAverage1m > 5) {
      return false;
    }
    return true;
  }).length;
  
  const warningCount = servers.filter(server => {
    if (server.cpuUsage > 70 || server.memoryUsage > 80 || server.loadAverage1m > 3) {
      return true;
    }
    return false;
  }).length;
  
  const getHealthColor = () => {
    if (systemHealth === 'error') return 'var(--color-danger)';
    if (systemHealth === 'warning') return 'var(--color-warning)';
    return 'var(--color-success)';
  };
  
  const getHealthStatus = () => {
    if (systemHealth === 'error') return '异常';
    if (systemHealth === 'warning') return '警告';
    return '正常';
  };
  
  const getHealthIcon = () => {
    if (systemHealth === 'error') return <AlertTriangle size={16} />;
    if (systemHealth === 'warning') return <AlertTriangle size={16} />;
    return null;
  };
  
  const MetricCard = ({ icon, title, value, unit, color }: {
    icon: React.ReactNode;
    title: string;
    value: number;
    unit: string;
    color: string;
  }) => (
    <div className={styles.metricCard}>
      <div className={styles.metricIcon} style={{ color }}>
        {icon}
      </div>
      <div className={styles.metricContent}>
        <div className={styles.metricTitle}>{title}</div>
        <div className={styles.metricValue}>
          {value.toFixed(1)}{unit}
        </div>
      </div>
    </div>
  );
  
  return (
    <div className={styles.systemStatus}>
      <div className={styles.header}>
        <h3 className={styles.title}>系统状态</h3>
        <div className={styles.healthIndicator}>
          <div 
            className={styles.healthDot}
            style={{ backgroundColor: getHealthColor() }}
          />
          <span 
            className={styles.healthText}
            style={{ color: getHealthColor() }}
          >
            {getHealthStatus()}
          </span>
          {getHealthIcon()}
        </div>
      </div>
      
      <div className={styles.metricsGrid}>
        <MetricCard
          icon={<Cpu size={20} />}
          title="CPU使用率"
          value={avgCpuUsage}
          unit="%"
          color="var(--color-primary)"
        />
        
        <MetricCard
          icon={<Activity size={20} />}
          title="内存使用率"
          value={avgMemoryUsage}
          unit="%"
          color="var(--color-success)"
        />
        
        <MetricCard
          icon={<HardDrive size={20} />}
          title="磁盘使用率"
          value={avgDiskUsage}
          unit="%"
          color="var(--color-warning)"
        />
        
        <MetricCard
          icon={<Zap size={20} />}
          title="网络流量"
          value={totalNetworkIn + totalNetworkOut}
          unit="MB/s"
          color="var(--color-chart-5)"
        />
      </div>
      
      <div className={styles.loadBalancers}>
        <h4 className={styles.sectionTitle}>负载均衡状态</h4>
        <div className={styles.lbList}>
          {loadBalancers.map(lb => (
            <div key={lb.id} className={styles.lbItem}>
              <div className={styles.lbHeader}>
                <span className={styles.lbName}>{lb.name}</span>
                <span 
                  className={styles.lbStatus}
                  style={{ 
                    color: lb.isImbalanced ? 'var(--color-danger)' : 'var(--color-success)'
                  }}
                >
                  {lb.isImbalanced ? `倾斜 (比值: ${lb.ratio.toFixed(1)})` : '均衡'}
                </span>
              </div>
              <div className={styles.lbNodes}>
                {lb.nodes.map(node => (
                  <div key={node.id} className={styles.nodeItem}>
                    <div 
                      className={styles.nodeStatus}
                      style={{ 
                        backgroundColor: node.status === 'healthy' ? 'var(--color-success)' :
                                        node.status === 'warning' ? 'var(--color-warning)' :
                                        'var(--color-danger)'
                      }}
                    />
                    <span className={styles.nodeName}>{node.name}</span>
                    <span className={styles.nodeLoad}>
                      入: {node.netIn.toFixed(1)}MB/s | 出: {node.netOut.toFixed(1)}MB/s
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;