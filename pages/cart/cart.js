// pages/cart/cart.js
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    cartItems: [],
    loading: false,
    allChecked: false,
    totalPrice: '0.00',
    checkedCount: 0
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(3);
    }
    // 开发预览时使用模拟数据
    this.loadMockData();
    // 实际使用时调用 this.loadCart();
  },

  // 模拟数据用于预览
  loadMockData() {
    const mockItems = [
      {
        id: 1,
        productId: 101,
        productName: '全价成猫粮 鸡肉味 5kg',
        productPrice: 168.00,
        quantity: 1,
        spec: '5kg装',
        productPic: '',
        checked: true
      },
      {
        id: 2,
        productId: 102,
        productName: '天然无谷狗粮 牛肉配方 2kg',
        productPrice: 128.00,
        quantity: 2,
        spec: '2kg装',
        productPic: '',
        checked: true
      },
      {
        id: 3,
        productId: 103,
        productName: '宠物零食冻干鸡肉粒 500g',
        productPrice: 45.00,
        quantity: 1,
        spec: '500g装',
        productPic: '',
        checked: false
      }
    ];
    this.setData({ cartItems: mockItems, loading: false });
    this.calcTotal();
  },

  loadCart() {
    this.setData({ loading: true });
    api.getCartList().then(res => {
      console.log('购物车数据:', res.data);
      const items = (res.data || []).map(item => ({
        ...item,
        checked: true,
        productPic: util.getFirstPic(item.product?.picUrls || item.productPic || '')
      }));
      this.setData({ cartItems: items, loading: false });
      this.calcTotal();
    }).catch(err => {
      console.error('加载购物车失败:', err);
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  calcTotal() {
    const items = this.data.cartItems;
    const checkedItems = items.filter(i => i.checked);
    const total = checkedItems.reduce((sum, i) => sum + (i.productPrice || 0) * (i.quantity || 1), 0);
    this.setData({
      totalPrice: util.formatPrice(total),
      checkedCount: checkedItems.length,
      allChecked: items.length > 0 && items.every(i => i.checked)
    });
  },

  toggleCheck(e) {
    const id = e.currentTarget.dataset.id;
    const items = this.data.cartItems.map(i => i.id === id ? { ...i, checked: !i.checked } : i);
    this.setData({ cartItems: items });
    this.calcTotal();
  },

  toggleSelectAll() {
    const allChecked = !this.data.allChecked;
    const items = this.data.cartItems.map(i => ({ ...i, checked: allChecked }));
    this.setData({ cartItems: items });
    this.calcTotal();
  },

  increaseQty(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.cartItems.find(i => i.id === id);
    if (!item) return;
    
    api.updateCartItem({ id, quantity: item.quantity + 1 }).then(() => {
      this.loadCart();
      if (getApp().updateCartCount) {
        getApp().updateCartCount();
      }
    }).catch(() => {
      wx.showToast({ title: '更新失败', icon: 'none' });
    });
  },

  decreaseQty(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.cartItems.find(i => i.id === id);
    if (!item) return;
    
    if (item.quantity <= 1) {
      this.deleteItem(e);
      return;
    }
    
    api.updateCartItem({ id, quantity: item.quantity - 1 }).then(() => {
      this.loadCart();
      if (getApp().updateCartCount) {
        getApp().updateCartCount();
      }
    }).catch(() => {
      wx.showToast({ title: '更新失败', icon: 'none' });
    });
  },

  deleteItem(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除？',
      content: '将从购物车中移除此商品',
      success: res => {
        if (res.confirm) {
          api.deleteCartItem(id).then(() => {
            wx.showToast({ title: '已删除', icon: 'success' });
            this.loadCart();
            if (getApp().updateCartCount) {
              getApp().updateCartCount();
            }
          }).catch(() => {
            wx.showToast({ title: '删除失败', icon: 'none' });
          });
        }
      }
    });
  },

  checkout() {
    const checked = this.data.cartItems.filter(i => i.checked);
    if (checked.length === 0) {
      wx.showToast({ title: '请选择商品', icon: 'none' });
      return;
    }
    const cartIds = checked.map(i => i.id);
    wx.navigateTo({ url: `/pages/order/confirm/confirm?cartIds=${JSON.stringify(cartIds)}` });
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      wx.navigateTo({ url: `/pages/shop/detail/detail?id=${id}` });
    }
  },

  goToShop() {
    wx.switchTab({ url: '/pages/shop/shop' });
  }
});
