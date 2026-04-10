// pages/community/detail/detail.js
const api = require('../../../utils/api');
const util = require('../../../utils/util');

Page({
  data: { post: null, picList: [], comments: [], commentText: '', loading: false },

  onLoad(options) {
    this.postId = options.id;
    this.loadDetail();
    this.loadComments();
  },

  loadDetail() {
    api.getPostDetail(this.postId).then(res => {
      const p = res.data;
      this.setData({
        post: { ...p, createTimeText: util.formatTime(p.createTime) },
        picList: util.getPicList(p.picUrls)
      });
    });
  },

  loadComments() {
    api.getCommentPage({ postId: this.postId, page: 1, size: 50 }).then(res => {
      const comments = (res.data?.records || []).map(c => ({
        ...c, createTimeText: util.formatTime(c.createTime)
      }));
      this.setData({ comments });
    });
  },

  onCommentInput(e) { this.setData({ commentText: e.detail.value }); },

  submitComment() {
    const content = this.data.commentText.trim();
    if (!content) { wx.showToast({ title: '评论不能为空', icon: 'none' }); return; }
    api.addComment({ postId: this.postId, content }).then(() => {
      wx.showToast({ title: '评论成功', icon: 'success' });
      this.setData({ commentText: '' });
      this.loadComments();
    });
  },

  previewImage(e) {
    wx.previewImage({ urls: this.data.picList, current: e.currentTarget.dataset.src });
  }
});
