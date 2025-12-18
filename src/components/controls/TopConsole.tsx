import React from 'react';
import { Play, Pause, RefreshCw, Moon, Sun, Search, User, Menu } from 'lucide-react';
import { useMonitoringDataStore } from '../../stores/monitoringDataStore';
import { useAppStore } from '../../stores/appStore';
import styles from './TopConsole.module.css';

interface TopConsoleProps {
  onMenuToggle?: () => void;
}

const TopConsole: React.FC<TopConsoleProps> = ({ onMenuToggle }) => {
  const { 
    dataStreamState,
    startDataStream,
    pauseDataStream,
    refreshData,
    setFilterText,
  } = useMonitoringDataStore();
  
  const { theme, toggleTheme } = useAppStore();
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchText = e.target.value;
    // 更新过滤文本到store中
    setFilterText(searchText);
  };
  
  const handleToggleDataStream = () => {
    if (dataStreamState.isRunning) {
      pauseDataStream();
    } else {
      startDataStream();
    }
  };
  
  const handleRefresh = () => {
    refreshData();
  };
  
  const handleToggleTheme = () => {
    toggleTheme();
  };
  
  return (
    <div className={styles.topConsole}>
      <div className={styles.leftSection}>
        {/* 移动端菜单按钮 */}
        <button
          className={`${styles.controlButton} ${styles.mobileMenuButton}`}
          onClick={onMenuToggle}
          title="菜单"
        >
          <Menu size={18} />
        </button>
        
        <button
          className={styles.controlButton}
          onClick={handleToggleDataStream}
          title={dataStreamState.isRunning ? '暂停数据流' : '启动数据流'}
        >
          {dataStreamState.isRunning ? (
            <Pause size={18} />
          ) : (
            <Play size={18} />
          )}
        </button>
        
        <button
          className={styles.controlButton}
          onClick={handleRefresh}
          title="刷新数据"
        >
          <RefreshCw size={18} />
        </button>
        
        <button
          className={styles.controlButton}
          onClick={handleToggleTheme}
          title="切换主题"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
      
      <div className={styles.centerSection}>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="按服务器名/标签/区域搜索..."
            className={styles.searchInput}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      
      <div className={styles.rightSection}>
        <div className={styles.userInfo}>
          <User size={18} />
          <span>admin@monitor.com</span>
        </div>
      </div>
    </div>
  );
};

export default TopConsole;