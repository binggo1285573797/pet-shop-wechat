// pages/community/detail/detail.js - Stitch 风格帖子详情页面
const api = require('../../../utils/api');
const util = require('../../../utils/util');

Page({
  data: {
    post: null,
    picList: [],
    comments: [],
    commentText: '',
    loading: false,
    showCommentInput: false,
    isMyPost: false
  },

  onLoad(options) {
    this.postId = options.id;
    this.loadDetail();
    this.loadComments();
  },

  loadDetail() {
    wx.showLoading({ title: '加载中...' });
    api.getPostDetail(this.postId).then(res => {
      wx.hideLoading();
      const p = res.data;
      
      // 检查是否是自己的帖子
      const app = getApp();
      const userInfo = app.globalData.userInfo;
      const isMyPost = userInfo && userInfo.id === p.authorId;
      
      this.setData({
        post: {
          ...p,
          likeCount: p.likeCount || 0,
          collectCount: p.collectCount || 0,
          createTimeText: util.formatTime(p.createTime),
          tags: p.tags ? p.tags.split(',').filter(t => t) : []
        },
        picList: util.getPicList(p.picUrls),
        isMyPost: isMyPost
      });
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  loadComments() {
    api.getCommentPage({ postId: this.postId, page: 1, size: 50 }).then(res => {
      const comments = (res.data?.records || []).map(c => ({
        ...c,
        createTimeText: util.formatTime(c.createTime),
        likeCount: c.likeCount || 0,
        isLiked: c.isLiked || false
      }));
      this.setData({ comments });
    });
  },

  onCommentInput(e) {
    this.setData({ commentText: e.detail.value });
  },

  submitComment() {
    const content = this.data.commentText.trim();
    if (!content) {
      wx.showToast({ title: '评论不能为空', icon: 'none' });
      return;
    }

    const app = getApp();
    if (!app.checkLogin()) return;

    api.addComment({ postId: parseInt(this.postId), content }).then(() => {
      wx.showToast({ title: '评论成功', icon: 'success' });
      this.setData({ 
        commentText: '',
        showCommentInput: false
      });
      this.loadComments();
      // 更新评论数
      const post = this.data.post;
      this.setData({
        post: { ...post, commentCount: (post.commentCount || 0) + 1 }
      });
    }).catch(err => {
      wx.showToast({ title: '评论失败', icon: 'none' });
    });
  },

  likePost() {
    const app = getApp();
    if (!app.checkLogin()) return;

    const post = this.data.post;
    const isLiked = post.isLiked;

    // 本地更新
    this.setData({
      post: {
        ...post,
        isLiked: !isLiked,
        likeCount: (post.likeCount || 0) + (isLiked ? -1 : 1)
      }
    });

    // 调用API
    if (isLiked) {
      api.unlikePost(this.postId).catch(() => {
        // 失败回滚
        this.setData({ post });
      });
    } else {
      api.likePost(this.postId).catch(() => {
        this.setData({ post });
      });
    }
  },

  likeComment(e) {
    const app = getApp();
    if (!app.checkLogin()) return;

    const commentId = e.currentTarget.dataset.id;
    const comments = this.data.comments.map(c => {
      if (c.id === commentId) {
        const isLiked = c.isLiked;
        return {
          ...c,
          isLiked: !isLiked,
          likeCount: (c.likeCount || 0) + (isLiked ? -1 : 1)
        };
      }
      return c;
    });
    this.setData({ comments });

    const comment = this.data.comments.find(c => c.id === commentId);
    if (comment.isLiked) {
      api.likeComment(commentId).catch(() => this.loadComments());
    }
  },

  collectPost() {
    const app = getApp();
    if (!app.checkLogin()) return;

    const post = this.data.post;
    const isCollected = post.isCollected;

    // 本地更新
    this.setData({
      post: {
        ...post,
        isCollected: !isCollected,
        collectCount: (post.collectCount || 0) + (isCollected ? -1 : 1)
      }
    });

    // 调用API
    if (isCollected) {
      api.deleteFavorite(this.postId).catch(() => {
        // 失败回滚
        this.setData({ post });
      });
    } else {
      api.addFavorite({ targetType: 1, targetId: parseInt(this.postId) }).catch(() => {
        this.setData({ post });
      });
    }

    wx.showToast({
      title: isCollected ? '取消收藏' : '收藏成功',
      icon: 'none'
    });
  },

  followAuthor() {
    const app = getApp();
    if (!app.checkLogin()) return;

    wx.showToast({ title: '关注成功', icon: 'success' });
  },

  focusComment() {
    const app = getApp();
    if (!app.checkLogin()) return;
    
    // 显示评论输入弹窗
    this.setData({ showCommentInput: true });
  },

  hideCommentInput() {
    this.setData({ showCommentInput: false });
  },

  previewImage(e) {
    wx.previewImage({
      urls: this.data.picList,
      current: e.currentTarget.dataset.src
    });
  },

  sharePost() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  moreOptions() {
    wx.showActionSheet({
      itemList: ['举报', '不感兴趣', '复制链接'],
      success: (res) => {
        console.log(res.tapIndex);
      }
    });
  },

  // 显示帖子操作菜单（编辑/删除）
  showPostActions() {
    wx.showActionSheet({
      itemList: ['编辑', '删除'],
      itemColor: '#333',
      success: (res) => {
        if (res.tapIndex === 0) {
          // 编辑
          this.editPost();
        } else if (res.tapIndex === 1) {
          // 删除
          this.deletePost();
        }
      }
    });
  },

  // 编辑帖子
  editPost() {
    const post = this.data.post;
    // 将帖子数据和图片列表一起存储到全局
    getApp().globalData.editPostData = {
      ...post,
      picList: this.data.picList
    };
    wx.navigateTo({
      url: `/pages/community/post/post?id=${post.id}&edit=1`
    });
  },

  // 删除帖子
  deletePost() {
    wx.showModal({ 
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这个帖子吗？',
      confirmColor: '#FF5252',
      success: res => {
        if (res.confirm) {
          api.deletePost(this.postId).then(() => {
            wx.showToast({ title: '删除成功', icon: 'success' });
            // 返回上一页
            setTimeout(() => {
              wx.navigateBack();
            }, 1000);
          }).catch(() => {
            wx.showToast({ title: '删除失败', icon: 'none' });
          });
        }
      }
    });
  },

  onShareAppMessage() {
    return {
      title: this.data.post?.content?.substring(0, 50) || '爱宠家社区',
      path: `/pages/community/detail/detail?id=${this.postId}`
    };
  },

  onShareTimeline() {
    return {
      title: this.data.post?.content?.substring(0, 50) || '爱宠家社区',
      query: `id=${this.postId}`
    };
  },

  goBack() {
    wx.navigateBack();
  }
});
