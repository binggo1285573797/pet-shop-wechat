const api = require('../../../utils/api');

Page({
  data: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    canSubmit: false,
    newPasswordError: false,
    newPasswordMsg: '',
    confirmError: false,
    confirmMsg: ''
  },

  onOldPasswordInput(e) {
    this.setData({ oldPassword: e.detail.value });
    this.checkCanSubmit();
  },

  onNewPasswordInput(e) {
    const newPassword = e.detail.value;
    this.setData({ newPassword, newPasswordError: false });
    this.validateNewPassword(newPassword);
    this.checkCanSubmit();
  },

  onConfirmPasswordInput(e) {
    const confirmPassword = e.detail.value;
    this.setData({ confirmPassword, confirmError: false });
    this.validateConfirmPassword(confirmPassword);
    this.checkCanSubmit();
  },

  validateNewPassword(password) {
    if (password.length > 0 && password.length < 6) {
      this.setData({
        newPasswordError: true,
        newPasswordMsg: '密码长度不能少于6位'
      });
      return false;
    }
    this.setData({ newPasswordError: false, newPasswordMsg: '' });
    return true;
  },

  validateConfirmPassword(confirmPassword) {
    if (confirmPassword.length > 0 && confirmPassword !== this.data.newPassword) {
      this.setData({
        confirmError: true,
        confirmMsg: '两次输入的密码不一致'
      });
      return false;
    }
    this.setData({ confirmError: false, confirmMsg: '' });
    return true;
  },

  checkCanSubmit() {
    const canSubmit = this.data.oldPassword.length > 0 
      && this.data.newPassword.length >= 6 
      && this.data.confirmPassword.length > 0
      && !this.data.newPasswordError
      && !this.data.confirmError;
    this.setData({ canSubmit });
  },

  submitChange() {
    if (!this.data.canSubmit) {
      wx.showToast({ title: '请检查输入', icon: 'none' });
      return;
    }

    if (this.data.oldPassword === this.data.newPassword) {
      wx.showToast({ title: '新密码不能与原密码相同', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '修改中...', mask: true });

    api.updatePassword({
      oldPassword: this.data.oldPassword,
      newPassword: this.data.newPassword
    }).then(() => {
      wx.hideLoading();
      wx.showModal({
        title: '密码修改成功',
        content: '请使用新密码重新登录',
        showCancel: false,
        success: () => {
          getApp().logout();
        }
      });
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: err.message || '修改失败', icon: 'none' });
    });
  },

  goBack() {
    wx.navigateBack();
  }
});
