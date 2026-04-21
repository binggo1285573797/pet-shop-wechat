// pages/profile/profile.js
const api = require('../../utils/api');

Page({
  data: {
    userInfo: {},
    pets: []
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    const pets = wx.getStorageSync('myPets') || [];
    this.setData({ userInfo, pets });
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(4);
    }
    const userInfo = wx.getStorageSync('userInfo') || {};
    const pets = wx.getStorageSync('myPets') || [];
    this.setData({ userInfo, pets });

    api.getUserInfo().then(res => {
      const info = res.data;
      wx.setStorageSync('userInfo', info);
      this.setData({ userInfo: info });
    }).catch(() => {});
  },

  goToInfo() { wx.navigateTo({ url: '/pages/profile/info/info' }); },
  goToOrders() { wx.navigateTo({ url: '/pages/order/list/list' }); },
  goToOrdersByStatus(e) {
    wx.navigateTo({ url: `/pages/order/list/list?status=${e.currentTarget.dataset.status}` });
  },
  goToAddress() { wx.navigateTo({ url: '/pages/profile/address/address' }); },
  goToFavorites() { wx.navigateTo({ url: '/pages/profile/favorites/favorites' }); },
  goToPosts() { wx.navigateTo({ url: '/pages/profile/posts/posts' }); },
  goToChangePassword() { wx.navigateTo({ url: '/pages/profile/change-password/change-password' }); },
  goToPets() { wx.navigateTo({ url: '/pages/pet/pets/pets' }); },
  goToPetEdit(e) {
    wx.navigateTo({
      url: `/pages/pet/edit/edit?data=${encodeURIComponent(JSON.stringify(e.currentTarget.dataset.item))}`
    });
  },
  logout() {
    wx.showModal({
      title: '确认退出？',
      content: '退出后需要重新登录',
      success: res => { if (res.confirm) getApp().logout(); }
    });
  }
});
