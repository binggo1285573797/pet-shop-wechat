// pages/profile/info/info.js
const api = require('../../../utils/api');

Page({
  data: { userInfo: null, form: { username:'', phone:'', oldPwd:'', newPwd:'' }, loading: false },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({ userInfo, form: { ...this.data.form, username: userInfo.username||'', phone: userInfo.phone||'' } });
  },

  setField(field, e) {
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  changeAvatar() {
    wx.showToast({ title: '图片上传功能开发中', icon: 'none' });
  },

  saveInfo() {
    const { username, phone, oldPwd, newPwd } = this.data.form;
    if (!username.trim()) { wx.showToast({ title: '用户名不能为空', icon: 'none' }); return; }
    this.setData({ loading: true });

    const tasks = [api.updateUserInfo({ username: username.trim(), phone: phone||null })];
    if (oldPwd && newPwd) {
      if (newPwd.length < 6) { wx.showToast({ title: '新密码至少6位', icon: 'none' }); this.setData({ loading: false }); return; }
      tasks.push(api.updatePassword({ oldPassword: oldPwd, newPassword: newPwd }));
    }

    Promise.all(tasks).then(() => {
      wx.showToast({ title: '保存成功', icon: 'success' });
      wx.setStorageSync('userInfo', { ...this.data.userInfo, username: username.trim(), phone });
      setTimeout(() => wx.navigateBack(), 800);
    }).catch(() => {
      this.setData({ loading: false });
    });
  }
});
