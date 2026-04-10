// pages/shop/shop.js
const api = require('../../utils/api');
const util = require('../../utils/util');

// 分类图标映射
const CATEGORY_ICONS = {
  '猫': 'pets',
  '狗': 'pets',
  '兔子': 'cruelty_free',
  '鸟类': 'flutter',
  '水族': 'water_drop',
  '猫粮': 'restaurant',
  '狗粮': 'restaurant',
  '零食': 'cake',
  '玩具': 'toys',
  '用品': 'shopping_bag',
  '医疗': 'medical_services',
  '美容': 'spa',
  '服装': 'checkroom',
  '窝垫': 'bed'
};

Page({
  data: {
    keyword: '',
    categories: [],
    activeCategoryId: 0,
    products: [],
    page: 1,
    pageSize: 10,
    loading: false,
    noMore: false
  },

  onLoad() {
    this.loadCategories();
    this.loadProducts(true);
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(1);
    }
  },

  onReachBottom() {
    if (!this.data.noMore && !this.data.loading) {
      this.loadProducts(false);
    }
  },

  onPullDownRefresh() {
    this.loadCategories();
    this.loadProducts(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  loadCategories() {
    api.getCategoryList().then(res => {
      console.log('分类数据:', res.data);
      const categories = (res.data || []).map(cat => ({
        ...cat,
        icon: CATEGORY_ICONS[cat.name] || 'category'
      }));
      this.setData({ categories });
    }).catch(err => {
      console.error('加载分类失败:', err);
      wx.showToast({ title: '加载分类失败', icon: 'none' });
    });
  },

  loadProducts(reset = true) {
    if (this.data.loading) return Promise.resolve();
    const page = reset ? 1 : this.data.page + 1;
    this.setData({ loading: true, ...(reset ? { products: [], noMore: false } : {}) });

    const params = {
      page,
      size: this.data.pageSize
    };
    
    if (this.data.keyword) {
      params.keyword = this.data.keyword;
    }
    
    if (this.data.activeCategoryId && this.data.activeCategoryId !== 0) {
      params.categoryId = this.data.activeCategoryId;
    }

    return api.getProductPage(params).then(res => {
      console.log('商品数据:', res.data);
      const records = (res.data?.records || []).map(p => ({
        ...p,
        firstPic: util.getFirstPic(p.picUrls)
      }));
      const products = reset ? records : [...this.data.products, ...records];
      this.setData({
        products,
        page,
        loading: false,
        noMore: records.length < this.data.pageSize
      });
    }).catch(err => {
      console.error('加载商品失败:', err);
      this.setData({ loading: false });
      wx.showToast({ title: '加载商品失败', icon: 'none' });
    });
  },

  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.loadProducts(true);
  },

  clearSearch() {
    this.setData({ keyword: '' });
    this.loadProducts(true);
  },

  onCategoryTap(e) {
    const id = e.currentTarget.dataset.id;
    console.log('选择分类:', id);
    this.setData({ activeCategoryId: id });
    this.loadProducts(true);
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/shop/detail/detail?id=${id}` });
  },

  addToCart(e) {
    const id = e.currentTarget.dataset.id;
    api.addToCart({ productId: id, quantity: 1 }).then(() => {
      wx.showToast({ title: '已加入购物车', icon: 'success' });
      if (getApp().updateCartCount) {
        getApp().updateCartCount();
      }
    }).catch(() => {
      wx.showToast({ title: '请先登录', icon: 'none' });
    });
  }
});
