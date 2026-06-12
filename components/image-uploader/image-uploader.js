// components/image-uploader/image-uploader.js
const api = require('../../utils/api');

Component({
  properties: {
    // 图片列表
    images: {
      type: Array,
      value: []
    },
    // 最大上传数量
    maxCount: {
      type: Number,
      value: 9
    },
    // 上传模块标识
    module: {
      type: String,
      value: 'common'
    },
    // 关联业务ID
    business: {
      type: String,
      value: ''
    },
    // 是否只读（不显示上传和删除按钮）
    readonly: {
      type: Boolean,
      value: false
    },
    // 上传按钮文字
    uploadText: {
      type: String,
      value: '添加图片'
    },
    // 是否显示提示
    showTips: {
      type: Boolean,
      value: true
    },
    // 图片基础URL
    baseUrl: {
      type: String,
      value: 'http://localhost:8080'
    },
    // 每行图片数量
    columns: {
      type: Number,
      value: 3
    }
  },

  data: {
    uploading: false
  },

  methods: {
    // 选择图片
    chooseImage() {
      if (this.data.uploading) {
        wx.showToast({ title: '正在上传中...', icon: 'none' });
        return;
      }
      
      const remainCount = this.properties.maxCount - this.properties.images.length;
      wx.chooseImage({
        count: remainCount,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePaths = res.tempFilePaths;
          this.uploadImages(tempFilePaths);
        }
      });
    },

    // 上传图片
    async uploadImages(tempFilePaths) {
      if (tempFilePaths.length === 0) return;

      this.setData({ uploading: true });
      wx.showLoading({ title: '上传中...' });

      const uploadedImages = [];
      
      for (let i = 0; i < tempFilePaths.length; i++) {
        try {
          const result = await api.uploadImage(
            tempFilePaths[i],
            this.properties.module,
            this.properties.business
          );
          uploadedImages.push(result);
        } catch (err) {
          console.error('上传失败:', err);
        }
      }

      wx.hideLoading();
      this.setData({ uploading: false });

      if (uploadedImages.length > 0) {
        const allImages = [...this.properties.images, ...uploadedImages];
        this.triggerEvent('change', { images: allImages });
        wx.showToast({ title: `上传成功 ${uploadedImages.length} 张`, icon: 'success' });
      } else {
        wx.showToast({ title: '上传失败', icon: 'none' });
      }
    },

    // 删除图片
    deleteImage(e) {
      const index = e.currentTarget.dataset.index;
      const image = this.properties.images[index];
      
      wx.showModal({
        title: '确认删除',
        content: '确定要删除这张图片吗？',
        success: (res) => {
          if (res.confirm) {
            // 如果图片已上传到服务器，调用删除接口
            if (image.url) {
              api.deleteImage(image.url).catch(console.error);
            }
            
            const images = this.properties.images.filter((_, i) => i !== index);
            this.triggerEvent('change', { images });
          }
        }
      });
    },

    // 预览图片
    previewImage(e) {
      const url = e.currentTarget.dataset.url;
      const urls = this.properties.images.map(img => this.properties.baseUrl + img.url);
      wx.previewImage({
        current: url,
        urls: urls
      });
    }
  }
});
