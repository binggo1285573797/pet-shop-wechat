// custom-tab-bar/index.js
Component({
  data: {
    selected: 0,
    cartCount: 0,
    tabs: [
      { text: '首页', icon: 'home', url: '/pages/index/index' },
      { text: '商城', icon: 'shopping_bag', url: '/pages/shop/shop' },
      { text: '社区', icon: 'forum', url: '/pages/community/community' },
      { text: '购物车', icon: 'shopping_cart', url: '/pages/cart/cart' },
      { text: '我的', icon: 'person', url: '/pages/profile/profile' }
    ]
  },
  methods: {
    setSelected(index) {
      this.setData({ selected: index });
    },
    switchTab(e) {
      const index = e.currentTarget.dataset.index;
      const url = this.data.tabs[index].url;
      wx.switchTab({ url });
      this.setData({ selected: index });
    }
  }
});
