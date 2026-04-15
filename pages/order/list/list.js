// pages/order/list/list.js
const api = require('../../../utils/api');
const util = require('../../../utils/util');

Page({
  data: {
    statusTabs: [
      { label: '全部', value: -1 },
      { label: '待付款', value: 0 },
      { label: '待发货', value: 1 },
      { label: '待收货', value: 2 },
      { label: '已完成', value: 3 },
      { label: '退款中', value: 4 }
    ],
    activeStatus: -1,
    orders: [],
    page: 1,
    loading: false,
    noMore: false
  },

  onLoad() {
    this.loadOrders(true);
  },

  onShow() {
    this.loadOrders(true);
  },

  onStatusTap(e) {
    const status = e.currentTarget.dataset.value;
    this.setData({ activeStatus: status });
    this.loadOrders(true);
  },

  loadOrders(reset = true) {
    if (this.data.loading) return;

    const page = reset ? 1 : this.data.page + 1;
    this.setData({
      loading: true,
      ...(reset ? { orders: [], noMore: false } : {})
    });

    const params = {
      page,
      size: 10
    };

    if (this.data.activeStatus >= 0) {
      params.status = this.data.activeStatus;
    }

    api.getOrderPage(params).then(res => {
      const records = (res.data?.records || []).map(o => {
        const totalQty = o.orderItems ? o.orderItems.reduce((sum, item) => sum + (item.quantity || 1), 0) : 1;

        return {
          ...o,
          statusText: util.formatOrderStatus(o.status),
          statusTag: util.getOrderStatusTag(o.status),
          createTimeText: util.formatTime(o.createTime),
          totalQty: totalQty,
          totalAmount: (o.totalAmount || 0).toFixed(2)
        };
      });

      const orders = reset ? records : [...this.data.orders, ...records];

      this.setData({
        orders,
        page,
        loading: false,
        noMore: records.length < 10
      });
    }).catch(err => {
      console.error('加载订单失败:', err);
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  loadMore() {
    if (!this.data.noMore && !this.data.loading) {
      this.loadOrders(false);
    }
  },

  cancelOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认取消订单？',
      content: '取消后订单将无法恢复',
      confirmColor: '#ff8a65',
      success: res => {
        if (res.confirm) {
          api.cancelOrder(orderId).then(() => {
            wx.showToast({ title: '已取消', icon: 'success' });
            this.loadOrders(true);
          }).catch(err => {
            console.error('取消订单失败:', err);
            wx.showToast({ title: '取消失败', icon: 'none' });
          });
        }
      }
    });
  },

  confirmReceipt(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认已收货？',
      content: '确认后订单将标记为已完成',
      confirmColor: '#ff8a65',
      success: res => {
        if (res.confirm) {
          api.confirmReceipt(orderId).then(() => {
            wx.showToast({ title: '确认成功', icon: 'success' });
            this.loadOrders(true);
          }).catch(err => {
            console.error('确认收货失败:', err);
            wx.showToast({ title: '确认失败', icon: 'none' });
          });
        }
      }
    });
  },

  payOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认支付',
      content: '是否确认支付该订单？',
      confirmColor: '#ff8a65',
      success: res => {
        if (res.confirm) {
          wx.showLoading({ title: '支付中...' });
          api.payOrder(orderId).then(() => {
            wx.hideLoading();
            wx.showToast({ title: '支付成功', icon: 'success' });
            this.loadOrders(true);
          }).catch(err => {
            wx.hideLoading();
            console.error('支付失败:', err);
            wx.showToast({ title: '支付失败', icon: 'none' });
          });
        }
      }
    });
  },

  viewDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order/detail/detail?id=${orderId}`
    });
  },

  goShopping() {
    wx.switchTab({
      url: '/pages/shop/shop'
    });
  },

  stopPropagation() {}
});
