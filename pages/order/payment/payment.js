// pages/order/payment/payment.js
const api = require('../../../utils/api');

Page({
  data: {
    orderId: null,
    order: null,
    selectedMethod: 'wechat',
    isPaying: false
  },

  onLoad(options) {
    this.orderId = options.orderId;
    this.loadOrderInfo();
  },

  loadOrderInfo() {
    wx.showLoading({ title: '加载中...' });
    api.getOrderDetail(this.orderId).then(res => {
      wx.hideLoading();
      const data = res.data;
      const order = data.order || data;
      const items = data.items || [];
      const productNames = items.map(item => item.productName).join('、');

      this.setData({
        order: {
          ...order,
          totalAmount: (order.totalAmount || 0).toFixed(2),
          productNames: productNames
        },
        selectedMethod: 'wechat'
      });
    }).catch(err => {
      wx.hideLoading();
      console.error('加载订单信息失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    });
  },

  selectMethod(e) {
    const method = e.currentTarget.dataset.method;
    this.setData({ selectedMethod: method });
  },

  handlePay() {
    const { selectedMethod, isPaying } = this.data;

    if (isPaying) return;

    if (!selectedMethod) {
      wx.showToast({ title: '请选择支付方式', icon: 'none' });
      return;
    }

    this.setData({ isPaying: true });
    wx.showLoading({ title: '支付中...' });

    api.payOrder(this.orderId).then(() => {
      wx.hideLoading();

      const methodText = selectedMethod === 'wechat' ? '微信支付' : '支付宝';
      this.showPaySuccess(methodText);
    }).catch(() => {
      wx.hideLoading();
      this.setData({ isPaying: false });
      wx.showToast({ title: '支付失败，请重试', icon: 'none' });
    });
  },

  showPaySuccess(methodText) {
    wx.showModal({
      title: '支付成功',
      content: `已通过${methodText}完成支付`,
      showCancel: false,
      confirmText: '查看订单',
      confirmColor: '#43e97b',
      success: () => {
        wx.redirectTo({
          url: `/pages/order/detail/detail?id=${this.orderId}`
        });
      }
    });
  }
});
