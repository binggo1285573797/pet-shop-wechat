// pages/community/post/post.js
const api = require('../../../utils/api');

Page({
  data: { content: '', loading: false },

  onContentInput(e) { this.setData({ content: e.detail.value }); },

  submitPost() {
    const content = this.data.content.trim();
    if (!content) { wx.showToast({ title: '请输入帖子内容', icon: 'none' }); return; }
    if (content.length < 5) { wx.showToast({ title: '内容至少5个字', icon: 'none' }); return; }

    this.setData({ loading: true });
    api.addPost({ content, picUrls: '' }).then(() => {
      wx.showToast({ title: '发布成功', icon: 'success' });
      setTimeout(() => { wx.navigateBack(); }, 800);
    }).catch(() => { this.setData({ loading: false }); });
  }
});
