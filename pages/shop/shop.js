const api = require('../../utils/api');
const util = require('../../utils/util');

// 固定四大分类
// type: 1=宠物, 2=用品
const FIXED_CATEGORIES = [
  { id: 'cat', name: '猫咪', icon: 'pets', type: 1 },
  { id: 'dog', name: '狗狗', icon: 'pets', type: 1 },
  { id: 'food', name: '粮食', icon: 'restaurant', type: 2 },
  { id: 'supplies', name: '用品', icon: 'shopping_bag', type: 2 }
];

Page({
  data: {
    keyword: '',
    categories: FIXED_CATEGORIES,
    activeCategoryId: '',
    products: [],
    page: 1,
    pageSize: 10,
    loading: false,
    noMore: false
  },

  onLoad() {
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
    this.loadProducts(true).then(() => {
      wx.stopPullDownRefresh();
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
    
    // 根据分类筛选 - 使用 type 参数
    // 猫咪/狗狗 -> type=1 (宠物)
    // 粮食/用品 -> type=2 (用品)
    if (this.data.activeCategoryId) {
      const category = FIXED_CATEGORIES.find(c => c.id === this.data.activeCategoryId);
      if (category) {
        params.type = category.type;
      }
    }

    return api.getProductPage(params).then(res => {
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
    // 如果点击的是当前激活的分类，则取消筛选
    const newId = this.data.activeCategoryId === id ? '' : id;
    this.setData({ activeCategoryId: newId });
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
