// pages/auth/register/register.js
const api = require('../../../utils/api');

Page({
  data: { username: '', phone: '', password: '', confirmPwd: '', loading: false },

  onInputUsername(e) { this.setData({ username: e.detail.value }); },
  onInputPassword(e) { this.setData({ password: e.detail.value }); },
  onInputConfirmPassword(e) { this.setData({ confirmPwd: e.detail.value }); },

  doRegister() {
    const { username, phone, password, confirmPwd } = this.data;
    if (!username.trim() || username.length < 4) { wx.showToast({ title: '用户名至少4位', icon: 'none' }); return; }
    if (!password || password.length < 6 || password.length > 18) { wx.showToast({ title: '密码应在6-18位之间', icon: 'none' }); return; }
    if (password !== confirmPwd) { wx.showToast({ title: '两次密码不一致', icon: 'none' }); return; }

    this.setData({ loading: true });
    api.register({ username: username.trim(), phone: phone || null, password }).then(() => {
      wx.showToast({ title: '注册成功', icon: 'success' });
      setTimeout(() => { wx.navigateBack(); }, 1000);
    }).catch((err) => {
      this.setData({ loading: false });
      // 显示具体的错误信息
      const errorMsg = err.message || err.data?.message || '注册失败，请重试';
      wx.showToast({ title: errorMsg, icon: 'none', duration: 2000 });
      console.error('注册失败:', err);
    });
  },

  showAgreement() {
    wx.showModal({
      title: '爱宠家用户协议',
      content: '欢迎使用爱宠家小程序！\r\n\r\n1. 请在法律允许范围内使用本软件，禁止发布违法违规内容。\r\n\r\n2. 我们将妥善保管您的个人隐私信息，非经授权绝不向无关第三方泄露。\r\n\r\n3. 您在社区发布的信息应秉持友善交流原则。\r\n\r\n感谢您为宠物提供一个温馨的数字家园！',
      showCancel: false,
      confirmText: '已知晓',
      confirmColor: '#2B3930'
    });
  },

  goToLogin() { wx.navigateBack(); },
  goBack() { wx.navigateBack(); }
});
