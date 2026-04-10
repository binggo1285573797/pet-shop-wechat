// pages/order/list/list.js
const api = require('../../../utils/api');
const util = require('../../../utils/util');

Page({
  data: {
    statusTabs: [
      {label:'全部',value:-1}, {label:'待付款',value:0}, {label:'待发货',value:1},
      {label:'待收货',value:2}, {label:'已完成',value:3}, {label:'退款中',value:4}
    ],
    activeStatus: -1,
    orders: [], page: 1, loading: false, noMore: false
  },

  onLoad() { this.loadOrders(true); },
  onShow() { this.loadOrders(true); },

  onStatusTap(e) {
    this.setData({ activeStatus: e.currentTarget.dataset.value });
    this.loadOrders(true);
  },

  loadOrders(reset = true) {
    if (this.data.loading) return;
    const page = reset ? 1 : this.data.page + 1;
    this.setData({ loading: true, ...(reset ? { orders: [], noMore: false } : {}) });
    const status = this.data.activeStatus >= 0 ? this.data.activeStatus : undefined;
    api.getOrderPage({ page, size: 10, status }).then(res => {
      const records = (res.data?.records || []).map(o => ({
        ...o,
        statusText: util.formatOrderStatus(o.status),
        statusTag: util.getOrderStatusTag(o.status),
        createTimeText: util.formatTime(o.createTime)
      }));
      const orders = reset ? records : [...this.data.orders, ...records];
      this.setData({ orders, page, loading: false, noMore: records.length < 10 });
    }).catch(() => { this.setData({ loading: false }); });
  },

  loadMore() { if (!this.data.noMore) this.loadOrders(false); },

  cancelOrder(e) {
    wx.showModal({ title: '确认取消订单？', success: res => {
      if (res.confirm) api.cancelOrder(e.currentTarget.dataset.id).then(() => this.loadOrders(true));
    }});
  },

  confirmReceipt(e) {
    wx.showModal({ title: '确认已收货？', success: res => {
      if (res.confirm) api.confirmReceipt(e.currentTarget.dataset.id).then(() => this.loadOrders(true));
    }});
  },

  payOrder(e) {
    wx.showToast({ title: '支付模拟成功', icon: 'success' });
    // TODO: 对接真实支付
  },

  viewDetail(e) {
    wx.navigateTo({ url: `/pages/order/detail/detail?id=${e.currentTarget.dataset.id}` });
  }
});
