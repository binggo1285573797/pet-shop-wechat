// pages/community/community.js - Stitch 风格社区页面
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    posts: [],
    page: 1,
    size: 10,
    loading: false,
    noMore: false
  },

  onLoad() {
    this.loadPosts(true);
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setSelected(2);
    }
    // 检查是否需要刷新
    const app = getApp();
    if (app.globalData.refreshCommunity) {
      this.loadPosts(true);
      app.globalData.refreshCommunity = false;
    }
  },

  onPullDownRefresh() {
    this.loadPosts(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (!this.data.noMore && !this.data.loading) {
      this.loadPosts(false);
    }
  },

  loadPosts(reset = false) {
    if (this.data.loading) return Promise.resolve();

    const page = reset ? 1 : this.data.page + 1;
    this.setData({
      loading: true,
      ...(reset ? { posts: [], noMore: false } : {})
    });

    // 渐变色类名列表 - 温暖柔和的宠物主题色系
    const bgClasses = ['bg-gradient-1', 'bg-gradient-2', 'bg-gradient-3', 
                       'bg-gradient-4', 'bg-gradient-5', 'bg-gradient-6'];

    return api.getPostPage({ page, size: this.data.size }).then(res => {
      const records = (res.data?.records || []).map((post, index) => ({
        ...post,
        picList: util.getPicList(post.picUrls),
        authorName: post.authorName || '匿名用户',
        likeCount: post.likeCount || 0,
        isLiked: post.isLiked || false,
        // 为无图片帖子分配随机背景色
        bgClass: (!post.picUrls || post.picUrls === '') ? bgClasses[index % bgClasses.length] : ''
      }));

      const posts = reset ? records : [...this.data.posts, ...records];

      this.setData({
        posts,
        page,
        loading: false,
        noMore: records.length < this.data.size
      });
    }).catch(err => {
      console.error('加载帖子失败:', err);
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  goToDetail(e) {
    const postId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/community/detail/detail?id=${postId}`
    });
  },

  goToPost() {
    const app = getApp();
    if (!app.checkLogin()) {
      return;
    }
    wx.navigateTo({
      url: '/pages/community/post/post'
    });
  }
});
