import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeType, DataStreamState, FilterCriteria, AppState } from '../types';

interface AppStore extends AppState {
  // 主题相关
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
  
  // 数据流相关
  startDataStream: () => void;
  stopDataStream: () => void;
  setUpdateInterval: (interval: number) => void;
  updateLastUpdateTime: () => void;
  
  // 过滤器相关
  setFilters: (filters: Partial<FilterCriteria>) => void;
  clearFilters: () => void;
  setSearchText: (text: string) => void;
  
  // 服务器选择
  selectServer: (serverId: string) => void;
  deselectServer: (serverId: string) => void;
  toggleServerSelection: (serverId: string) => void;
  selectAllServers: (serverIds: string[]) => void;
  deselectAllServers: () => void;
  
  // 时间范围
  setTimeRange: (minutes: number) => void;
}

const initialState: AppState = {
  theme: 'dark',
  dataStream: {
    isRunning: true,
    updateInterval: 1500, // 1.5秒，与monitoringDataStore保持一致
    lastUpdate: Date.now(),
    autoRefresh: true,
    connectionStatus: 'connected',
    error: null,
    retryCount: 0,
  },
  filters: {
    searchText: '',
    regions: [],
    tags: [],
    status: [],
    health: [],
  },
  selectedServers: [],
  timeRange: 15, // 15分钟
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // 主题相关
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        
        // 更新DOM属性
        document.documentElement.setAttribute('data-theme', newTheme);
      },
      
      setTheme: (theme: ThemeType) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },
      
      // 数据流相关
      startDataStream: () => {
        set((state) => ({
          dataStream: { ...state.dataStream, isRunning: true },
        }));
      },
      
      stopDataStream: () => {
        set((state) => ({
          dataStream: { ...state.dataStream, isRunning: false },
        }));
      },
      
      setUpdateInterval: (interval: number) => {
        set((state) => ({
          dataStream: { ...state.dataStream, updateInterval: interval },
        }));
      },
      
      updateLastUpdateTime: () => {
        set((state) => ({
          dataStream: { ...state.dataStream, lastUpdate: Date.now() },
        }));
      },
      
      // 过滤器相关
      setFilters: (filters: Partial<FilterCriteria>) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },
      
      clearFilters: () => {
        set({
          filters: {
            searchText: '',
            regions: [],
            tags: [],
            status: [],
            health: [],
          },
        });
      },
      
      setSearchText: (text: string) => {
        set((state) => ({
          filters: { ...state.filters, searchText: text },
        }));
      },
      
      // 服务器选择
      selectServer: (serverId: string) => {
        set((state) => ({
          selectedServers: [...state.selectedServers, serverId],
        }));
      },
      
      deselectServer: (serverId: string) => {
        set((state) => ({
          selectedServers: state.selectedServers.filter(id => id !== serverId),
        }));
      },
      
      toggleServerSelection: (serverId: string) => {
        const { selectedServers } = get();
        if (selectedServers.includes(serverId)) {
          get().deselectServer(serverId);
        } else {
          get().selectServer(serverId);
        }
      },
      
      selectAllServers: (serverIds: string[]) => {
        set({ selectedServers: [...serverIds] });
      },
      
      deselectAllServers: () => {
        set({ selectedServers: [] });
      },
      
      // 时间范围
      setTimeRange: (minutes: number) => {
        set({ timeRange: minutes });
      },
    }),
    {
      name: 'monitor-web-app-store',
      partialize: (state) => ({
        theme: state.theme,
        filters: state.filters,
        selectedServers: state.selectedServers,
        timeRange: state.timeRange,
      }),
    }
  )
);

// 初始化主题
const initializeTheme = () => {
  const theme = useAppStore.getState().theme;
  document.documentElement.setAttribute('data-theme', theme);
};

// 在应用启动时初始化主题
if (typeof window !== 'undefined') {
  initializeTheme();
}