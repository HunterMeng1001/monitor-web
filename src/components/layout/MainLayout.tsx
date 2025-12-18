import { useState, useEffect } from 'react';
import TopConsole from '../controls/TopConsole';
import Sidebar from './Sidebar';
import SystemStatus from '../status/SystemStatus';
import MainVisualization from '../charts/MainVisualization';
import { useDataStream } from '../../hooks/useDataStream';
import { useAppStore } from '../../stores/appStore';
import { Menu, X } from 'lucide-react';
import styles from './MainLayout.module.css';

const MainLayout = () => {
  // 初始化数据流
  const { refreshData } = useDataStream();
  const { dataStream, setTheme } = useAppStore();
  
  // 初始化主题
  useEffect(() => {
    // 从localStorage恢复主题设置
    const savedTheme = localStorage.getItem('app-store');
    if (savedTheme) {
      try {
        const parsedState = JSON.parse(savedTheme);
        if (parsedState.state && parsedState.state.theme) {
          setTheme(parsedState.state.theme);
        }
      } catch (error) {
        console.error('Failed to parse saved theme:', error);
      }
    } else {
      // 默认设置深色主题
      setTheme('dark');
    }
  }, [setTheme]);
  
  // 确保数据流启动
  useEffect(() => {
    if (dataStream.isRunning) {
      refreshData();
    }
  }, [dataStream.isRunning, refreshData]);
  
  // 侧边栏折叠状态
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [screenSize, setScreenSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // 检测屏幕尺寸
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width >= 1200) {
        setScreenSize('desktop');
        // 桌面端默认展开侧边栏
        setIsSidebarCollapsed(false);
        setIsMobileMenuOpen(false);
      } else if (width >= 768) {
        setScreenSize('tablet');
        // 平板端默认折叠侧边栏
        setIsSidebarCollapsed(true);
        setIsMobileMenuOpen(false);
      } else {
        setScreenSize('mobile');
        // 移动端默认隐藏侧边栏
        setIsSidebarCollapsed(false);
        setIsMobileMenuOpen(false);
      }
    };
    
    // 初始检查
    checkScreenSize();
    
    // 监听窗口大小变化
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);
  
  // 切换侧边栏折叠状态
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  // 切换移动端菜单
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <div className={styles.mainLayout}>
      <div className={styles.topConsole}>
        <TopConsole onMenuToggle={toggleMobileMenu} />
      </div>
      
      <div className={styles.contentArea}>
        <div className={`${styles.sidebar} ${isSidebarCollapsed ? styles.collapsed : ''} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
          {/* 桌面端和平板端显示折叠按钮 */}
          {screenSize !== 'mobile' && (
            <button 
              className={styles.collapseButton}
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'}
            >
              {isSidebarCollapsed ? <Menu size={18} /> : <X size={18} />}
            </button>
          )}
          <Sidebar isCollapsed={isSidebarCollapsed && screenSize !== 'mobile'} />
        </div>
        
        <div className={styles.rightPanel}>
          <div className={styles.systemStatus}>
            <SystemStatus />
          </div>
          
          <div className={styles.mainVisualization}>
            <MainVisualization />
          </div>
        </div>
      </div>
      
      {/* 移动端遮罩层 */}
      {screenSize === 'mobile' && isMobileMenuOpen && (
        <div 
          className={styles.overlay}
          onClick={toggleMobileMenu}
        />
      )}
    </div>
  );
};

export default MainLayout;