// pages/pet/pets/pets.js
// 爱宠资料本地存储管理（后端无专属接口则本地保存）
Page({
  data: { pets: [] },
  onLoad() { this.loadPets(); },
  onShow() { this.loadPets(); },
  loadPets() {
    const pets = wx.getStorageSync('myPets') || [];
    this.setData({ pets });
  },
  addPet() { wx.navigateTo({ url: '/pages/pet/edit/edit' }); },
  editPet(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({ url: `/pages/pet/edit/edit?data=${encodeURIComponent(JSON.stringify(item))}` });
  },
  deletePet(e) {
    wx.showModal({ title: '确认删除此档案？', success: res => {
      if (res.confirm) {
        const pets = this.data.pets.filter(p => p.id !== e.currentTarget.dataset.id);
        wx.setStorageSync('myPets', pets);
        this.setData({ pets });
      }
    }});
  }
});
