// pages/auth/login/login.js
const api = require('../../../utils/api');
const { BASE_URL } = require('../../../utils/config');

Page({
  data: {
    username: '',
    password: '',
    loading: false
  },

  onLoad() {
    // 检查是否已登录
    this.checkAlreadyLogin();
  },

  onShow() {
    // 每次显示页面时再次检查登录状态
    this.checkAlreadyLogin();
  },

  // 检查是否已登录，如果已登录则跳转到首页
  checkAlreadyLogin() {
    const token = wx.getStorageSync('token');
    const app = getApp();
    
    if (token && app) {
      console.log('[Login] 检测到已登录，准备跳转首页');
      // 延迟一点跳转，避免页面闪烁
      setTimeout(() => {
        wx.reLaunch({ 
          url: '/pages/index/index',
          success: () => {
            console.log('[Login] 已跳转到首页');
          },
          fail: (err) => {
            console.error('[Login] 跳转失败:', err);
          }
        });
      }, 100);
    }
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  onLogin() {
    const { username, password } = this.data;
    if (!username.trim()) {
      wx.showToast({ title: '请输入用户名', icon: 'none' });
      return;
    }
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    
    api.login({ username: username.trim(), password }).then(res => {
      const token = res.data;
      const app = getApp();
      
      // 使用app的方法设置登录状态
      if (app && app.setLoginState) {
        app.setLoginState(token, null);
      } else {
        // 兼容旧版本
        wx.setStorageSync('token', token);
        if (app) {
          app.globalData.token = token;
        }
      }

      // 获取用户信息
      this.fetchUserInfo();

      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => {
        wx.reLaunch({ url: '/pages/index/index' });
      }, 800);
    }).catch((err) => {
      console.error('[Login] 登录失败:', err);
      this.setData({ loading: false });
      
      // 检查是否是账号被封禁的错误
      if (err.code === 4011) {
        wx.showModal({
          title: '账号已被封禁',
          content: '您的账号已被封禁，请联系管理员解封',
          showCancel: false,
          confirmText: '知道了',
          confirmColor: '#FF8A65'
        });
      } else if (err.code === 4022) {
        wx.showModal({
          title: '店铺已被停用',
          content: '您的店铺已被停用，请联系管理员',
          showCancel: false,
          confirmText: '知道了',
          confirmColor: '#FF8A65'
        });
      } else {
        wx.showToast({ title: err.message || '登录失败，请检查账号密码', icon: 'none' });
      }
    });
  },

  // 获取用户信息
  fetchUserInfo() {
    const app = getApp();
    api.getUserInfo().then(res => {
      if (res.data && app) {
        app.globalData.userInfo = res.data;
        wx.setStorageSync('userInfo', res.data);
      }
    }).catch(() => {});
  },

  goToRegister() {
    wx.navigateTo({ url: '/pages/auth/register/register' });
  },

  // 微信一键登录
  onWechatLogin() {
    wx.showLoading({ title: '登录中...' });

    wx.login({
      success: (loginRes) => {
        if (!loginRes.code) {
          wx.hideLoading();
          wx.showToast({ title: '登录失败，请重试', icon: 'none' });
          return;
        }

        wx.request({
          url: `${BASE_URL}/user/wx-login`,
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
          data: {
            code: loginRes.code
          },
          success: (response) => {
            wx.hideLoading();
            if (response.statusCode === 200 && response.data.code === 200) {
              const data = response.data.data;
              wx.setStorageSync('token', data.token);
              wx.setStorageSync('userId', data.userId);
              wx.setStorageSync('userInfo', {
                nickname: data.nickname,
                avatar: data.avatar || '',
                phone: data.phone || ''
              });

              const app = getApp();
              if (app && app.setLoginState) {
                app.setLoginState(data.token, {
                  nickname: data.nickname,
                  avatar: data.avatar || '',
                  phone: data.phone || ''
                });
              }

              wx.showToast({ title: '登录成功', icon: 'success' });

              setTimeout(() => {
                wx.switchTab({ url: '/pages/index/index' });
              }, 800);
            } else {
              wx.showToast({ title: response.data.message || '登录失败', icon: 'none' });
            }
          },
          fail: () => {
            wx.hideLoading();
            wx.showToast({ title: '网络请求失败', icon: 'none' });
          }
        });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '获取登录凭证失败', icon: 'none' });
      }
    });
  },

  showAgreement() {
    wx.showModal({
      title: '宠物商城用户协议',
      content: '欢迎使用宠物商城小程序！\r\n\r\n1. 请在法律允许范围内使用本软件，禁止发布违法违规内容。\r\n\r\n2. 我们将妥善保管您的个人隐私信息，非经授权绝不向无关第三方泄露。\r\n\r\n3. 您在社区发布的信息应秉持友善交流原则。\r\n\r\n感谢您为宠物提供一个温馨的数字家园！',
      showCancel: false,
      confirmText: '已知晓',
      confirmColor: '#2B3930'
    });
  }
});
