// pages/profile/address-edit/address-edit.js
const api = require('../../../utils/api');

Page({
  data: {
    editId: null,
    form: { receiverName: '', receiverPhone: '', detailAddress: '', isDefault: 0 },
    loading: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ editId: options.id });
      wx.setNavigationBarTitle({ title: '编辑地址' });
      if (options.data) {
        const data = JSON.parse(decodeURIComponent(options.data));
        this.setData({ form: { receiverName: data.receiverName, receiverPhone: data.receiverPhone, detailAddress: data.detailAddress, isDefault: data.isDefault } });
      }
    }
  },

  setField(field, e) { this.setData({ [`form.${field}`]: e.detail.value }); },
  onDefaultChange(e) { this.setData({ 'form.isDefault': e.detail.value ? 1 : 0 }); },

  saveAddress() {
    const { receiverName, receiverPhone, detailAddress } = this.data.form;
    if (!receiverName.trim()) { wx.showToast({ title: '请输入收货人姓名', icon: 'none' }); return; }
    if (!receiverPhone || receiverPhone.length !== 11) { wx.showToast({ title: '请输入正确手机号', icon: 'none' }); return; }
    if (!detailAddress.trim()) { wx.showToast({ title: '请输入详细地址', icon: 'none' }); return; }

    this.setData({ loading: true });
    const payload = { ...this.data.form };
    if (this.data.editId) payload.id = this.data.editId;

    api.saveAddress(payload).then(() => {
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 800);
    }).catch(() => { this.setData({ loading: false }); });
  }
});
