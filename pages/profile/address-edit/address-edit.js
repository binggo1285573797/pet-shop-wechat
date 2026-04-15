// pages/profile/address-edit/address-edit.js
const api = require('../../../utils/api');
const regionData = require('../../../utils/regionData');

Page({
  data: {
    editId: null,
    form: { 
      receiverName: '', 
      receiverPhone: '', 
      region: '',
      province: '',
      city: '',
      district: '',
      detailAddress: '', 
      isDefault: 0 
    },
    loading: false,
    canSave: false,
    showPicker: false,
    provinces: regionData.provinces,
    cities: [],
    districts: [],
    regionValue: [0, 0, 0],
    tempRegion: {
      province: '',
      city: '',
      district: ''
    },
    phoneValid: false,
    phoneError: false
  },

  onLoad(options) {
    // 初始化城市数据
    this.updateCities(0);
    
    if (options.id) {
      this.setData({ editId: options.id });
      wx.setNavigationBarTitle({ title: '编辑地址' });
      if (options.data) {
        const data = JSON.parse(decodeURIComponent(options.data));
        const form = { 
          receiverName: data.receiverName, 
          receiverPhone: data.receiverPhone,
          region: data.region || '',
          province: data.province || '',
          city: data.city || '',
          district: data.district || '',
          detailAddress: data.detailAddress, 
          isDefault: data.isDefault 
        };
        this.setData({ form });
        this.checkCanSave(form);
      }
    }
  },

  updateCities(provinceIndex) {
    const province = regionData.provinces[provinceIndex];
    const cities = regionData.cities[province] || ['请选择'];
    this.setData({ 
      cities: cities,
      'tempRegion.province': province
    });
    this.updateDistricts(province, 0);
  },

  updateDistricts(province, cityIndex) {
    const city = this.data.cities[cityIndex] || '请选择';
    const districts = regionData.districts[city] || ['请选择'];
    this.setData({ 
      districts: districts,
      'tempRegion.city': city
    });
    this.setData({ 'tempRegion.district': districts[0] || '' });
  },

  onNameInput(e) {
    const form = { ...this.data.form, receiverName: e.detail.value };
    this.setData({ form });
    this.checkCanSave(form);
  },

  onPhoneInput(e) {
    const phone = e.detail.value;
    const form = { ...this.data.form, receiverPhone: phone };
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    const isValid = phoneRegex.test(phone);
    
    this.setData({ 
      form,
      phoneValid: isValid,
      phoneError: phone.length === 11 && !isValid
    });
    this.checkCanSave(form);
  },

  onPhoneBlur(e) {
    const phone = e.detail.value;
    if (phone && phone.length > 0) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      const isValid = phoneRegex.test(phone);
      this.setData({
        phoneValid: isValid,
        phoneError: !isValid
      });
    }
  },

  onAddressInput(e) {
    const form = { ...this.data.form, detailAddress: e.detail.value };
    this.setData({ form });
    this.checkCanSave(form);
  },

  onDefaultChange(e) {
    this.setData({ 'form.isDefault': e.detail.value ? 1 : 0 });
  },

  showRegionPicker() {
    this.setData({ 
      showPicker: true,
      tempRegion: {
        province: this.data.provinces[this.data.regionValue[0]],
        city: this.data.cities[this.data.regionValue[1]],
        district: this.data.districts[this.data.regionValue[2]]
      }
    });
  },

  hideRegionPicker() {
    this.setData({ showPicker: false });
  },

  onRegionChange(e) {
    const value = e.detail.value;
    const provinceIndex = value[0];
    const cityIndex = value[1];
    const districtIndex = value[2];

    // 如果省份变化，更新城市列表
    if (provinceIndex !== this.data.regionValue[0]) {
      this.updateCities(provinceIndex);
      this.setData({ 
        regionValue: [provinceIndex, 0, 0],
        'tempRegion.province': this.data.provinces[provinceIndex],
        'tempRegion.city': this.data.cities[0],
        'tempRegion.district': this.data.districts[0]
      });
    } 
    // 如果城市变化，更新区县列表
    else if (cityIndex !== this.data.regionValue[1]) {
      const province = this.data.provinces[provinceIndex];
      this.updateDistricts(province, cityIndex);
      this.setData({ 
        regionValue: [provinceIndex, cityIndex, 0],
        'tempRegion.city': this.data.cities[cityIndex],
        'tempRegion.district': this.data.districts[0]
      });
    }
    // 如果区县变化
    else {
      this.setData({ 
        regionValue: value,
        'tempRegion.district': this.data.districts[districtIndex]
      });
    }
  },

  confirmRegion() {
    const { province, city, district } = this.data.tempRegion;
    const region = `${province} ${city} ${district}`;
    const form = { 
      ...this.data.form, 
      region,
      province,
      city,
      district
    };
    this.setData({ 
      form,
      showPicker: false 
    });
    this.checkCanSave(form);
  },

  checkCanSave(form) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    const canSave = form.receiverName.trim() && 
                    phoneRegex.test(form.receiverPhone) &&
                    form.region &&
                    form.detailAddress.trim();
    this.setData({ canSave });
  },

  saveAddress() {
    const { receiverName, receiverPhone, region, detailAddress } = this.data.form;
    if (!receiverName.trim()) { wx.showToast({ title: '请输入收货人姓名', icon: 'none' }); return; }
    if (!receiverPhone || receiverPhone.length !== 11) { wx.showToast({ title: '请输入正确手机号', icon: 'none' }); return; }
    if (!region) { wx.showToast({ title: '请选择所在地区', icon: 'none' }); return; }
    if (!detailAddress.trim()) { wx.showToast({ title: '请输入详细地址', icon: 'none' }); return; }

    this.setData({ loading: true });
    const payload = { ...this.data.form };
    
    // 根据是否有 editId 判断是新增还是编辑
    const promise = this.data.editId 
      ? api.updateAddress(this.data.editId, payload)
      : api.saveAddress(payload);

    promise.then(() => {
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 800);
    }).catch(() => { 
      this.setData({ loading: false }); 
    });
  },

  goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.redirectTo({ url: '/pages/profile/address/address' });
    }
  }
});
