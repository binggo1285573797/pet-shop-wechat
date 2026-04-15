// utils/config.js - 全局配置

// ==================== 服务器地址配置 ====================
// 本机局域网 IP（用于手机预览）
// Windows 查看方法：cmd 运行 ipconfig，找 WLAN 的 IPv4 地址
const LOCAL_IP = '192.168.230.6';  // <-- 你的电脑 IP

// 端口号
const PORT = '8080';

// ==================== 环境判断 ====================
// 判断是否在模拟器中运行
const isSimulator = () => {
  const systemInfo = wx.getSystemInfoSync();
  // 模拟器通常 platform 为 'devtools'
  return systemInfo.platform === 'devtools';
};

// 构建基础 URL
const getBaseURL = () => {
  if (isSimulator()) {
    // 模拟器使用 localhost
    return `http://localhost:${PORT}/api`;
  } else {
    // 真机使用局域网 IP
    return `http://${LOCAL_IP}:${PORT}/api`;
  }
};

// ==================== 导出配置 ====================
const BASE_URL = getBaseURL();

module.exports = {
  BASE_URL,
  UPLOAD_URL: `${BASE_URL}/image/upload`,
  // 导出配置信息供调试
  isSimulator: isSimulator(),
  currentIP: isSimulator() ? 'localhost' : LOCAL_IP
};
