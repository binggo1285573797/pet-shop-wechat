const api = require('../../utils/api');
const util = require('../../utils/util');

// 固定四大分类
// type: 1=宠物, 2=用品
// categoryId: 后端分类ID（1=狗狗, 2=猫咪, 4=粮食, 8=用品）
const FIXED_CATEGORIES = [
  { id: 'cat', name: '猫咪', icon: 'pets', type: 1, categoryId: 2 },
  { id: 'dog', name: '狗狗', icon: 'pets', type: 1, categoryId: 1 },
  { id: 'food', name: '粮食', icon: 'restaurant', type: 2, categoryId: 4 },
  { id: 'supplies', name: '用品', icon: 'shopping_bag', type: 2, categoryId: 8 }
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
    console.log('触底加载更多, noMore:', this.data.noMore, 'loading:', this.data.loading, 'activeCategoryId:', this.data.activeCategoryId);
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

    // 根据分类筛选
    // 猫咪/狗狗 -> 使用 categoryId 精确筛选
    // 粮食/用品 -> 使用 type 参数
    if (this.data.activeCategoryId) {
      const category = FIXED_CATEGORIES.find(c => c.id === this.data.activeCategoryId);
      if (category) {
        if (category.categoryId) {
          // 宠物分类使用 categoryId 精确筛选
          params.categoryId = category.categoryId;
        } else {
          // 用品分类使用 type 参数
          params.type = category.type;
        }
      }
    }

    console.log('加载商品参数:', params, 'reset:', reset, 'activeCategoryId:', this.data.activeCategoryId);

    return api.getProductPage(params).then(res => {
      const records = (res.data?.records || []).map(p => ({
        ...p,
        firstPic: util.getFirstPic(p.picUrls)
      }));
      // 合并数据并去重
      let products;
      if (reset) {
        products = records;
      } else {
        // 使用 Map 去重，以 id 为 key
        const productMap = new Map();
        this.data.products.forEach(p => productMap.set(p.id, p));
        records.forEach(p => productMap.set(p.id, p));
        products = Array.from(productMap.values());
      }
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
