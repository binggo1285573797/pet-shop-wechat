// pages/order/detail/detail.js
const api = require('../../../utils/api');
const util = require('../../../utils/util');

const STATUS_ICONS = { 0: '💳', 1: '📦', 2: '🚚', 3: '✅', 4: '🔄', 5: '❌' };

Page({
  data: { order: null, statusIcon: '' },

  onLoad(options) {
    this.orderId = options.id;
    this.loadDetail();
  },

  loadDetail() {
    api.getOrderDetail(this.orderId).then(res => {
      const o = res.data;
      this.setData({
        order: {
          ...o,
          statusText: util.formatOrderStatus(o.status),
          createTimeText: util.formatTime(o.createTime)
        },
        statusIcon: STATUS_ICONS[o.status] || '📦'
      });
    });
  }
});
