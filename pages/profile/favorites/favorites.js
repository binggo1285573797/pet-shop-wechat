// pages/profile/favorites/favorites.js
const api = require('../../../utils/api');

Page({
  data: {
    favorites: [],
    filteredFavorites: [],
    loading: true,
    activeTab: 'product'
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
      // 处理图片路径，添加基础URL
      const BASE_URL = 'http://localhost:8080';
      const processedList = list.map(item => {
        // 处理帖子图片
        if (item.targetType === 1 && item.postPic && !item.postPic.startsWith('http')) {
          item.postPic = BASE_URL + item.postPic;
        }
        // 处理商品图片
        if (item.targetType === 2 && item.productPic && !item.productPic.startsWith('http')) {
          item.productPic = BASE_URL + item.productPic;
        }
        // 处理作者头像
        if (item.authorAvatar && !item.authorAvatar.startsWith('http')) {
          item.authorAvatar = BASE_URL + item.authorAvatar;
        }
        return item;
      });
      this.setData({
        favorites: processedList,
        loading: false
      });
      // 根据当前选项卡筛选数据
      this.filterFavorites();
    }).catch(() => {
      this.setData({ loading: false });
    });
  },

  // 切换选项卡
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab }, () => {
      this.filterFavorites();
    });
  },

  // 筛选收藏数据
  filterFavorites() {
    const { favorites, activeTab } = this.data;
    let filtered = favorites;

    if (activeTab === 'product') {
      filtered = favorites.filter(item => item.targetType === 2);
    } else if (activeTab === 'post') {
      filtered = favorites.filter(item => item.targetType === 1);
    }

    this.setData({ filteredFavorites: filtered });
  },

  goToDetail(e) {
    const item = e.currentTarget.dataset.item;
    if (item.targetType === 2) {
      wx.navigateTo({ url: `/pages/shop/detail/detail?id=${item.targetId}` });
    } else if (item.targetType === 1) {
      wx.navigateTo({ url: `/pages/community/detail/detail?id=${item.targetId}` });
    }
  },

  unfavorite(e) {
    const item = e.currentTarget.dataset.item;
    const typeText = item.targetType === 2 ? '商品' : '帖子';
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
