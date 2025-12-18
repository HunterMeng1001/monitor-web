import React, { useState } from 'react';
import { Activity, AlertTriangle } from 'lucide-react';
import { useMonitoringDataStore } from '../../stores/monitoringDataStore';
import TaskDetailModal from '../tasks/TaskDetailModal';
import { MonitorTask, AlertData } from '../../types/monitoring';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false }) => {
  const { getFilteredTasks, getFilteredAlerts } = useMonitoringDataStore();
  const [selectedTask, setSelectedTask] = useState<MonitorTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 获取过滤后的任务和告警
  const tasks = getFilteredTasks();
  const alerts = getFilteredAlerts();
  
  const handleTaskClick = (task: MonitorTask) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };
  
  const getStatusColor = (status: MonitorTask['status']) => {
    switch (status) {
      case 'running':
        return 'var(--color-primary)';
      case 'completed':
        return 'var(--color-success)';
      case 'failed':
        return 'var(--color-danger)';
      case 'queued':
        return 'var(--color-text-tertiary)';
      default:
        return 'var(--color-text-tertiary)';
    }
  };
  
  const getAlertLevelColor = (level: AlertData['severity']) => {
    switch (level) {
      case 'critical':
        return 'var(--color-danger)';
      case 'high':
        return 'var(--color-danger-light)';
      case 'medium':
        return 'var(--color-warning)';
      case 'low':
        return 'var(--color-primary)';
      default:
        return 'var(--color-text-tertiary)';
    }
  };
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}小时前`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}天前`;
  };
  
  // 折叠状态下只显示图标
  if (isCollapsed) {
    return (
      <div className={`${styles.sidebar} ${styles.collapsed}`}>
        <div className={styles.iconSection}>
          <div className={styles.iconItem} title="监控任务">
            <Activity size={20} />
            {tasks.length > 0 && (
              <span className={styles.iconBadge}>{tasks.length}</span>
            )}
          </div>
          
          <div className={styles.iconItem} title="异常告警">
            <AlertTriangle size={20} />
            {alerts.length > 0 && (
              <span className={`${styles.iconBadge} ${styles.alertBadge}`}>{alerts.length}</span>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.sidebar}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>监控任务</h3>
        <div className={styles.taskList}>
          {tasks.map(task => (
            <div 
              key={task.id} 
              className={styles.taskItem}
              onClick={() => handleTaskClick(task)}
            >
              <div className={styles.taskHeader}>
                <span className={styles.taskName}>{task.name}</span>
                <span 
                  className={styles.taskStatus}
                  style={{ color: getStatusColor(task.status) }}
                >
                  {task.status === 'running' ? '运行中' : 
                   task.status === 'completed' ? '已完成' :
                   task.status === 'failed' ? '失败' : '排队中'}
                </span>
              </div>
              <div className={styles.taskProgress}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ 
                      width: `${task.progress}%`,
                      backgroundColor: getStatusColor(task.status)
                    }}
                  />
                </div>
                <span className={styles.progressText}>{task.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>异常告警</h3>
        <div className={styles.alertList}>
          {alerts.slice(0, 10).map(alert => (
            <div key={alert.id} className={styles.alertItem}>
              <div className={styles.alertHeader}>
                <div className={styles.alertLevel}>
                  <div 
                    className={styles.levelIndicator}
                    style={{ backgroundColor: getAlertLevelColor(alert.severity) }}
                  />
                  <span 
                    className={styles.levelText}
                    style={{ color: getAlertLevelColor(alert.severity) }}
                  >
                    {alert.severity === 'critical' ? '严重' :
                     alert.severity === 'high' ? '高' :
                     alert.severity === 'medium' ? '中' : '低'}
                  </span>
                </div>
                <span className={styles.alertTime}>{formatTime(alert.timestamp)}</span>
              </div>
              <div className={styles.alertTitle}>{alert.sourceServer}</div>
              <div className={styles.alertMessage}>{alert.description}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 任务详情模态框 */}
      <TaskDetailModal 
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default Sidebar;