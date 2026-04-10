// app.js
App({
  onLaunch() {
    // 动态加载字体
    wx.loadFontFace({
      family: 'Material Symbols Outlined',
      source: 'url("https://fonts.gstatic.com/s/materialsymbolsoutlined/v199/kJF1BvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oDMzByHX9rA6RzaxHMPdY43zj-jCxv3fzvRNU22ZXGJpEpjC_1n-q_4MrImHCIJIZrDCvHOej.woff2")',
      global: true,
      success: console.log,
      fail: console.warn
    });

    const token = wx.getStorageSync('token') || '';
    const userInfo = wx.getStorageSync('userInfo') || null;
    this.globalData.token = token;
    this.globalData.userInfo = userInfo;

    if (!token) {
      wx.reLaunch({ url: '/pages/auth/login/login' });
    }
  },

  onShow() {
    if (this.globalData.token) {
      this.updateCartCount();
    }
  },

  // 更新购物车角标数量
  updateCartCount() {
    const api = require('./utils/api');
    api.getCartCount().then(res => {
      const count = (res && res.data != null) ? res.data : 0;
      this.globalData.cartCount = count;
      if (this.globalData.tabBarCtx) {
        this.globalData.tabBarCtx.setData({ cartCount: count });
      }
    }).catch(() => {});
  },

  // 全局登出
  logout() {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    this.globalData.token = '';
    this.globalData.userInfo = null;
    this.globalData.cartCount = 0;
    wx.reLaunch({ url: '/pages/auth/login/login' });
  },

  globalData: {
    token: '',
    userInfo: null,
    cartCount: 0,
    tabBarCtx: null
  }
});
