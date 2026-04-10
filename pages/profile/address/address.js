// pages/profile/address/address.js
const api = require('../../../utils/api');

Page({
  data: { addresses: [], isSelect: false },

  onLoad(options) {
    this.setData({ isSelect: options.select === '1' });
    this.loadAddresses();
  },

  onShow() { this.loadAddresses(); },

  loadAddresses() {
    api.getAddressList().then(res => {
      this.setData({ addresses: res.data || [] });
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
    wx.showModal({ title: '确认删除此地址？', success: res => {
      if (res.confirm) api.deleteAddress(e.currentTarget.dataset.id).then(() => this.loadAddresses());
    }});
  }
});
