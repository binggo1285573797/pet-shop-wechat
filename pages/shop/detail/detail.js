// pages/shop/detail/detail.js
const api = require('../../../utils/api');
const util = require('../../../utils/util');

Page({
  data: { 
    product: null, 
    picList: [], 
    loading: false,
    currentSwiperIndex: 1,
    statusBarHeight: 20,
    cartCount: 0
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 20 });
    // 确保 productId 是数字类型
    this.productId = parseInt(options.id) || 1;
    this.loadDetail();
  },

  onShow() {
    this.setData({ cartCount: getApp().globalData.cartCount || 0 });
  },

  onSwiperChange(e) {
    this.setData({ currentSwiperIndex: e.detail.current + 1 });
  },

  goBack() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/index/index'}) });
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  goCart() {
    wx.switchTab({ url: '/pages/cart/cart' });
  },

  loadDetail() {
    this.setData({ loading: true });
    api.getProductDetail(this.productId).then(res => {
      const p = res.data;
      // 健壮解析 picUrls（可能是字符串或已被解析的数组）
      let picList = [];
      if (p.picUrls) {
        if (Array.isArray(p.picUrls)) {
          picList = p.picUrls;
        } else if (typeof p.picUrls === 'string') {
          try {
            const parsed = JSON.parse(p.picUrls);
            picList = Array.isArray(parsed) ? parsed : [parsed];
          } catch (e) {
            picList = p.picUrls.split(',').map(s => s.trim()).filter(Boolean);
          }
        }
      }
      // 至少保留一张占位图防止 swiper 空白
      if (picList.length === 0) {
        picList = [''];
      }
      console.log('[detail] picList:', picList);
      this.setData({
        product: p,
        picList,
        loading: false
      });
    }).catch((err) => {
      console.error('[detail] loadDetail error:', err);
      this.setData({ loading: false });
      wx.showToast({ title: '加载商品失败', icon: 'none' });
    });
  },

  addToCart() {
    const app = getApp();
    if (!app.checkLogin()) return;

    // 确保 productId 是数字类型
    const productId = parseInt(this.productId);
    console.log('加入购物车:', { productId, quantity: 1 });

    api.addToCart({ productId: productId, quantity: 1 }).then(() => {
      wx.showToast({ title: '已加入购物车', icon: 'success' });
      if (app.updateCartCount) {
        app.updateCartCount();
      }
      this.setData({ cartCount: app.globalData.cartCount || 0 });
    }).catch(err => {
      console.error('加入购物车失败:', err);
      wx.showToast({ title: err.message || '加入购物车失败', icon: 'none' });
    });
  },

  buyNow() {
    const app = getApp();
    if (!app.checkLogin()) return;

    const p = this.data.product;
    if (!p) {
      wx.showToast({ title: '商品信息加载中', icon: 'none' });
      return;
    }
    
    const info = encodeURIComponent(JSON.stringify([{ productId: parseInt(p.id), quantity: 1 }]));
    wx.navigateTo({ url: `/pages/order/confirm/confirm?items=${info}` });
  }
});
