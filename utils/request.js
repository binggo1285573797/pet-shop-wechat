// utils/request.js - HTTP 请求封装
const { BASE_URL } = require('./config');

// 请求队列，用于token刷新时缓存请求
let requestQueue = [];
let isRefreshing = false;

function request(options) {
  return new Promise((resolve, reject) => {
    const app = getApp();
    const token = (app && app.globalData.token) || wx.getStorageSync('token') || '';

    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success(res) {
        const data = res.data;
        if (!data) {
          wx.showToast({ title: '服务器响应异常', icon: 'none' });
          reject({ message: '响应异常' });
          return;
        }
        if (data.code === 200) {
          resolve(data);
        } else if (data.code === 401) {
          // Token过期或无效
          handleTokenExpired();
          reject(data);
        } else if (data.code === 4011 || data.code === 4022) {
          // 账号被封禁或店铺被停用，不显示toast，让业务层处理
          reject(data);
        } else {
          wx.showToast({ title: data.message || '请求失败', icon: 'none' });
          reject(data);
        }
      },
      fail(err) {
        wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
        reject(err);
      }
    });
  });
}

// 处理token过期
function handleTokenExpired() {
  const app = getApp();
  
  // 清除登录状态
  if (app && app.clearLoginState) {
    app.clearLoginState();
  } else {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    if (app) {
      app.globalData.token = '';
      app.globalData.userInfo = null;
    }
  }

  wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
  
  // 延迟跳转到登录页
  setTimeout(() => {
    wx.reLaunch({ url: '/pages/auth/login/login' });
  }, 1500);
}

const get = (url, data) => request({ url, method: 'GET', data });
const post = (url, data) => request({ url, method: 'POST', data });
const put = (url, data) => request({ url, method: 'PUT', data });
const del = (url, data) => request({ url, method: 'DELETE', data });

module.exports = { request, get, post, put, del };
