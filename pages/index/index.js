// pages/index/index.js
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    banners: [
      { title: '新品上市：萌宠暖冬系列', desc: '给你的毛孩子最温暖的拥抱', pic: '', theme: 'banner-warm' },
      { title: '纯种幼猫直销', desc: '布偶猫·英短·蓝白 品质保证', pic: '', theme: 'banner-cool' },
      { title: '宠物用品大促', desc: '全场买二送一 限时活动', pic: '', theme: 'banner-green' }
    ],
    stats: [
      { icon: '🐾', label: '热门宠物', value: '1,280+' },
      { icon: '✨', label: '天库商品', value: '156' }
    ],
    products: [],
    loading: false,
    currentBanner: 0
  },

  onLoad() {},

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(0);
    }
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh());
  },

  loadData() {
    this.setData({ loading: true });
    return api.getIndexData().then(res => {
      const d = res.data || {};
      
      // 更新轮播图数据（如果后端返回了）
      if (d.banners && d.banners.length > 0) {
        const banners = d.banners.map((pic, index) => ({
          title: ['新品上市：萌宠暖冬系列', '纯种幼猫直销', '宠物用品大促'][index] || '精选推荐',
          desc: ['给你的毛孩子最温暖的拥抱', '布偶猫·英短·蓝白 品质保证', '全场买二送一 限时活动'][index] || '更多惊喜等你发现',
          pic: pic,
          theme: ['banner-warm', 'banner-cool', 'banner-green'][index] || 'banner-warm'
        }));
        this.setData({ banners });
      }
      
      // 统计数据
      const productCount = (d.recommendProducts || []).length;
      const stats = [
        { icon: '🐾', label: '热门宠物', value: productCount > 0 ? productCount + '+' : '1,280+' },
        { icon: '✨', label: '精选商品', value: (d.categories || []).length || '156' }
      ];
      
      // 推荐商品
      const products = (d.recommendProducts || []).map(p => ({
        ...p,
        firstPic: util.getFirstPic(p.picUrls)
      }));
      
      this.setData({ stats, products, loading: false });
    }).catch(() => {
      // 接口失败时加载商品列表兜底
      return api.getProductPage({ page: 1, size: 6 }).then(res => {
        const products = (res.data?.records || []).map(p => ({
          ...p, firstPic: util.getFirstPic(p.picUrls)
        }));
        this.setData({ products, loading: false });
      }).catch(() => { this.setData({ loading: false }); });
    });
  },

  onBannerChange(e) {
    this.setData({ currentBanner: e.detail.current });
  },

  goToSearch() { wx.switchTab({ url: '/pages/shop/shop' }); },
  goToShop() { wx.switchTab({ url: '/pages/shop/shop' }); },
  goToDetail(e) { wx.navigateTo({ url: `/pages/shop/detail/detail?id=${e.currentTarget.dataset.id}` }); },

  addToCartQuick(e) {
    api.addToCart({ productId: e.currentTarget.dataset.id, quantity: 1 }).then(() => {
      wx.showToast({ title: '已加入购物车', icon: 'success' });
      getApp().updateCartCount();
    });
  }
});
