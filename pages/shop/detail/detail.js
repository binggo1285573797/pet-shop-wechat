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
    this.productId = options.id || 1; // 仅测试
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
    });
  },

  addToCart() {
    api.addToCart({ productId: this.productId, quantity: 1 }).then(() => {
      wx.showToast({ title: '已加入购物车', icon: 'success' });
      getApp().updateCartCount();
      this.setData({ cartCount: getApp().globalData.cartCount });
    });
  },

  buyNow() {
    // 直接带单个商品到确认订单页
    const p = this.data.product;
    const info = encodeURIComponent(JSON.stringify([{ productId: p.id, quantity: 1 }]));
    wx.navigateTo({ url: `/pages/order/confirm/confirm?items=${info}` });
  }
});
