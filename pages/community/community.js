// pages/community/community.js
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    posts: [],
    loading: false,
    noMore: false,
    page: 1,
    size: 20
  },

  onLoad() { this.loadPosts(); },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(2);
    }
  },

  onPullDownRefresh() {
    this.setData({ page: 1, posts: [], noMore: false });
    this.loadPosts().then(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (!this.data.noMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.loadPosts();
    }
  },

  loadPosts() {
    if (this.data.loading) return Promise.resolve();
    this.setData({ loading: true });
    return api.getPostList({ page: this.data.page, size: this.data.size }).then(res => {
      const records = res.data?.records || [];
      const posts = records.map(p => ({
        ...p,
        firstPic: util.getFirstPic(p.picUrls),
        avatarLetter: (p.nickname || '匿')[0].toUpperCase()
      }));
      this.setData({
        posts: this.data.page === 1 ? posts : [...this.data.posts, ...posts],
        noMore: records.length < this.data.size,
        loading: false
      });
    }).catch(() => { this.setData({ loading: false }); });
  },

  goToDetail(e) { wx.navigateTo({ url: `/pages/community/detail/detail?id=${e.currentTarget.dataset.id}` }); },
  goToPost() { wx.navigateTo({ url: '/pages/community/post/post' }); }
});
