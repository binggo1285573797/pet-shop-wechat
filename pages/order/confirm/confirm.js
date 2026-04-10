// pages/order/confirm/confirm.js
const api = require('../../../utils/api');
const util = require('../../../utils/util');

Page({
  data: { address: null, orderItems: [], totalAmount: '0.00', cartIds: [], loading: false },

  onLoad(options) {
    // 从购物车来：cartIds=["1","2"]
    // 从商品详情来：items=[{productId,quantity}]
    if (options.cartIds) {
      this.cartIds = JSON.parse(decodeURIComponent(options.cartIds));
    }
    this.loadDefaultAddress();
    this.buildOrderItems(options);
  },

  loadDefaultAddress() {
    api.getAddressList().then(res => {
      const list = res.data || [];
      const def = list.find(a => a.isDefault === 1) || list[0];
      if (def) this.setData({ address: def });
    });
  },

  buildOrderItems(options) {
    // 简化：直接从购物车数据构建
    api.getCartList().then(res => {
      const allItems = res.data || [];
      const items = this.cartIds && this.cartIds.length > 0
        ? allItems.filter(i => this.cartIds.includes(i.id))
        : allItems;
      const orderItems = items.map(i => ({
        productId: i.productId,
        productName: i.productName || i.product?.name,
        productPic: util.getFirstPic(i.product?.picUrls || ''),
        productPrice: i.productPrice || i.product?.price,
        quantity: i.quantity
      }));
      const total = orderItems.reduce((s, i) => s + i.productPrice * i.quantity, 0);
      this.setData({ orderItems, totalAmount: util.formatPrice(total) });
    });
  },

  selectAddress() {
    wx.navigateTo({ url: '/pages/profile/address/address?select=1' });
  },

  onShow() {
    // 从地址页返回时更新地址
    const selected = getApp().globalData.selectedAddress;
    if (selected) {
      this.setData({ address: selected });
      getApp().globalData.selectedAddress = null;
    }
  },

  submitOrder() {
    if (!this.data.address) { wx.showToast({ title: '请选择收货地址', icon: 'none' }); return; }
    this.setData({ loading: true });
    api.createOrder({
      cartIds: this.cartIds,
      addressId: this.data.address.id
    }).then(res => {
      wx.showToast({ title: '下单成功！', icon: 'success' });
      getApp().updateCartCount();
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/order/list/list' });
      }, 800);
    }).catch(() => { this.setData({ loading: false }); });
  }
});
