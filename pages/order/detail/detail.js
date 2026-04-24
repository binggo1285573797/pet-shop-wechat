// pages/order/detail/detail.js
const api = require('../../../utils/api');
const util = require('../../../utils/util');

const STATUS_ICONS = { 
  0: 'schedule',      // 待付款 - 时钟
  1: 'inventory_2',   // 待发货 - 包裹
  2: 'local_shipping',// 待收货 - 运输
  3: 'check_circle',  // 已完成 - 完成
  4: 'cancel',        // 已取消 - 取消
  5: 'lock'           // 已关闭 - 锁定
};

Page({
  data: {
    order: null,
    items: [],
    statusIcon: '',
    countdownText: '',
    fromConfirm: false
  },

  onLoad(options) {
    this.orderId = options.id;
    this.setData({ fromConfirm: options.fromConfirm === '1' });
    this.loadDetail();
  },

  onShow() {
    // 页面显示时刷新订单状态
    if (this.orderId) {
      this.loadDetail();
    }
  },

  onUnload() {
    // 页面卸载时清除定时器
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  },

  loadDetail() {
    api.getOrderDetail(this.orderId).then(res => {
      const data = res.data;
      const order = data.order || data;
      const items = data.items || [];
      const refundApply = data.refundApply || null;

      // 处理退款信息
      let refundInfo = null;
      if (refundApply) {
        const refundStatusMap = {
          0: { text: '待审核', color: '#FF8A65' },
          1: { text: '已同意', color: '#43e97b' },
          2: { text: '已拒绝', color: '#fa709a' },
          3: { text: '已取消', color: '#999' }
        };
        const statusInfo = refundStatusMap[refundApply.status] || { text: '未知', color: '#999' };
        refundInfo = {
          ...refundApply,
          statusText: statusInfo.text,
          statusColor: statusInfo.color,
          refundAmount: (refundApply.refundAmount || 0).toFixed(2),
          proofPics: refundApply.proofPics ? refundApply.proofPics.split(',') : []
        };
      }

      this.setData({
        order: {
          ...order,
          statusText: util.formatOrderStatus(order.status),
          createTimeText: util.formatTime(order.createTime),
          totalAmount: (order.totalAmount || 0).toFixed(2)
        },
        items: items,
        refundInfo: refundInfo,
        statusIcon: STATUS_ICONS[order.status] || '📦'
      });

      // 如果是待付款状态，启动倒计时
      // 兼容 expireTime 和 expire_time 两种字段名
      const expireTime = order.expireTime || order.expire_time;
      if (order.status === 0 && expireTime) {
        this.startCountdown(expireTime);
      } else {
        // 清除倒计时
        if (this.countdownTimer) {
          clearInterval(this.countdownTimer);
          this.setData({ countdownText: '' });
        }
      }
    }).catch(err => {
      console.error('加载订单详情失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  // 启动支付倒计时
  startCountdown(expireTime) {
    // 清除之前的定时器
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const expire = new Date(expireTime).getTime();
      const diff = expire - now;

      if (diff <= 0) {
        // 倒计时结束，清除定时器并刷新订单状态
        clearInterval(this.countdownTimer);
        this.setData({ countdownText: '已过期' });
        this.loadDetail(); // 刷新订单状态
        return;
      }

      // 计算剩余时间
      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);
      this.setData({
        countdownText: `${minutes}分${seconds < 10 ? '0' : ''}${seconds}秒`
      });
    };

    // 立即执行一次
    updateCountdown();
    // 每秒更新
    this.countdownTimer = setInterval(updateCountdown, 1000);
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
    wx.navigateTo({
      url: `/pages/order/payment/payment?orderId=${this.orderId}`
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

  // 待发货状态申请取消（需商家审核）
  applyCancel() {
    wx.showModal({
      title: '申请取消订单',
      content: '提交后需商家审核，审核通过后将退款给您',
      confirmText: '提交申请',
      confirmColor: '#ff8a65',
      success: res => {
        if (res.confirm) {
          wx.showLoading({ title: '提交中...' });
          api.cancelOrder(this.orderId).then(() => {
            wx.hideLoading();
            wx.showToast({ title: '申请已提交', icon: 'success' });
            this.loadDetail();
          }).catch(() => {
            wx.hideLoading();
            wx.showToast({ title: '申请失败', icon: 'none' });
          });
        }
      }
    });
  },

  // 已完成订单申请退款
  applyRefund() {
    wx.navigateTo({
      url: `/pages/order/refund/refund?orderId=${this.orderId}`
    });
  },

  goBack() {
    const { order, fromConfirm } = this.data;
    // 如果是从确认页进入且订单是待付款状态，提示30分钟内支付
    if (fromConfirm && order && order.status === 0) {
      wx.showModal({
        title: '提示',
        content: '请在30分钟内完成支付，超时订单将自动取消',
        showCancel: false,
        confirmText: '我知道了',
        success: () => {
          wx.navigateBack();
        }
      });
    } else {
      wx.navigateBack();
    }
  },

  // 预览退款凭证图片
  previewRefundImage(e) {
    const { url, urls } = e.currentTarget.dataset;
    wx.previewImage({
      current: url,
      urls: urls
    });
  }
});
