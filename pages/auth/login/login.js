// pages/auth/login/login.js
const api = require('../../../utils/api');

Page({
  data: {
    username: '',
    password: '',
    loading: false
  },

  onLoad() {
    // 如已登录则跳过
    const token = wx.getStorageSync('token');
    if (token) {
      wx.reLaunch({ url: '/pages/index/index' });
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
      wx.setStorageSync('token', token);
      // 获取用户详情可等跳转后由首页或者Profile页去拿，这里先存Token
      const app = getApp();
      app.globalData.token = token;

      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => {
        wx.reLaunch({ url: '/pages/index/index' });
      }, 800);
    }).catch(() => {
      this.setData({ loading: false });
    });
  },

  goToRegister() {
    wx.navigateTo({ url: '/pages/auth/register/register' });
  },

  showAgreement() {
    wx.showModal({
      title: '爱宠家用户协议',
      content: '欢迎使用爱宠家小程序！\r\n\r\n1. 请在法律允许范围内使用本软件，禁止发布违法违规内容。\r\n\r\n2. 我们将妥善保管您的个人隐私信息，非经授权绝不向无关第三方泄露。\r\n\r\n3. 您在社区发布的信息应秉持友善交流原则。\r\n\r\n感谢您为宠物提供一个温馨的数字家园！',
      showCancel: false,
      confirmText: '已知晓',
      confirmColor: '#2B3930'
    });
  }
});
