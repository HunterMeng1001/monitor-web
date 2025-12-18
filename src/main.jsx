import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 初始化主题
const initTheme = () => {
  const savedTheme = localStorage.getItem('app-store');
  if (savedTheme) {
    try {
      const parsedState = JSON.parse(savedTheme);
      if (parsedState.state && parsedState.state.theme) {
        document.documentElement.setAttribute('data-theme', parsedState.state.theme);
      }
    } catch (error) {
      console.error('Failed to parse saved theme:', error);
      // 默认设置深色主题
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } else {
    // 默认设置深色主题
    document.documentElement.setAttribute('data-theme', 'dark');
  }
};

// 初始化主题
initTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
