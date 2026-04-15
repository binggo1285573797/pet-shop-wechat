// pages/profile/address/address.js
const api = require('../../../utils/api');

Page({
  data: { 
    addresses: [], 
    isSelect: false,
    loading: true
  },

  onLoad(options) {
    this.setData({ 
      isSelect: options.select === '1',
      loading: true
    });
    this.loadAddresses();
  },

  onShow() { 
    this.loadAddresses(); 
  },

  loadAddresses() {
    this.setData({ loading: true });
    api.getAddressList().then(res => {
      this.setData({ 
        addresses: res.data || [],
        loading: false
      });
    }).catch(() => {
      this.setData({ loading: false });
    });
  },

  selectAddress(e) {
    if (!this.data.isSelect) return;
    getApp().globalData.selectedAddress = e.currentTarget.dataset.address;
    wx.navigateBack();
  },

  addAddress() {
    wx.navigateTo({ url: '/pages/profile/address-edit/address-edit' });
  },

  editAddress(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({ url: `/pages/profile/address-edit/address-edit?id=${item.id}&data=${encodeURIComponent(JSON.stringify(item))}` });
  },

  setDefault(e) {
    api.setDefaultAddress(e.currentTarget.dataset.id).then(() => {
      wx.showToast({ title: '已设为默认', icon: 'success' });
      this.loadAddresses();
    });
  },

  deleteAddress(e) {
    wx.showModal({ 
      title: '确认删除',
      content: '确定要删除这个收货地址吗？',
      confirmColor: '#FF8A65',
      success: res => {
        if (res.confirm) {
          api.deleteAddress(e.currentTarget.dataset.id).then(() => {
            wx.showToast({ title: '删除成功', icon: 'success' });
            this.loadAddresses();
          });
        }
      }
    });
  },

  goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({ url: '/pages/profile/profile' });
    }
  }
});
