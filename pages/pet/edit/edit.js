// pages/pet/edit/edit.js
Page({
  data: {
    speciesList: ['猫', '狗', '兔子', '仓鼠', '鸟', '其他'],
    speciesIdx: 0,
    form: { id: null, name: '', species: '', breed: '', age: '', note: '' },
    showSpeciesPicker: false,
    tempSpeciesIdx: 0,
    canSave: false
  },

  onLoad(options) {
    if (options.data) {
      const data = JSON.parse(decodeURIComponent(options.data));
      const speciesIdx = this.data.speciesList.indexOf(data.species);
      this.setData({ 
        form: data, 
        speciesIdx: speciesIdx >= 0 ? speciesIdx : 0,
        tempSpeciesIdx: speciesIdx >= 0 ? speciesIdx : 0
      });
    }
    this.checkCanSave();
  },

  set(field, e) { 
    this.setData({ [`form.${field}`]: e.detail.value });
    this.checkCanSave();
  },

  onSpeciesChange(e) {
    const idx = e.detail.value;
    this.setData({ 
      speciesIdx: idx, 
      'form.species': this.data.speciesList[idx],
      showSpeciesPicker: false
    });
    this.checkCanSave();
  },

  showSpeciesPicker() {
    this.setData({ 
      showSpeciesPicker: true,
      tempSpeciesIdx: this.data.speciesIdx
    });
  },

  hideSpeciesPicker() {
    this.setData({ showSpeciesPicker: false });
  },

  onSpeciesPickerChange(e) {
    this.setData({ tempSpeciesIdx: e.detail.value[0] });
  },

  confirmSpecies() {
    const idx = this.data.tempSpeciesIdx;
    this.setData({ 
      speciesIdx: idx,
      'form.species': this.data.speciesList[idx],
      showSpeciesPicker: false
    });
    this.checkCanSave();
  },

  checkCanSave() {
    const { name, species } = this.data.form;
    const canSave = name.trim() && species;
    this.setData({ canSave });
  },

  save() {
    const { name, species } = this.data.form;
    if (!name.trim()) { wx.showToast({ title: '请输入宠物名字', icon: 'none' }); return; }
    if (!species) { wx.showToast({ title: '请选择物种', icon: 'none' }); return; }

    const pets = wx.getStorageSync('myPets') || [];
    const form = { ...this.data.form, name: name.trim() };
    if (form.id) {
      const idx = pets.findIndex(p => p.id === form.id);
      if (idx >= 0) pets[idx] = form;
    } else {
      form.id = Date.now().toString();
      pets.push(form);
    }
    wx.setStorageSync('myPets', pets);
    wx.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 800);
  },

  goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.redirectTo({ url: '/pages/pet/pets/pets' });
    }
  }
});
