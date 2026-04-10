// utils/request.js - HTTP 请求封装
const BASE_URL = 'http://localhost:8080/api'; // 修改为你的后端地址

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
          wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
          setTimeout(() => {
            if (app) app.logout();
          }, 1500);
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

const get = (url, data) => request({ url, method: 'GET', data });
const post = (url, data) => request({ url, method: 'POST', data });
const put = (url, data) => request({ url, method: 'PUT', data });
const del = (url, data) => request({ url, method: 'DELETE', data });

module.exports = { request, get, post, put, del };
