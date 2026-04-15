// pages/order/detail/detail.js
const api = require('../../../utils/api');
const util = require('../../../utils/util');

const STATUS_ICONS = { 0: '💳', 1: '📦', 2: '🚚', 3: '✅', 4: '🔄', 5: '❌' };

Page({
  data: {
    order: null,
    items: [],
    statusIcon: ''
  },

  onLoad(options) {
    this.orderId = options.id;
    this.loadDetail();
  },

  loadDetail() {
    api.getOrderDetail(this.orderId).then(res => {
      const data = res.data;
      const order = data.order || data;
      const items = data.items || [];

      this.setData({
        order: {
          ...order,
          statusText: util.formatOrderStatus(order.status),
          createTimeText: util.formatTime(order.createTime),
          totalAmount: (order.totalAmount || 0).toFixed(2)
        },
        items: items,
        statusIcon: STATUS_ICONS[order.status] || '📦'
      });
    }).catch(err => {
      console.error('加载订单详情失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  cancelOrder() {
    wx.showModal({
      title: '确认取消订单？',
      content: '取消后订单将无法恢复',
      confirmColor: '#ff8a65',
      success: res => {
        if (res.confirm) {
          api.cancelOrder(this.orderId).then(() => {
            wx.showToast({ title: '已取消', icon: 'success' });
            this.loadDetail();
          }).catch(() => {
            wx.showToast({ title: '取消失败', icon: 'none' });
          });
        }
      }
    });
  },

  payOrder() {
    wx.showModal({
      title: '确认支付',
      content: '是否确认支付该订单？',
      confirmColor: '#ff8a65',
      success: res => {
        if (res.confirm) {
          wx.showLoading({ title: '支付中...' });
          api.payOrder(this.orderId).then(() => {
            wx.hideLoading();
            wx.showToast({ title: '支付成功', icon: 'success' });
            this.loadDetail();
          }).catch(() => {
            wx.hideLoading();
            wx.showToast({ title: '支付失败', icon: 'none' });
          });
        }
      }
    });
  },

  confirmReceipt() {
    wx.showModal({
      title: '确认已收货？',
      confirmColor: '#ff8a65',
      success: res => {
        if (res.confirm) {
          api.confirmReceipt(this.orderId).then(() => {
            wx.showToast({ title: '确认成功', icon: 'success' });
            this.loadDetail();
          }).catch(() => {
            wx.showToast({ title: '确认失败', icon: 'none' });
          });
        }
      }
    });
  },

  goBack() {
    wx.navigateBack();
  }
});
