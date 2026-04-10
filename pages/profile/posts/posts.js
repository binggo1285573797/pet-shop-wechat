// pages/profile/posts/posts.js
const api = require('../../../utils/api');
const util = require('../../../utils/util');
Page({
  data: { posts: [] },
  onLoad() { this.loadPosts(); },
  onShow() { this.loadPosts(); },
  loadPosts() {
    api.getMyPosts({ page: 1, size: 50 }).then(res => {
      const posts = (res.data?.records || []).map(p => ({ ...p, createTimeText: util.formatTime(p.createTime) }));
      this.setData({ posts });
    }).catch(() => {});
  },
  goToDetail(e) { wx.navigateTo({ url: `/pages/community/detail/detail?id=${e.currentTarget.dataset.id}` }); },
  goToPost() { wx.navigateTo({ url: '/pages/community/post/post' }); },
  deletePost(e) {
    wx.showModal({ title: '确认删除？', success: res => {
      if (res.confirm) api.deletePost(e.currentTarget.dataset.id).then(() => this.loadPosts());
    }});
  }
});
