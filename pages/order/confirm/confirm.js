// pages/order/confirm/confirm.js
const api = require('../../../utils/api');
const util = require('../../../utils/util');

Page({
  data: {
    address: null,
    orderItems: [],
    totalAmount: '0.00',
    totalQty: 0,
    cartIds: [],
    orderNote: '',
    noteLength: 0,
    loading: false,
    fromCart: true,
    directItems: null
  },

  onLoad(options) {
    if (options.cartIds) {
      try {
        this.setData({
          cartIds: JSON.parse(decodeURIComponent(options.cartIds)),
          fromCart: true
        });
      } catch (e) {
        console.error('解析 cartIds 失败:', e);
      }
    }

    if (options.items) {
      try {
        const items = JSON.parse(decodeURIComponent(options.items));
        this.setData({ fromCart: false, directItems: items });
        this.loadProductItems(items);
      } catch (e) {
        console.error('解析 items 失败:', e);
      }
    }

    this.loadDefaultAddress();

    if (!options.items) {
      this.buildOrderItemsFromCart();
    }
  },

  loadProductItems(items) {
    if (!items || items.length === 0) return;

    const productId = items[0].productId;
    const quantity = items[0].quantity;

    api.getProductDetail(productId).then(res => {
      const p = res.data;
      const pics = p.picUrls ? p.picUrls.split(',')[0] : '';
      const orderItems = [{
        productId: p.id,
        productName: p.name,
        productPic: pics,
        productPrice: p.price,
        quantity: quantity
      }];

      const total = orderItems.reduce((s, i) => s + i.productPrice * i.quantity, 0);
      const totalQty = orderItems.reduce((s, i) => s + i.quantity, 0);

      this.setData({
        orderItems,
        totalAmount: total.toFixed(2),
        totalQty
      });
    }).catch(err => {
      console.error('加载商品详情失败:', err);
      wx.showToast({ title: '加载商品失败', icon: 'none' });
    });
  },

  loadDefaultAddress() {
    api.getAddressList().then(res => {
      const list = res.data || [];
      const def = list.find(a => a.isDefault === 1) || list[0];
      if (def) this.setData({ address: def });
    }).catch(err => {
      console.error('加载地址失败:', err);
    });
  },

  buildOrderItemsFromCart() {
    api.getCartList().then(res => {
      const allItems = res.data || [];
      const items = this.data.cartIds && this.data.cartIds.length > 0
        ? allItems.filter(i => this.data.cartIds.includes(i.id))
        : allItems;

      const orderItems = items.map(i => ({
        productId: i.productId,
        productName: i.productName,
        productPic: i.productPic || '',
        productPrice: i.productPrice,
        quantity: i.quantity
      }));

      const total = orderItems.reduce((s, i) => s + i.productPrice * i.quantity, 0);
      const totalQty = orderItems.reduce((s, i) => s + i.quantity, 0);

      this.setData({
        orderItems,
        totalAmount: total.toFixed(2),
        totalQty
      });
    }).catch(err => {
      console.error('加载购物车失败:', err);
    });
  },

  selectAddress() {
    wx.navigateTo({
      url: '/pages/profile/address/address?select=1'
    });
  },

  onShow() {
    const selected = getApp().globalData.selectedAddress;
    if (selected) {
      this.setData({ address: selected });
      getApp().globalData.selectedAddress = null;
    }
  },

  onNoteInput(e) {
    const value = e.detail.value;
    this.setData({
      orderNote: value,
      noteLength: value.length
    });
  },

  goBack() {
    wx.navigateBack();
  },

  submitOrder() {
    if (!this.data.address) {
      wx.showToast({ title: '请选择收货地址', icon: 'none' });
      return;
    }

    if (this.data.orderItems.length === 0) {
      wx.showToast({ title: '没有可购买的商品', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    const params = {
      addressId: this.data.address.id,
      remark: this.data.orderNote
    };

    if (this.data.fromCart && this.data.cartIds.length > 0) {
      params.cartIds = this.data.cartIds;
    } else {
      params.items = this.data.orderItems.map(i => ({
        productId: i.productId,
        quantity: i.quantity
      }));
    }

    api.createOrder(params).then(res => {
      wx.showToast({ title: '下单成功！', icon: 'success' });

      setTimeout(() => {
        wx.redirectTo({ url: '/pages/order/list/list' });
      }, 800);
    }).catch(err => {
      console.error('下单失败:', err);
      this.setData({ loading: false });
      wx.showToast({
        title: err.message || '下单失败，请重试',
        icon: 'none'
      });
    });
  }
});
