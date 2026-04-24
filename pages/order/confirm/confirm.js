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
    loading: true,
    fromCart: true,
    directItems: null,
    merchantName: '',
    orderCreated: false,
    orderId: null
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

    this.loadDefaultAddress().then(() => {
      if (options.items) {
        try {
          const items = JSON.parse(decodeURIComponent(options.items));
          this.setData({ fromCart: false, directItems: items });
          this.loadProductItems(items).then(() => {
            this.autoCreateOrder();
          });
        } catch (e) {
          console.error('解析 items 失败:', e);
        }
      } else {
        this.buildOrderItemsFromCart().then(() => {
          this.autoCreateOrder();
        });
      }
    });
  },

  // 自动创建订单
  autoCreateOrder() {
    const { address, orderItems, fromCart, cartIds } = this.data;
    
    if (!address) {
      wx.showToast({ title: '请选择收货地址', icon: 'none' });
      this.setData({ loading: false, orderCreated: true });
      return;
    }

    if (orderItems.length === 0) {
      wx.showToast({ title: '没有可购买的商品', icon: 'none' });
      this.setData({ loading: false, orderCreated: true });
      return;
    }

    const params = {
      addressId: address.id,
      remark: this.data.orderNote
    };

    if (fromCart && cartIds.length > 0) {
      params.cartIds = cartIds;
    } else {
      params.items = orderItems.map(i => ({
        productId: i.productId,
        quantity: i.quantity
      }));
    }

    api.createOrder(params).then(res => {
      const orderId = res.data;
      console.log('订单自动创建成功, orderId:', orderId);
      
      // 清空购物车（从购物车结算时）
      if (fromCart && cartIds && cartIds.length > 0) {
        this.clearCartItems();
      }
      
      this.setData({ 
        loading: false,
        orderCreated: true,
        orderId: orderId
      });
    }).catch(err => {
      console.error('自动创建订单失败:', err);
      this.setData({ 
        loading: false,
        orderCreated: true,
        orderId: null
      });
      wx.showModal({
        title: '订单创建失败',
        content: (err.message || '创建订单失败') + '\n\n点击"立即购买"直接跳转到订单列表选择待付款订单支付',
        showCancel: false,
        confirmText: '我知道了'
      });
    });
  },

  loadProductItems(items) {
    if (!items || items.length === 0) return Promise.resolve();

    const productId = items[0].productId;
    const quantity = items[0].quantity;

    return api.getProductDetail(productId).then(res => {
      const p = res.data;
      // 兼容处理：picUrls可能是数组或字符串
      let productPic = '';
      if (p.picUrls) {
        if (Array.isArray(p.picUrls)) {
          productPic = p.picUrls[0] || '';
        } else if (typeof p.picUrls === 'string') {
          productPic = p.picUrls.split(',')[0];
        }
      }
      const orderItems = [{
        productId: p.id,
        productName: p.name,
        productPic: productPic,
        productPrice: p.price,
        quantity: quantity,
        merchantId: p.merchantId
      }];

      const total = orderItems.reduce((s, i) => s + i.productPrice * i.quantity, 0);
      const totalQty = orderItems.reduce((s, i) => s + i.quantity, 0);

      this.setData({
        orderItems,
        totalAmount: total.toFixed(2),
        totalQty
      });

      // 加载商家信息
      return this.loadMerchantInfo(p.merchantId);
    }).catch(err => {
      console.error('加载商品详情失败:', err);
      wx.showToast({ title: '加载商品失败', icon: 'none' });
      return Promise.resolve();
    });
  },

  // 加载商家信息
  loadMerchantInfo(merchantId) {
    if (!merchantId) return Promise.resolve();
    return api.getMerchantDetail(merchantId).then(res => {
      const merchant = res.data;
      this.setData({
        merchantName: merchant.shopName || merchant.name || '未知商家'
      });
      return Promise.resolve();
    }).catch(err => {
      console.error('加载商家信息失败:', err);
      this.setData({ merchantName: '萌宠天地' });
      return Promise.resolve();
    });
  },

  loadDefaultAddress() {
    return api.getAddressList().then(res => {
      const list = res.data || [];
      const def = list.find(a => a.isDefault === 1) || list[0];
      if (def) {
        this.setData({ address: def });
      }
      return Promise.resolve();
    }).catch(err => {
      console.error('加载地址失败:', err);
      return Promise.resolve();
    });
  },

  buildOrderItemsFromCart() {
    return api.getCartList().then(res => {
      const allItems = res.data || [];
      const items = this.data.cartIds && this.data.cartIds.length > 0
        ? allItems.filter(i => this.data.cartIds.includes(i.id))
        : allItems;

      const orderItems = items.map(i => ({
        productId: i.productId,
        productName: i.productName,
        productPic: i.productPic || '',
        productPrice: i.productPrice,
        quantity: i.quantity,
        merchantId: i.merchantId
      }));

      const total = orderItems.reduce((s, i) => s + i.productPrice * i.quantity, 0);
      const totalQty = orderItems.reduce((s, i) => s + i.quantity, 0);

      this.setData({
        orderItems,
        totalAmount: total.toFixed(2),
        totalQty
      });

      // 如果有商品，获取第一个商品的商家信息
      if (orderItems.length > 0 && orderItems[0].merchantId) {
        this.loadMerchantInfo(orderItems[0].merchantId);
      }
      return Promise.resolve();
    }).catch(err => {
      console.error('加载购物车失败:', err);
      return Promise.resolve();
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
    // 从确认页返回时，提示30分钟内支付
    wx.showModal({
      title: '提示',
      content: '请在30分钟内完成支付，超时订单将自动取消',
      showCancel: false,
      confirmText: '我知道了',
      success: () => {
        wx.navigateBack();
      }
    });
  },

  // 立即支付
  payNow() {
    const { orderId, orderCreated } = this.data;
    if (!orderId) {
      if (!orderCreated) {
        wx.showToast({ title: '订单创建中，请稍候', icon: 'none' });
      } else {
        wx.showToast({ title: '订单信息异常，请返回重试', icon: 'none' });
      }
      return;
    }

    wx.navigateTo({
      url: `/pages/order/payment/payment?orderId=${orderId}`
    });
  },

  // 清空购物车中的结算商品
  clearCartItems() {
    console.log('开始清空购物车, cartIds:', this.data.cartIds);
    if (this.data.cartIds && this.data.cartIds.length > 0) {
      // 批量删除购物车商品
      const deletePromises = this.data.cartIds.map(cartId => {
        console.log('删除购物车商品:', cartId);
        return api.deleteCartItem(cartId).then(() => {
          console.log('删除成功:', cartId);
        }).catch(err => {
          console.error('删除购物车商品失败:', cartId, err);
        });
      });
      Promise.all(deletePromises).then(() => {
        console.log('购物车已清空');
        // 刷新购物车页面
        const pages = getCurrentPages();
        const cartPage = pages.find(p => p.route === 'pages/cart/cart');
        if (cartPage && cartPage.loadCart) {
          cartPage.loadCart();
        }
      });
    } else {
      console.log('没有需要清空的购物车商品');
    }
  }
});
