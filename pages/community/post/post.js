// pages/community/post/post.js - Stitch 风格发布帖子页面
const api = require('../../../utils/api');
const util = require('../../../utils/util');

Page({
  data: {
    title: '',
    content: '',
    images: [],
    canPost: false,
    isEdit: false,
    postId: null
  },

  onLoad(options) {
    // 检查登录状态
    const app = getApp();
    if (!app.checkLogin()) {
      return;
    }

    // 判断是否为编辑模式
    if (options.edit === '1' && options.id) {
      this.setData({ isEdit: true, postId: parseInt(options.id) });
      this.loadPostData();
    }
  },

  // 加载编辑数据
  loadPostData() {
    const app = getApp();
    const postData = app.globalData.editPostData;
    if (postData) {
      const images = postData.picList || [];
      this.setData({
        title: postData.title || '',
        content: postData.content || '',
        images: images
      });
      this.checkCanPost();
      // 清除全局数据
      app.globalData.editPostData = null;
    }
  },

  onTitleInput(e) {
    this.setData({ title: e.detail.value });
    this.checkCanPost();
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
    this.checkCanPost();
  },

  checkCanPost() {
    // 标题必填，且需要有内容或图片
    const hasTitle = this.data.title.trim().length > 0;
    const hasContent = this.data.content.trim().length > 0 || this.data.images.length > 0;
    const canPost = hasTitle && hasContent;
    this.setData({ canPost });
  },

  chooseImage() {
    const remainCount = 9 - this.data.images.length;
    wx.chooseMedia({
      count: remainCount,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(file => file.tempFilePath);
        this.setData({
          images: [...this.data.images, ...newImages]
        });
        this.checkCanPost();
      }
    });
  },

  removeImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images.filter((_, i) => i !== index);
    this.setData({ images });
    this.checkCanPost();
  },

  submitPost() {
    if (!this.data.canPost) {
      if (!this.data.title.trim()) {
        wx.showToast({ title: '请填写标题', icon: 'none' });
      } else {
        wx.showToast({ title: '请填写内容或上传图片', icon: 'none' });
      }
      return;
    }

    wx.showLoading({ title: this.data.isEdit ? '保存中...' : '发布中...', mask: true });

    // 如果有图片，先上传图片
    if (this.data.images.length > 0) {
      this.uploadImages().then(picUrls => {
        this.data.isEdit ? this.updatePost(picUrls) : this.createPost(picUrls);
      }).catch(() => {
        wx.hideLoading();
        wx.showToast({ title: '图片上传失败', icon: 'none' });
      });
    } else {
      this.data.isEdit ? this.updatePost([]) : this.createPost([]);
    }
  },

  uploadImages() {
    const promises = this.data.images.map(path => api.uploadImage(path, 'post'));
    return Promise.all(promises).then(results => {
      return results.map(r => r.url);
    });
  },

  createPost(picUrls) {
    const data = {
      title: this.data.title,
      content: this.data.content,
      picUrls: picUrls || []
    };

    api.addPost(data).then(() => {
      wx.hideLoading();
      wx.showToast({ title: '发布成功', icon: 'success' });

      // 通知社区页面刷新
      const app = getApp();
      app.globalData.refreshCommunity = true;

      setTimeout(() => {
        wx.navigateBack();
      }, 800);
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: err.message || '发布失败', icon: 'none' });
    });
  },

  // 更新帖子
  updatePost(picUrls) {
    const data = {
      title: this.data.title,
      content: this.data.content,
      picUrls: picUrls || []
    };

    api.updatePost(this.data.postId, data).then(() => {
      wx.hideLoading();
      wx.showToast({ title: '保存成功', icon: 'success' });

      // 通知刷新
      const app = getApp();
      app.globalData.refreshCommunity = true;
      app.globalData.refreshMyPosts = true;

      setTimeout(() => {
        wx.navigateBack();
      }, 800);
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: err.message || '保存失败', icon: 'none' });
    });
  },

  // 删除帖子
  deletePost() {
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，是否确认删除？',
      confirmColor: '#F44336',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...', mask: true });
          api.deletePost(this.data.postId).then(() => {
            wx.hideLoading();
            wx.showToast({ title: '删除成功', icon: 'success' });
            const app = getApp();
            app.globalData.refreshCommunity = true;
            app.globalData.refreshMyPosts = true;
            setTimeout(() => {
              wx.navigateBack();
            }, 800);
          }).catch(err => {
            wx.hideLoading();
            wx.showToast({ title: err.message || '删除失败', icon: 'none' });
          });
        }
      }
    });
  },

  goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      // 有上一页，正常返回
      if (this.data.title || this.data.content || this.data.images.length > 0) {
        wx.showModal({
          title: '确认退出？',
          content: '退出后内容将不会保存',
          confirmColor: '#FF8A65',
          success: (res) => {
            if (res.confirm) {
              wx.navigateBack();
            }
          }
        });
      } else {
        wx.navigateBack();
      }
    } else {
      // 没有上一页，跳转到社区首页
      if (this.data.title || this.data.content || this.data.images.length > 0) {
        wx.showModal({
          title: '确认退出？',
          content: '退出后内容将不会保存',
          confirmColor: '#FF8A65',
          success: (res) => {
            if (res.confirm) {
              wx.switchTab({ url: '/pages/community/community' });
            }
          }
        });
      } else {
        wx.switchTab({ url: '/pages/community/community' });
      }
    }
  }
});
