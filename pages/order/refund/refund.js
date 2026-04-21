// pages/order/refund/refund.js
const api = require('../../../utils/api');
const util = require('../../../utils/util');

Page({
  data: {
    orderId: null,
    order: null,
    items: [],
    form: {
      reason: '',
      refundAmount: 0,
      proofPics: []
    },
    reasonOptions: [
      '商品质量问题',
      '商品与描述不符',
      '不喜欢/不想要了',
      '拍错/多拍',
      '未按约定时间发货',
      '其他原因'
    ],
    selectedReasonIndex: -1,
    uploading: false,
    submitting: false
  },

  onLoad(options) {
    const orderId = options.orderId;
    this.setData({ orderId });
    this.loadOrderDetail(orderId);
  },

  loadOrderDetail(orderId) {
    api.getOrderDetail(orderId).then(res => {
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
        'form.refundAmount': order.totalAmount
      });
    }).catch(err => {
      console.error('加载订单详情失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  // 选择退款原因
  onReasonChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      selectedReasonIndex: index,
      'form.reason': this.data.reasonOptions[index]
    });
  },

  // 上传凭证图片
  uploadImage() {
    if (this.data.form.proofPics.length >= 3) {
      wx.showToast({ title: '最多上传3张图片', icon: 'none' });
      return;
    }

    wx.chooseMedia({
      count: 3 - this.data.form.proofPics.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles = res.tempFiles;
        this.setData({ uploading: true });

        const uploadPromises = tempFiles.map(file => 
          api.uploadImage(file.tempFilePath, 'refund', this.data.orderId)
        );

        Promise.all(uploadPromises).then(results => {
          // 处理返回结果，提取图片URL
          const urls = results.map(result => {
            // 如果返回的是对象，取url字段；否则直接使用
            if (typeof result === 'object' && result !== null) {
              return result.url || result.path || result.filePath || JSON.stringify(result);
            }
            return result;
          }).filter(url => url && typeof url === 'string');
          
          const newPics = [...this.data.form.proofPics, ...urls];
          this.setData({
            'form.proofPics': newPics,
            uploading: false
          });
        }).catch(err => {
          console.error('上传失败:', err);
          this.setData({ uploading: false });
          wx.showToast({ title: '上传失败', icon: 'none' });
        });
      }
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const pics = [...this.data.form.proofPics];
    pics.splice(index, 1);
    this.setData({ 'form.proofPics': pics });
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: this.data.form.proofPics
    });
  },

  // 提交退款申请
  submitRefund() {
    const { reason, proofPics } = this.data.form;
    const { order } = this.data;

    // 校验
    if (!reason) {
      wx.showToast({ title: '请选择退款原因', icon: 'none' });
      return;
    }

    // 退款金额使用订单总金额
    const refundAmount = parseFloat(order.totalAmount);

    const data = {
      orderId: this.data.orderId,
      reason: reason,
      refundAmount: refundAmount,
      proofPics: proofPics.join(',')
    };

    this.setData({ submitting: true });
    wx.showLoading({ title: '提交中...' });

    api.applyRefund(data).then(() => {
      wx.hideLoading();
      this.setData({ submitting: false });
      wx.showToast({ 
        title: '申请已提交', 
        icon: 'success',
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      });
    }).catch(err => {
      wx.hideLoading();
      this.setData({ submitting: false });
      console.error('提交退款申请失败:', err);
      wx.showToast({ title: '提交失败', icon: 'none' });
    });
  },

  goBack() {
    wx.navigateBack();
  }
});
