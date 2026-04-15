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

    // 初始化登录状态
    this.initLoginState();
  },

  onShow() {
    // 每次显示时检查登录状态并更新购物车
    if (this.globalData.token) {
      this.updateCartCount();
    }
  },

  // 初始化登录状态
  initLoginState() {
    const token = wx.getStorageSync('token') || '';
    const userInfo = wx.getStorageSync('userInfo') || null;

    this.globalData.token = token;
    this.globalData.userInfo = userInfo;

    console.log('[App] 初始化登录状态, token存在:', !!token);

    // 如果有token，验证token是否有效
    if (token) {
      this.validateToken();
    }
  },

  // 验证token有效性
  validateToken() {
    const api = require('./utils/api');
    api.getUserInfo().then(res => {
      console.log('[App] Token验证成功');
      if (res.data) {
        this.globalData.userInfo = res.data;
        wx.setStorageSync('userInfo', res.data);
      }
      this.updateCartCount();
    }).catch(err => {
      console.error('[App] Token验证失败:', err);
      // Token无效，清除登录状态
      this.clearLoginState();
    });
  },

  // 检查是否已登录（供页面调用）
  checkLogin(showTip = true, autoRedirect = true) {
    const token = this.globalData.token || wx.getStorageSync('token');
    if (!token) {
      if (showTip) {
        wx.showToast({ 
          title: '请先登录', 
          icon: 'none',
          complete: () => {
            if (autoRedirect) {
              setTimeout(() => {
                wx.navigateTo({ url: '/pages/auth/login/login' });
              }, 1500);
            }
          }
        });
      } else if (autoRedirect) {
        wx.navigateTo({ url: '/pages/auth/login/login' });
      }
      return false;
    }
    return true;
  },

  // 更新购物车角标数量
  updateCartCount() {
    if (!this.globalData.token) return;

    const api = require('./utils/api');
    api.getCartCount().then(res => {
      const count = (res && res.data != null) ? res.data : 0;
      this.globalData.cartCount = count;
      if (this.globalData.tabBarCtx) {
        this.globalData.tabBarCtx.setData({ cartCount: count });
      }
      // 更新tabBar徽章
      if (count > 0) {
        wx.setTabBarBadge({
          index: 3,
          text: String(count)
        }).catch(() => {});
      } else {
        wx.removeTabBarBadge({ index: 3 }).catch(() => {});
      }
    }).catch(() => {});
  },

  // 设置登录状态
  setLoginState(token, userInfo) {
    wx.setStorageSync('token', token);
    wx.setStorageSync('userInfo', userInfo);
    this.globalData.token = token;
    this.globalData.userInfo = userInfo;
    console.log('[App] 登录状态已设置');
  },

  // 清除登录状态
  clearLoginState() {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    this.globalData.token = '';
    this.globalData.userInfo = null;
    this.globalData.cartCount = 0;
    console.log('[App] 登录状态已清除');
  },

  // 全局登出
  logout() {
    this.clearLoginState();
    wx.reLaunch({ url: '/pages/auth/login/login' });
  },

  globalData: {
    token: '',
    userInfo: null,
    cartCount: 0,
    tabBarCtx: null,
    selectedAddress: null
  }
});
