// pages/profile/favorites/favorites.js
const api = require('../../../utils/api');
Page({
  data: { favorites: [] },
  onLoad() { this.loadFavorites(); },
  loadFavorites() {
    api.getFavoriteList({ type: 'product' }).then(res => {
      this.setData({ favorites: res.data || [] });
    }).catch(() => {});
  },
  goToDetail(e) {
    wx.navigateTo({ url: `/pages/shop/detail/detail?id=${e.currentTarget.dataset.id}` });
  }
});
