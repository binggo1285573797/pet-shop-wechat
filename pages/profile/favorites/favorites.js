// pages/profile/favorites/favorites.js
const api = require('../../../utils/api');

Page({
  data: {
    favorites: [],
    loading: true,
    activeTab: 'all'
  },

  onLoad() {
    this.loadFavorites();
  },

  onShow() {
    this.loadFavorites();
  },

  loadFavorites() {
    this.setData({ loading: true });
    api.getFavoriteList({ page: 1, size: 100 }).then(res => {
      const list = res.data.records || [];
      this.setData({
        favorites: list,
        loading: false
      });
    }).catch(() => {
      this.setData({ loading: false });
    });
  },

  goToDetail(e) {
    const item = e.currentTarget.dataset.item;
    if (item.targetType === 'PRODUCT') {
      wx.navigateTo({ url: `/pages/shop/detail/detail?id=${item.targetId}` });
    } else if (item.targetType === 'POST') {
      wx.navigateTo({ url: `/pages/community/detail/detail?id=${item.targetId}` });
    }
  },

  unfavorite(e) {
    const item = e.currentTarget.dataset.item;
    const typeText = item.targetType === 'PRODUCT' ? '商品' : '帖子';
    wx.showModal({
      title: '取消收藏',
      content: `确定要取消收藏这个${typeText}吗？`,
      confirmColor: '#FF8A65',
      success: (res) => {
        if (res.confirm) {
          api.deleteFavorite(item.targetId).then(() => {
            wx.showToast({ title: '已取消收藏', icon: 'success' });
            this.loadFavorites();
          }).catch(() => {
            wx.showToast({ title: '操作失败', icon: 'none' });
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
