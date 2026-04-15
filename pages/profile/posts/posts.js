// pages/profile/posts/posts.js
const api = require('../../../utils/api');
const util = require('../../../utils/util');

Page({
  data: { 
    posts: [],
    loading: true,
    noMore: false
  },
  
  onLoad() { 
    this.loadPosts(); 
  },
  
  onShow() { 
    this.loadPosts(); 
  },
  
  loadPosts() {
    this.setData({ loading: true });
    api.getMyPosts({ page: 1, size: 50 }).then(res => {
      const posts = (res.data?.records || []).map(p => ({ 
        ...p, 
        createTimeText: util.formatTime(p.createTime) 
      }));
      this.setData({ 
        posts,
        loading: false,
        noMore: posts.length >= (res.data?.total || 0)
      });
    }).catch(() => {
      this.setData({ loading: false });
    });
  },
  
  goToDetail(e) { 
    wx.navigateTo({ url: `/pages/community/detail/detail?id=${e.currentTarget.dataset.id}` }); 
  },
  
  goToPost() { 
    wx.navigateTo({ url: '/pages/community/post/post' }); 
  },
  
  editPost(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({ 
      url: `/pages/community/post/post?id=${item.id}&data=${encodeURIComponent(JSON.stringify(item))}` 
    });
  },
  
  deletePost(e) {
    wx.showModal({ 
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这个帖子吗？',
      confirmColor: '#FF8A65',
      success: res => {
        if (res.confirm) {
          api.deletePost(e.currentTarget.dataset.id).then(() => {
            wx.showToast({ title: '删除成功', icon: 'success' });
            this.loadPosts();
          }).catch(() => {
            wx.showToast({ title: '删除失败', icon: 'none' });
          });
        }
      }
    });
  },
  
  stopPropagation() {
    // 阻止事件冒泡
  },
  
  goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({ url: '/pages/profile/profile' });
    }
  }
});
