import { useState, useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { useMonitoringDataStore } from '../../stores/monitoringDataStore';
import { useAppStore } from '../../stores/appStore';
import { BarChart3, LineChart, PieChart, Activity, Play, Pause, RotateCcw } from 'lucide-react';
import styles from './MainVisualization.module.css';

type ChartType = 'line' | 'bar' | 'pie' | 'gauge';
type ViewDimension = 'server' | 'region' | 'service';

// 主题相关的ECharts样式配置对象
const chartThemes = {
  dark: {
    // 深色主题配置
    colors: [
      '#40a9ff', // 科技浅蓝 - 高对比度
      '#52c41a', // 荧光青 - 高对比度
      '#faad14', // 暖黄 - 高对比度
      '#722ed1', // 淡紫 - 高对比度
      '#13c2c2', // 青绿色 - 高对比度
      '#eb2f96'  // 粉红色 - 高对比度
    ],
    textColor: '#f0f2f5', // 高对比度浅色文本
    axisColor: '#e0e0e0', // 浅灰色坐标轴线条
    splitLineColor: '#4a5568', // 中等灰色分割线
    tooltipBackgroundColor: 'rgba(10, 25, 47, 0.85)', // 半透明深色背景
    tooltipBorderColor: '#40a9ff', // 高对比度颜色作为边框
    gaugeColors: {
      normal: '#52c41a', // 绿色（正常）
      warning: '#faad14', // 黄色（警告）
      danger: '#ff4d4f' // 红色（危险）
    }
  },
  light: {
    // 浅色主题配置 - 优化版本
    colors: [
      '#1890ff', // 深蓝色 - 服务器1
      '#52c41a', // 深绿色 - 服务器2
      '#d4380d', // 深橙色 - 服务器3
      '#531dab', // 深紫色 - 服务器4
      '#006d75', // 深青色 - 服务器5
      '#c41d7f'  // 深粉红色 - 服务器6
    ],
    textColor: '#1f2329', // 深色系文本 - 标题使用，加粗
    axisTextColor: '#333333', // 深色系文本 - 坐标轴文本使用，确保对比度≥4.5:1
    legendTextColor: '#262626', // 深色系文本 - 图例文本使用
    axisColor: '#808080', // 深灰色坐标轴线条
    splitLineColor: '#e5e5e5', // 浅灰色分割线 - 避免过于突兀但保证辨识度
    tooltipBackgroundColor: 'rgba(255, 255, 255, 0.9)', // 半透明浅色背景
    tooltipBorderColor: '#1890ff', // 深蓝色作为边框
    gaugeColors: {
      normal: '#52c41a', // 深绿色（正常）
      warning: '#d4380d', // 深橙色（警告）
      danger: '#a8071a' // 深红色（危险）
    }
  }
};

const MainVisualization = () => {
  const { getFilteredServers, historyData } = useMonitoringDataStore();
  const { timeRange, theme, selectedServers } = useAppStore();
  
  // 获取当前主题的样式配置
  const currentTheme = chartThemes[theme as keyof typeof chartThemes];
  
  // 获取过滤后的服务器数据
  const servers = getFilteredServers();
  const [chartType, setChartType] = useState<ChartType>('line');
  const [dimension, setDimension] = useState<'cpu' | 'memory' | 'disk' | 'network'>('cpu');
  const [viewDimension, setViewDimension] = useState<ViewDimension>('server');
  const [isHistoryMode, setIsHistoryMode] = useState(false);
  const [historyTime, setHistoryTime] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 回放速度倍数
  const [playbackProgress, setPlaybackProgress] = useState(0); // 回放进度 0-100
  const chartRef = useRef<any>(null);
  const playbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // 监听主题变化，更新图表
  useEffect(() => {
    if (chartRef.current) {
      const chart = chartRef.current.getEchartsInstance();
      // 重新设置图表选项，触发图表更新
      chart.setOption(getChartOption(), true);
    }
  }, [theme]);
  
  // 获取当前显示的数据
  const getDisplayData = () => {
    // 确保 servers 是一个数组
    let displayServers = servers || [];
    
    // 根据选中的服务器过滤
    if (selectedServers && selectedServers.length > 0) {
      displayServers = displayServers.filter(server => 
        selectedServers.includes(server.serverId)
      );
    }
    
    // 如果是历史模式，使用历史数据
    if (isHistoryMode && historyTime) {
      // 这里应该从历史数据中获取对应时间点的数据
      // 简化实现，使用当前数据模拟历史数据
      return displayServers;
    }
    
    return displayServers;
  };
  
  // 获取历史时序数据
  const getHistoryTimeSeriesData = () => {
    // 如果是历史模式且有指定时间点，获取该时间点附近的数据
    if (isHistoryMode && historyTime) {
      const timeWindow = 5 * 60 * 1000; // 5分钟窗口
      const startTime = historyTime - timeWindow;
      const endTime = historyTime + timeWindow;
      
      return historyData.filter(point => 
        point.timestamp >= startTime && point.timestamp <= endTime
      );
    }
    
    // 否则获取指定时间范围内的历史数据
    const now = Date.now();
    const startTime = now - timeRange * 60 * 1000;
    
    return historyData.filter(point => 
      point.timestamp >= startTime && point.timestamp <= now
    );
  };
  
  // 按维度分组数据
  const groupDataByDimension = (data: any[]) => {
    // 确保 data 是一个数组
    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    switch (viewDimension) {
      case 'server':
        return data.map(server => ({
          name: server.serverName || '未知服务器',
          value: getDimensionValue(server),
        }));
      
      case 'region':
        // 模拟按区域分组
        const regionGroups: Record<string, { total: number; count: number }> = {};
        data.forEach(server => {
          // 假设服务器名称包含区域信息，如"北京-01"
          const region = server.serverName?.split('-')[0] || '未知区域';
          if (!regionGroups[region]) {
            regionGroups[region] = { total: 0, count: 0 };
          }
          regionGroups[region].total += getDimensionValue(server);
          regionGroups[region].count += 1;
        });
        
        return Object.entries(regionGroups).map(([region, data]) => ({
          name: region,
          value: data.total / data.count, // 平均值
        }));
      
      case 'service':
        // 模拟按服务类型分组
        const serviceGroups: Record<string, { total: number; count: number }> = {};
        data.forEach(server => {
          // 假设服务器名称包含服务类型信息，如"Web-01"
          const serverName = server.serverName || '';
          const serviceType = serverName.includes('Web') ? 'Web服务' :
                             serverName.includes('DB') ? '数据库' :
                             serverName.includes('Cache') ? '缓存' : '其他服务';
          
          if (!serviceGroups[serviceType]) {
            serviceGroups[serviceType] = { total: 0, count: 0 };
          }
          serviceGroups[serviceType].total += getDimensionValue(server);
          serviceGroups[serviceType].count += 1;
        });
        
        return Object.entries(serviceGroups).map(([service, data]) => ({
          name: service,
          value: data.total / data.count, // 平均值
        }));
      
      default:
        return [];
    }
  };
  
  // 获取指定维度的值
  const getDimensionValue = (server: any) => {
    if (!server) return 0;
    
    switch (dimension) {
      case 'cpu':
        return server.cpuUsage || 0;
      case 'memory':
        return server.memoryUsage || 0;
      case 'disk':
        return server.diskUsage || 0;
      case 'network':
        return (server.networkIO?.inbound || 0) + (server.networkIO?.outbound || 0);
      default:
        return 0;
    }
  };
  
  // 获取历史时间范围
  const getHistoryTimeRange = () => {
    if (historyData.length === 0) return { start: 0, end: 0 };
    
    const timestamps = historyData.map(point => point.timestamp);
    return {
      start: Math.min(...timestamps),
      end: Math.max(...timestamps)
    };
  };
  
  // 开始历史回放
  const startPlayback = () => {
    if (historyData.length === 0) return;
    
    setIsPlaying(true);
    setIsHistoryMode(true);
    
    const { start, end } = getHistoryTimeRange();
    const duration = end - start;
    const interval = 1000 / playbackSpeed; // 根据回放速度调整间隔
    
    let currentProgress = playbackProgress;
    if (currentProgress >= 100) {
      currentProgress = 0;
      setPlaybackProgress(0);
    }
    
    playbackIntervalRef.current = setInterval(() => {
      currentProgress += 1;
      setPlaybackProgress(currentProgress);
      
      const currentTime = start + (duration * currentProgress / 100);
      setHistoryTime(currentTime);
      
      if (currentProgress >= 100) {
        stopPlayback();
      }
    }, interval);
  };
  
  // 停止历史回放
  const stopPlayback = () => {
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
    setIsPlaying(false);
  };
  
  // 重置历史回放
  const resetPlayback = () => {
    stopPlayback();
    setPlaybackProgress(0);
    setHistoryTime(null);
    setIsHistoryMode(false);
  };
  
  // 处理回放速度变化
  const handlePlaybackSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (isPlaying) {
      stopPlayback();
      startPlayback();
    }
  };
  
  // 处理进度条变化
  const handleProgressChange = (progress: number) => {
    setPlaybackProgress(progress);
    const { start, end } = getHistoryTimeRange();
    const currentTime = start + ((end - start) * progress / 100);
    setHistoryTime(currentTime);
  };
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, []);
  
  // 获取折线图配置
  const getLineChartOption = () => {
    const timeSeriesData = getHistoryTimeSeriesData();
    
    // 生成时间轴标签
    const timeLabels = timeSeriesData.map(point => {
      const date = new Date(point.timestamp);
      return date.toLocaleTimeString();
    });
    
    // 根据视图维度生成系列数据
    let series = [];
    
    if (viewDimension === 'server') {
      // 服务器维度：每个服务器一条线
      const serverIds = [...new Set(servers.map(s => s.serverId))];
      
      series = serverIds.map(serverId => {
        const serverName = servers.find(s => s.serverId === serverId)?.serverName || serverId;
        const colorIndex = serverIds.indexOf(serverId) % currentTheme.colors.length;
        return {
          name: serverName,
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: timeSeriesData.map(point => {
            // 简化实现，使用历史数据中的平均值
            switch (dimension) {
              case 'cpu':
                return point.cpu + Math.random() * 10 - 5; // 添加随机变化
              case 'memory':
                return point.memory + Math.random() * 10 - 5;
              case 'disk':
                return point.disk + Math.random() * 5 - 2.5;
              case 'network':
                return (point.cpu * 0.5) + Math.random() * 5 - 2.5;
              default:
                return 0;
            }
          }),
          lineStyle: {
            color: currentTheme.colors[colorIndex],
            width: 2.5, // 增加线条宽度，提高可见性
          },
          itemStyle: {
            color: currentTheme.colors[colorIndex],
          },
          emphasis: {
            lineStyle: {
              width: 3.5, // 悬停时增加线条宽度
              shadowBlur: 5, // 添加光晕效果
              shadowColor: currentTheme.colors[colorIndex],
            },
          },
        };
      });
    } else if (viewDimension === 'region') {
      // 区域维度：每个区域一条线
      const regions = ['北京', '上海', '广州', '深圳'];
      
      series = regions.map(region => {
        const colorIndex = regions.indexOf(region) % currentTheme.colors.length;
        return {
          name: region,
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: timeSeriesData.map(point => {
            // 简化实现，使用历史数据中的平均值
            switch (dimension) {
              case 'cpu':
                return point.cpu + Math.random() * 10 - 5;
              case 'memory':
                return point.memory + Math.random() * 10 - 5;
              case 'disk':
                return point.disk + Math.random() * 5 - 2.5;
              case 'network':
                return (point.cpu * 0.5) + Math.random() * 5 - 2.5;
              default:
                return 0;
            }
          }),
          lineStyle: {
            color: currentTheme.colors[colorIndex],
            width: 2.5, // 增加线条宽度，提高可见性
          },
          itemStyle: {
            color: currentTheme.colors[colorIndex],
          },
          emphasis: {
            lineStyle: {
              width: 3.5, // 悬停时增加线条宽度
              shadowBlur: 5, // 添加光晕效果
              shadowColor: currentTheme.colors[colorIndex],
            },
          },
        };
      });
    } else if (viewDimension === 'service') {
      // 服务维度：每个服务类型一条线
      const services = ['Web服务', '数据库', '缓存', '消息队列'];
      
      series = services.map(service => {
        const colorIndex = services.indexOf(service) % currentTheme.colors.length;
        return {
          name: service,
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: timeSeriesData.map(point => {
            // 简化实现，使用历史数据中的平均值
            switch (dimension) {
              case 'cpu':
                return point.cpu + Math.random() * 10 - 5;
              case 'memory':
                return point.memory + Math.random() * 10 - 5;
              case 'disk':
                return point.disk + Math.random() * 5 - 2.5;
              case 'network':
                return (point.cpu * 0.5) + Math.random() * 5 - 2.5;
              default:
                return 0;
            }
          }),
          lineStyle: {
            color: currentTheme.colors[colorIndex],
            width: 2.5, // 增加线条宽度，提高可见性
          },
          itemStyle: {
            color: currentTheme.colors[colorIndex],
          },
          emphasis: {
            lineStyle: {
              width: 3.5, // 悬停时增加线条宽度
              shadowBlur: 5, // 添加光晕效果
              shadowColor: currentTheme.colors[colorIndex],
            },
          },
        };
      });
    }
    
    return {
      backgroundColor: 'transparent',
      title: {
        text: `${isHistoryMode ? '历史' : '实时'}${dimension === 'cpu' ? 'CPU' : 
               dimension === 'memory' ? '内存' : 
               dimension === 'disk' ? '磁盘' : '网络'}使用率趋势`,
        textStyle: {
          color: currentTheme.textColor,
          fontSize: 16,
          fontWeight: theme === 'light' ? 'bold' : 'normal', // 浅色模式下标题加粗
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: currentTheme.tooltipBackgroundColor,
        borderColor: currentTheme.tooltipBorderColor,
        textStyle: {
          color: currentTheme.textColor,
        },
        formatter: (params: any) => {
          let result = `${params[0].axisValue}<br/>`;
          params.forEach((param: any) => {
            result += `${param.marker}${param.seriesName}: ${param.value.toFixed(2)}${dimension === 'network' ? 'MB/s' : '%'}<br/>`;
          });
          return result;
        },
      },
      legend: {
        data: series.map(s => s.name),
        textStyle: {
          color: theme === 'light' ? currentTheme.legendTextColor : currentTheme.textColor,
          fontSize: 12,
        },
        itemGap: 20, // 增加图例项间距，提高可读性
        itemWidth: 15, // 增加图例标记宽度
        itemHeight: 10, // 增加图例标记高度
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
        borderColor: currentTheme.axisColor,
        borderWidth: 1,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: timeLabels,
        axisLine: {
          lineStyle: {
            color: currentTheme.axisColor,
            width: 1.5, // 增加线条宽度
          },
        },
        axisLabel: {
          color: theme === 'light' ? currentTheme.axisTextColor : currentTheme.textColor,
          fontSize: 11,
          margin: 10, // 增加标签与轴线的距离
        },
        axisTick: {
          lineStyle: {
            color: currentTheme.axisColor,
            width: 1,
          },
        },
      },
      yAxis: {
        type: 'value',
        max: dimension === 'network' ? undefined : 100,
        axisLine: {
          lineStyle: {
            color: currentTheme.axisColor,
            width: 1.5,
          },
        },
        axisLabel: {
          color: theme === 'light' ? currentTheme.axisTextColor : currentTheme.textColor,
          fontSize: 11,
          formatter: dimension === 'network' ? '{value} MB/s' : '{value}%',
        },
        axisTick: {
          lineStyle: {
            color: currentTheme.axisColor,
            width: 1,
          },
        },
        splitLine: {
          lineStyle: {
            color: currentTheme.splitLineColor,
            type: 'dashed', // 使用虚线，减少视觉干扰
            opacity: 0.6, // 降低透明度
          },
        },
      },
      series,
    };
  };
  
  // 获取柱状图配置
  const getBarChartOption = () => {
    const groupedData = groupDataByDimension(getDisplayData());
    
    const categories = groupedData.map(item => item.name);
    const values = groupedData.map(item => item.value);
    
    // 为每个柱子分配颜色
    const barColors = values.map((_, index) => currentTheme.colors[index % currentTheme.colors.length]);
    
    return {
      backgroundColor: 'transparent',
      title: {
        text: `${isHistoryMode ? '历史' : '实时'}${dimension === 'cpu' ? 'CPU' : 
               dimension === 'memory' ? '内存' : 
               dimension === 'disk' ? '磁盘' : '网络'}使用率对比`,
        textStyle: {
          color: currentTheme.textColor,
          fontSize: 16,
          fontWeight: theme === 'light' ? 'bold' : 'normal', // 浅色模式下标题加粗
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: currentTheme.tooltipBackgroundColor,
        borderColor: currentTheme.tooltipBorderColor,
        borderWidth: 1,
        textStyle: {
          color: currentTheme.textColor,
        },
        formatter: dimension === 'network' 
          ? '{b}: {c} Mb/s' 
          : '{b}: {c}%',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
        borderColor: currentTheme.axisColor,
        borderWidth: 1,
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: {
          lineStyle: {
            color: currentTheme.axisColor,
            width: 1.5,
          },
        },
        axisLabel: {
          color: theme === 'light' ? currentTheme.axisTextColor : currentTheme.textColor,
          fontSize: 11,
          rotate: 45, // 旋转标签，避免重叠
          margin: 10,
        },
        axisTick: {
          lineStyle: {
            color: currentTheme.axisColor,
            width: 1,
          },
        },
      },
      yAxis: {
        type: 'value',
        max: dimension === 'network' ? undefined : 100,
        axisLine: {
          lineStyle: {
            color: currentTheme.axisColor,
            width: 1.5,
          },
        },
        axisLabel: {
          color: theme === 'light' ? currentTheme.axisTextColor : currentTheme.textColor,
          fontSize: 11,
          formatter: dimension === 'network' ? '{value} Mb/s' : '{value}%',
        },
        axisTick: {
          lineStyle: {
            color: currentTheme.axisColor,
            width: 1,
          },
        },
        splitLine: {
          lineStyle: {
            color: currentTheme.splitLineColor,
            type: 'dashed', // 使用虚线
            opacity: 0.6, // 降低透明度
          },
        },
      },
      series: [
        {
          type: 'bar',
          data: values,
          itemStyle: {
            color: (params: any) => barColors[params.dataIndex], // 为每个柱子分配不同颜色
            borderRadius: [4, 4, 0, 0], // 添加圆角
            borderWidth: 1,
            borderColor: theme === 'dark' ? '#112240' : '#ffffff', // 根据主题设置边框颜色
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10, // 添加光晕效果
              shadowColor: currentTheme.colors[0], // 使用主题颜色作为光晕颜色
              borderWidth: 2,
              borderColor: currentTheme.textColor,
            },
          },
        },
      ],
    };
  };
  
  // 获取饼图配置
  const getPieChartOption = () => {
    const groupedData = groupDataByDimension(getDisplayData());
    
    const data = groupedData.map(item => ({
      name: item.name,
      value: item.value,
    }));
    
    return {
      backgroundColor: 'transparent',
      title: {
        text: `${isHistoryMode ? '历史' : '实时'}${dimension === 'cpu' ? 'CPU' : 
               dimension === 'memory' ? '内存' : 
               dimension === 'disk' ? '磁盘' : '网络'}使用率分布`,
        textStyle: {
          color: currentTheme.textColor,
          fontSize: 16,
          fontWeight: theme === 'light' ? 'bold' : 'normal', // 浅色模式下标题加粗
        },
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: currentTheme.tooltipBackgroundColor,
        borderColor: currentTheme.tooltipBorderColor,
        borderWidth: 1,
        textStyle: {
          color: currentTheme.textColor,
          fontSize: 12,
        },
        formatter: dimension === 'network' 
          ? '{a} <br/>{b}: {c} Mb/s ({d}%)' 
          : '{a} <br/>{b}: {c}% ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: {
          color: theme === 'light' ? currentTheme.legendTextColor : currentTheme.textColor,
          fontSize: 12,
        },
        itemGap: 15, // 增加图例项间距
        itemWidth: 15, // 增加图例标记宽度
        itemHeight: 10, // 增加图例标记高度
      },
      series: [
        {
          name: dimension === 'cpu' ? 'CPU使用率' : 
                dimension === 'memory' ? '内存使用率' : 
                dimension === 'disk' ? '磁盘使用率' : '网络使用率',
          type: 'pie',
          radius: ['40%', '70%'], // 使用环形图，提高可读性
          center: ['60%', '50%'], // 调整位置，为左侧图例留出空间
          data: data.sort((a, b) => b.value - a.value),
          emphasis: {
            itemStyle: {
              shadowBlur: 15,
              shadowOffsetX: 0,
              shadowColor: 'rgba(64, 169, 255, 0.5)', // 使用高对比度颜色的光晕
              borderWidth: 2,
              borderColor: currentTheme.textColor,
            },
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
              color: currentTheme.textColor,
            },
          },
          label: {
            show: false, // 默认不显示标签，避免混乱
          },
          labelLine: {
            show: false, // 默认不显示标签线
          },
          color: currentTheme.colors,
          itemStyle: {
            borderWidth: 1,
            borderColor: theme === 'dark' ? '#112240' : '#ffffff', // 根据主题设置边框颜色
          },
        },
      ],
    };
  };
  
  // 获取仪表盘配置
  const getGaugeChartOption = () => {
    const groupedData = groupDataByDimension(getDisplayData());
    
    const avgValue = groupedData.length > 0 
      ? groupedData.reduce((sum, item) => sum + item.value, 0) / groupedData.length
      : 0;
    
    // 根据使用率值确定颜色
    let gaugeColor = currentTheme.gaugeColors.normal; // 默认正常颜色
    if (avgValue >= 80) {
      gaugeColor = currentTheme.gaugeColors.danger; // 危险颜色
    } else if (avgValue >= 60) {
      gaugeColor = currentTheme.gaugeColors.warning; // 警告颜色
    }
    
    return {
      backgroundColor: 'transparent',
      title: {
        text: `${dimension === 'cpu' ? 'CPU' : 
               dimension === 'memory' ? '内存' : 
               dimension === 'disk' ? '磁盘' : '网络'}平均使用率`,
        textStyle: {
          color: currentTheme.textColor,
          fontSize: 16,
          fontWeight: theme === 'light' ? 'bold' : 'normal', // 浅色模式下标题加粗
        },
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: currentTheme.tooltipBackgroundColor,
        borderColor: gaugeColor, // 使用仪表盘颜色作为边框
        borderWidth: 1,
        textStyle: {
          color: currentTheme.textColor,
          fontSize: 12,
        },
        formatter: dimension === 'network' 
          ? `{b}: {c} Mb/s` 
          : `{b}: {c}%`,
      },
      series: [
        {
          name: dimension === 'cpu' ? 'CPU' : 
                dimension === 'memory' ? '内存' : 
                dimension === 'disk' ? '磁盘' : '网络',
          type: 'gauge',
          min: 0,
          max: dimension === 'network' ? 100 : 100,
          splitNumber: 5,
          radius: '80%',
          startAngle: 225,
          endAngle: -45,
          progress: {
            show: true,
            width: 18,
            itemStyle: {
              color: gaugeColor,
              shadowColor: gaugeColor,
              shadowBlur: 5,
              shadowOffsetX: 0,
              shadowOffsetY: 0,
            },
          },
          pointer: {
            icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z',
            length: '75%',
            width: 12,
            offsetCenter: [0, '5%'],
            itemStyle: {
              color: gaugeColor,
              shadowColor: gaugeColor,
              shadowBlur: 5,
              shadowOffsetX: 0,
              shadowOffsetY: 0,
            },
          },
          axisLine: {
            lineStyle: {
              width: 18,
              color: [
                [0.6, currentTheme.gaugeColors.normal], // 0-60% 正常颜色
                [0.8, currentTheme.gaugeColors.warning], // 60-80% 警告颜色
                [1, currentTheme.gaugeColors.danger]    // 80-100% 危险颜色
              ],
            },
          },
          axisTick: {
            splitNumber: 2,
            lineStyle: {
              width: 2,
              color: currentTheme.axisColor,
            },
            distance: -25,
          },
          splitLine: {
            length: 12,
            lineStyle: {
              width: 3,
              color: currentTheme.axisColor,
            },
            distance: -30,
          },
          axisLabel: {
            distance: -40,
            color: theme === 'light' ? currentTheme.axisTextColor : currentTheme.textColor,
            fontSize: 12,
            fontWeight: 'bold',
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 15,
            itemStyle: {
              borderWidth: 5,
              borderColor: gaugeColor,
            },
          },
          title: {
            show: true,
            offsetCenter: [0, '-30%'],
            fontSize: 14,
            color: theme === 'light' ? currentTheme.legendTextColor : currentTheme.textColor,
          },
          detail: {
            valueAnimation: true,
            width: '60%',
            lineHeight: 40,
            borderRadius: 8,
            offsetCenter: [0, '15%'],
            fontSize: 24,
            fontWeight: 'bolder',
            formatter: dimension === 'network' ? '{value} Mb/s' : 
                       dimension === 'cpu' ? function(value) { return parseFloat(value).toFixed(3) + '%'; } : 
                       '{value}%',
            color: theme === 'light' ? currentTheme.legendTextColor : currentTheme.textColor,
            backgroundColor: theme === 'dark' ? 'rgba(10, 25, 47, 0.7)' : 'rgba(255, 255, 255, 0.7)', // 根据主题设置背景
            borderColor: gaugeColor,
            borderWidth: 2,
            shadowColor: gaugeColor,
            shadowBlur: 5,
          },
          data: [
            {
              value: avgValue,
              name: dimension === 'cpu' ? 'CPU使用率' : 
                    dimension === 'memory' ? '内存使用率' : 
                    dimension === 'disk' ? '磁盘使用率' : '网络使用率',
            },
          ],
        },
      ],
    };
  };
  
  // 获取图表配置
  const getChartOption = () => {
    switch (chartType) {
      case 'line':
        return getLineChartOption();
      case 'bar':
        return getBarChartOption();
      case 'pie':
        return getPieChartOption();
      case 'gauge':
        return getGaugeChartOption();
      default:
        return getLineChartOption();
    }
  };
  
  return (
    <div className={styles.mainVisualization}>
      <div className={styles.controls}>
        <div className={styles.chartTypeSelector}>
          <button
            className={`${styles.chartTypeButton} ${chartType === 'line' ? styles.active : ''}`}
            onClick={() => setChartType('line')}
          >
            <LineChart size={16} />
            <span>折线图</span>
          </button>
          <button
            className={`${styles.chartTypeButton} ${chartType === 'bar' ? styles.active : ''}`}
            onClick={() => setChartType('bar')}
          >
            <BarChart3 size={16} />
            <span>柱状图</span>
          </button>
          <button
            className={`${styles.chartTypeButton} ${chartType === 'pie' ? styles.active : ''}`}
            onClick={() => setChartType('pie')}
          >
            <PieChart size={16} />
            <span>饼图</span>
          </button>
          <button
            className={`${styles.chartTypeButton} ${chartType === 'gauge' ? styles.active : ''}`}
            onClick={() => setChartType('gauge')}
          >
            <Activity size={16} />
            <span>仪表盘</span>
          </button>
        </div>
        
        <div className={styles.viewDimensionSelector}>
          <button
            className={`${styles.viewDimensionButton} ${viewDimension === 'server' ? styles.active : ''}`}
            onClick={() => setViewDimension('server')}
          >
            服务器
          </button>
          <button
            className={`${styles.viewDimensionButton} ${viewDimension === 'region' ? styles.active : ''}`}
            onClick={() => setViewDimension('region')}
          >
            区域
          </button>
          <button
            className={`${styles.viewDimensionButton} ${viewDimension === 'service' ? styles.active : ''}`}
            onClick={() => setViewDimension('service')}
          >
            服务
          </button>
        </div>
        
        <div className={styles.dimensionSelector}>
          <button
            className={`${styles.dimensionButton} ${dimension === 'cpu' ? styles.active : ''}`}
            onClick={() => setDimension('cpu')}
          >
            CPU
          </button>
          <button
            className={`${styles.dimensionButton} ${dimension === 'memory' ? styles.active : ''}`}
            onClick={() => setDimension('memory')}
          >
            内存
          </button>
          <button
            className={`${styles.dimensionButton} ${dimension === 'disk' ? styles.active : ''}`}
            onClick={() => setDimension('disk')}
          >
            磁盘
          </button>
          <button
            className={`${styles.dimensionButton} ${dimension === 'network' ? styles.active : ''}`}
            onClick={() => setDimension('network')}
          >
            网络
          </button>
        </div>
      </div>
      
      {/* 历史回放控制面板 */}
      <div className={styles.historyControls}>
        <div className={styles.playbackControls}>
          <button
            className={styles.playbackButton}
            onClick={isPlaying ? stopPlayback : startPlayback}
            disabled={historyData.length === 0}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            <span>{isPlaying ? '暂停' : '播放'}</span>
          </button>
          
          <button
            className={styles.playbackButton}
            onClick={resetPlayback}
            disabled={historyData.length === 0}
          >
            <RotateCcw size={16} />
            <span>重置</span>
          </button>
          
          <div className={styles.speedSelector}>
            <span className={styles.speedLabel}>回放速度:</span>
            <select
              className={styles.speedSelect}
              value={playbackSpeed}
              onChange={(e) => handlePlaybackSpeedChange(Number(e.target.value))}
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={4}>4x</option>
            </select>
          </div>
          
          <div className={styles.progressContainer}>
            <span className={styles.progressLabel}>
              {isHistoryMode && historyTime 
                ? new Date(historyTime).toLocaleString() 
                : '实时数据'}
            </span>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${playbackProgress}%` }}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={playbackProgress}
                onChange={(e) => handleProgressChange(Number(e.target.value))}
                className={styles.progressSlider}
                disabled={historyData.length === 0}
              />
            </div>
          </div>
        </div>
        
        <div className={styles.historyModeToggle}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={isHistoryMode}
              onChange={(e) => {
                setIsHistoryMode(e.target.checked);
                if (!e.target.checked) {
                  resetPlayback();
                }
              }}
              disabled={historyData.length === 0}
            />
            <span>历史模式</span>
          </label>
        </div>
      </div>
      
      <div className={styles.chartContainer}>
        <ReactECharts
          ref={chartRef}
          option={getChartOption()}
          style={{ height: '100%', width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
    </div>
  );
};

export default MainVisualization;