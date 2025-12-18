# 系统监控Web面板

## 🎨 设计说明

本系统监控Web面板采用现代化设计理念，以数据可视化和用户体验为核心。界面设计遵循简洁明了的原则，通过深色/浅色主题系统满足不同环境下的使用需求。布局采用经典的三栏式结构，左侧为可折叠的导航栏，中间为系统状态概览，右侧为详细数据可视化区域。

交互设计注重直观性和效率，支持实时数据更新、智能搜索过滤和响应式布局适配。图表展示采用ECharts实现，提供折线图、柱状图、饼图和仪表盘四种可视化方式，确保数据呈现的多样性和专业性。整体设计风格统一，色彩搭配协调，为用户提供高效、舒适的监控体验。

一个基于React + ECharts的现代化系统监控Web面板，提供实时数据展示、主题切换和响应式布局等功能。

## 🌟 功能特性

### 核心功能
- **实时数据监控**：支持CPU、内存、磁盘和网络使用率的实时监控
- **多维度数据展示**：提供折线图、柱状图、饼图和仪表盘四种可视化方式
- **主题切换**：支持浅色/深色主题自由切换，自动适配系统主题
- **响应式设计**：完美适配桌面、平板和移动设备
- **数据流控制**：支持数据流的暂停、恢复和刷新操作
- **智能搜索**：支持对服务器、任务和告警信息的实时过滤

### 高级特性
- **状态管理**：基于Zustand的高效状态管理
- **模块化设计**：采用组件化和模块化架构，易于维护和扩展
- **TypeScript支持**：完整的TypeScript类型定义，提高代码质量
- **性能优化**：组件懒加载和数据缓存，提升应用性能

## 🚀 技术栈

### 前端框架
- **React 19.2.0** - 现代化前端框架
- **TypeScript** - 类型安全的JavaScript超集
- **Vite 7.2.4** - 快速的构建工具

### 状态管理
- **Zustand 5.0.9** - 轻量级状态管理库

### UI组件
- **ECharts 6.0.0** - 强大的数据可视化库
- **ECharts for React 3.0.5** - React封装的ECharts组件
- **Lucide React 0.562.0** - 现代化图标库

### 开发工具
- **ESLint** - 代码质量检查工具
- **CSS Modules** - 模块化CSS解决方案

## 📁 项目结构

```
MonitorWeb/
├── public/                     # 静态资源
├── src/
│   ├── components/            # React组件
│   │   ├── charts/           # 图表组件
│   │   │   └── MainVisualization.tsx
│   │   ├── controls/         # 控制组件
│   │   │   └── TopConsole.tsx
│   │   ├── layout/           # 布局组件
│   │   │   ├── MainLayout.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── status/           # 状态组件
│   │   │   └── SystemStatus.tsx
│   │   └── tasks/            # 任务组件
│   │       └── TaskDetailModal.tsx
│   ├── hooks/                # 自定义Hooks
│   │   └── useDataStream.ts
│   ├── stores/               # 状态管理
│   │   ├── appStore.ts
│   │   ├── monitoringDataStore.ts
│   │   └── dataStore.ts
│   ├── types/                # 类型定义
│   │   ├── monitoring.ts
│   │   └── index.ts
│   ├── utils/                # 工具函数
│   │   ├── dataManager.ts
│   │   └── mockDataGenerator.ts
│   ├── App.tsx               # 根组件
│   ├── main.tsx              # 入口文件
│   └── index.css             # 全局样式
├── ai_interaction_logs/      # AI交互日志
│   ├── AI交互过程日志.md
│   └── README.md
├── package.json              # 项目配置
├── vite.config.ts            # Vite配置
└── README.md                 # 项目说明
```

## 🛠️ 安装与运行

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

### 安装依赖
```bash
# 克隆项目
git clone [项目地址]
cd MonitorWeb

# 安装依赖
npm install
```

### 开发环境运行
```bash
# 启动开发服务器
npm run dev
```

### 生产环境构建
```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 代码检查
```bash
# 运行ESLint检查
npm run lint
```

## 📊 功能说明

### 数据可视化
- **折线图**：展示服务器资源使用率的历史趋势
- **柱状图**：对比不同服务器的资源使用情况
- **饼图**：显示资源使用的分布比例
- **仪表盘**：实时显示系统整体健康状态

### 主题系统
- **深色主题**：适合长时间监控，减少眼部疲劳
- **浅色主题**：适合日间使用，清晰明亮
- **自动切换**：支持跟随系统主题自动切换

### 响应式布局
- **桌面端**：完整功能展示，三栏布局
- **平板端**：自适应布局，可折叠侧边栏
- **移动端**：优化的触控体验，隐藏式菜单

## 🔧 配置说明

### 主题配置
主题配置位于 `src/stores/appStore.ts`，支持自定义主题颜色和样式。

### 数据配置
模拟数据生成器位于 `src/utils/mockDataGenerator.ts`，可调整数据生成频率和范围。

### 图表配置
图表配置位于 `src/components/charts/MainVisualization.tsx`，支持自定义图表样式和交互。

## 📝 开发指南

### 添加新功能
1. 在相应的组件目录下创建新组件
2. 在 `src/types` 中定义相关类型
3. 在 `src/stores` 中添加状态管理
4. 更新路由和导航（如需要）

### 自定义主题
1. 修改 `src/stores/appStore.ts` 中的主题配置
2. 在 `src/index.css` 中添加CSS变量
3. 更新组件中的主题相关样式

### 扩展图表类型
1. 在 `src/components/charts/MainVisualization.tsx` 中添加新的图表配置
2. 在图表类型枚举中添加新类型
3. 实现对应的数据处理逻辑

## 🐛 问题排查

### 常见问题
1. **数据不更新**：检查数据流状态，确保数据流处于运行状态
2. **图表不显示**：检查ECharts配置和数据格式
3. **主题切换失败**：检查主题状态和CSS变量定义
4. **响应式布局异常**：检查CSS媒体查询和组件状态

### 调试技巧
- 使用浏览器开发者工具检查组件状态
- 查看控制台错误信息
- 检查网络请求和数据流状态
- 使用React开发者工具调试组件

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件至 [您的邮箱]

## 🙏 致谢

感谢以下开源项目的支持：
- [React](https://reactjs.org/)
- [ECharts](https://echarts.apache.org/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Vite](https://vitejs.dev/)
- [Lucide](https://lucide.dev/)

---

## 📈 更新日志

### v1.0.0 (2025-12-18)
- ✨ 初始版本发布
- 🎨 实现基础监控功能
- 🌙 支持主题切换
- 📱 完成响应式布局
- 📊 集成四种图表类型
- 🔍 添加搜索和过滤功能
- 🎯 优化图表显示精度

---

*最后更新：2025年12月18日*