import React from 'react';
import { X, Clock, Server, AlertCircle } from 'lucide-react';
import { MonitorTask } from '../../types/monitoring';
import styles from './TaskDetailModal.module.css';

interface TaskDetailModalProps {
  task: MonitorTask | null;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose }) => {
  if (!isOpen || !task) return null;
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'queued': return '排队中';
      case 'running': return '运行中';
      case 'failed': return '失败';
      case 'completed': return '已完成';
      default: return status;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'var(--color-primary)';
      case 'completed': return 'var(--color-success)';
      case 'failed': return 'var(--color-danger)';
      case 'queued': return 'var(--color-text-tertiary)';
      default: return 'var(--color-text-tertiary)';
    }
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  const calculateDuration = (startTime: number, endTime?: number) => {
    const end = endTime || Date.now();
    const duration = end - startTime;
    
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}分${seconds}秒`;
    } else {
      return `${seconds}秒`;
    }
  };
  
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>任务详情</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.taskInfo}>
            <div className={styles.taskName}>{task.name}</div>
            <div className={styles.taskMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>任务ID:</span>
                <span className={styles.metaValue}>{task.id}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>目标集群:</span>
                <span className={styles.metaValue}>{task.targetCluster}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>状态:</span>
                <span 
                  className={styles.statusValue}
                  style={{ color: getStatusColor(task.status) }}
                >
                  {getStatusText(task.status)}
                </span>
              </div>
            </div>
          </div>
          
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>进度</span>
              <span className={styles.progressValue}>{task.progress}%</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ 
                  width: `${task.progress}%`,
                  backgroundColor: getStatusColor(task.status)
                }}
              />
            </div>
          </div>
          
          <div className={styles.timeInfo}>
            <div className={styles.timeItem}>
              <Clock size={16} className={styles.timeIcon} />
              <div className={styles.timeDetails}>
                <div className={styles.timeLabel}>创建时间</div>
                <div className={styles.timeValue}>{formatDate(task.createdAt)}</div>
              </div>
            </div>
            
            <div className={styles.timeItem}>
              <Clock size={16} className={styles.timeIcon} />
              <div className={styles.timeDetails}>
                <div className={styles.timeLabel}>最后更新</div>
                <div className={styles.timeValue}>{formatDate(task.updatedAt)}</div>
              </div>
            </div>
            
            <div className={styles.timeItem}>
              <Server size={16} className={styles.timeIcon} />
              <div className={styles.timeDetails}>
                <div className={styles.timeLabel}>执行时长</div>
                <div className={styles.timeValue}>
                  {calculateDuration(task.createdAt, task.updatedAt)}
                </div>
              </div>
            </div>
          </div>
          
          {task.status === 'failed' && (
            <div className={styles.errorInfo}>
              <AlertCircle size={16} className={styles.errorIcon} />
              <div className={styles.errorDetails}>
                <div className={styles.errorLabel}>错误信息</div>
                <div className={styles.errorMessage}>
                  任务执行过程中发生错误，请检查目标集群状态或任务配置。
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;