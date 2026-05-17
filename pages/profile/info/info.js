// pages/profile/info/info.js
const api = require('../../../utils/api');

Page({
  data: {
    userInfo: null,
    form: { nickname:'', phone:'' },
    loading: false,
    uploadingAvatar: false,
    phoneError: false,
    phoneErrorMsg: '',
    isEditing: false  // 是否处于编辑模式
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    // 如果不是编辑模式，才重新加载用户信息
    if (!this.data.isEditing) {
      this.loadUserInfo();
    }
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      userInfo,
      form: {
        ...this.data.form,
        nickname: userInfo.nickname || '',
        phone: userInfo.phone || ''
      }
    });
  },

  onNicknameInput(e) {
    this.setData({ 'form.nickname': e.detail.value });
  },

  onPhoneInput(e) {
    const phone = e.detail.value;
    this.setData({ 'form.phone': phone });
    
    // 实时校验手机号
    if (phone && phone.length > 0) {
      this.validatePhone(phone);
    } else {
      this.setData({ phoneError: false, phoneErrorMsg: '' });
    }
  },

  onPhoneBlur(e) {
    const phone = e.detail.value;
    if (phone && phone.length > 0) {
      this.validatePhone(phone);
    }
  },

  // 校验手机号
  validatePhone(phone) {
    // 手机号正则：以1开头，第二位是3-9，后面9位数字
    const phoneRegex = /^1[3-9]\d{9}$/;
    
    if (!phoneRegex.test(phone)) {
      this.setData({
        phoneError: true,
        phoneErrorMsg: '请输入正确的11位手机号码'
      });
      return false;
    } else {
      this.setData({
        phoneError: false,
        phoneErrorMsg: ''
      });
      return true;
    }
  },

  // 更换头像
  changeAvatar() {
    this.chooseImage(['album']);
  },

  // 选择图片
  chooseImage(sourceType) {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: sourceType,
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.uploadAvatar(tempFilePath);
      }
    });
  },

  // 上传头像
  uploadAvatar(filePath) {
    this.setData({ uploadingAvatar: true });
    
    wx.showLoading({ title: '上传中...', mask: true });
    
    api.uploadImage(filePath, 'avatar', this.data.userInfo.id)
      .then((res) => {
        const avatarUrl = res.url;
        // 更新本地显示
        this.setData({ 
          'userInfo.avatar': avatarUrl,
          uploadingAvatar: false
        });
        // 更新缓存
        const userInfo = wx.getStorageSync('userInfo') || {};
        userInfo.avatar = avatarUrl;
        wx.setStorageSync('userInfo', userInfo);
        // 更新服务器
        return api.updateUserInfo({ avatar: avatarUrl });
      })
      .then(() => {
        wx.hideLoading();
        wx.showToast({ title: '头像更新成功', icon: 'success' });
      })
      .catch((err) => {
        wx.hideLoading();
        this.setData({ uploadingAvatar: false });
        wx.showToast({ title: err.message || '上传失败', icon: 'none' });
      });
  },

  // 按钮点击处理
  onActionTap() {
    if (this.data.isEditing) {
      // 当前是编辑模式，点击保存
      this.saveInfo();
    } else {
      // 当前是只读模式，点击进入编辑模式
      this.setData({ isEditing: true });
    }
  },

  // 取消编辑
  cancelEdit() {
    // 恢复原始数据
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      isEditing: false,
      phoneError: false,
      phoneErrorMsg: '',
      form: {
        ...this.data.form,
        nickname: userInfo.nickname || '',
        phone: userInfo.phone || ''
      }
    });
  },

  saveInfo() {
    const { nickname, phone } = this.data.form;
    
    // 校验昵称
    if (!nickname.trim()) { 
      wx.showToast({ title: '昵称不能为空', icon: 'none' }); 
      return; 
    }
    
    // 校验手机号
    if (phone && phone.length > 0) {
      if (!this.validatePhone(phone)) {
        wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
        return;
      }
    }
    
    this.setData({ loading: true });

    const updateData = { 
      nickname: nickname.trim(), 
      phone: phone || null 
    };
    
    // 如果有头像也一起更新
    if (this.data.userInfo.avatar) {
      updateData.avatar = this.data.userInfo.avatar;
    }

    api.updateUserInfo(updateData).then(() => {
      wx.showToast({ title: '保存成功', icon: 'success' });
      const userInfo = { 
        ...this.data.userInfo, 
        nickname: nickname.trim(), 
        phone,
        avatar: this.data.userInfo.avatar
      };
      wx.setStorageSync('userInfo', userInfo);
      // 退出编辑模式
      this.setData({ 
        isEditing: false,
        loading: false,
        userInfo
      });
    }).catch(() => {
      this.setData({ loading: false });
    });
  }
});
