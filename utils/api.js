// utils/api.js - 所有接口汇总
const { get, post, put, del } = require('./request');
const { UPLOAD_URL } = require('./config');

// ===== 用户模块 =====
const login = (data) => post('/user/login', data);
const register = (data) => post('/user/register', data);
const getUserInfo = () => get('/user/profile');
const updateUserInfo = (data) => put('/user/profile', data);
const updatePassword = (data) => put('/user/password', data);

// ===== 首页 =====
const getIndexData = () => get('/home/index');

// ===== 商品分类 =====
const getCategoryList = (type) => get('/category/list', type ? { type } : {});

// ===== 商品模块 =====
const getProductPage = (params) => get('/product/list', params);
const getProductDetail = (id) => get(`/product/${id}`);

// ===== 商家模块 =====
const getMerchantDetail = (id) => get(`/user/shop/${id}`);

// ===== 购物车 =====
const getCartList = () => get('/cart/list');
const getCartCount = () => get('/cart/count');
const addToCart = (data) => post('/cart/add', data);
const updateCartItem = (data) => put('/cart/update', data);
const deleteCartItem = (id) => del(`/cart/${id}`);

// ===== 订单 =====
const createOrder = (data) => post('/user/order/create', data);
const payOrder = (orderId) => post(`/user/order/pay/${orderId}`);
const getOrderPage = (params) => get('/user/order/list', params);
const getOrderDetail = (id) => get(`/user/order/${id}`);
const cancelOrder = (id) => put(`/user/order/cancel/${id}`);
const confirmReceipt = (id) => put(`/user/order/confirm/${id}`);
const applyRefund = (data) => post('/user/order/refund', data);

// ===== 社区帖子 =====
const getPostPage = (params) => get('/community/post/list', params);
const getPostDetail = (id) => get(`/community/post/${id}`);
const addPost = (data) => post('/community/post/add', data);
const updatePost = (id, data) => put(`/community/post/update/${id}`, data);
const deletePost = (id) => del(`/community/post/delete/${id}`);
const getMyPosts = (params) => get('/community/post/my', params);
const likePost = (postId) => post(`/community/post/${postId}/like`);
const unlikePost = (postId) => del(`/community/post/${postId}/like`);

// ===== 评论 =====
const addComment = (data) => post('/community/comment/add', data);
const getCommentPage = (params) => get('/community/comment/list', params);
const likeComment = (commentId) => post(`/community/comment/${commentId}/like`);

// ===== 收货地址 =====
const getAddressList = () => get('/user/address/list');
const saveAddress = (data) => post('/user/address/add', data);
const updateAddress = (id, data) => put(`/user/address/update/${id}`, data);
const deleteAddress = (id) => del(`/user/address/delete/${id}`);
const setDefaultAddress = (id) => put(`/user/address/default/${id}`);

// ===== 我的收藏 =====
const getFavoriteList = (params) => get('/favorite/list', params);
const addFavorite = (data) => post('/favorite/add', data);
const deleteFavorite = (targetId) => del(`/favorite/${targetId}`);

// ===== 图片上传 =====
const uploadImage = (filePath, module, business) => {
  console.log('上传图片:', { filePath, module, business, url: UPLOAD_URL });
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token') || '';
    const uploadTask = wx.uploadFile({
      url: UPLOAD_URL,
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      formData: {
        module: module || 'common',
        business: business || ''
      },
      success: (res) => {
        console.log('上传响应:', res);
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data);
            if (data.code === 200) {
              resolve(data.data);
            } else {
              console.error('上传失败:', data);
              wx.showToast({ title: data.message || '上传失败', icon: 'none' });
              reject(data);
            }
          } catch (e) {
            console.error('解析响应失败:', e, res.data);
            wx.showToast({ title: '服务器响应格式错误', icon: 'none' });
            reject(e);
          }
        } else {
          console.error('HTTP错误:', res.statusCode, res);
          wx.showToast({ title: `上传失败: ${res.statusCode}`, icon: 'none' });
          reject(res);
        }
      },
      fail: (err) => {
        console.error('上传请求失败:', err);
        wx.showToast({ title: '网络错误，请检查连接', icon: 'none' });
        reject(err);
      }
    });
    uploadTask.onProgressUpdate((res) => {
      console.log('上传进度:', res.progress);
    });
  });
};

const getImageList = (module, business) => get('/image/list', { module, business });
const deleteImage = (url) => del('/image/delete', { url });

module.exports = {
  // 用户
  login, register, getUserInfo, updateUserInfo, updatePassword,
  // 首页
  getIndexData,
  // 分类
  getCategoryList,
  // 商品
  getProductPage, getProductDetail,
  // 商家
  getMerchantDetail,
  // 购物车
  getCartList, getCartCount, addToCart, updateCartItem, deleteCartItem,
  // 订单
  createOrder, payOrder, getOrderPage, getOrderDetail, cancelOrder, confirmReceipt, applyRefund,
  // 社区
  getPostPage, getPostDetail, addPost, updatePost, deletePost, getMyPosts,
  likePost, unlikePost,
  addComment, getCommentPage, likeComment,
  // 地址
  getAddressList, saveAddress, updateAddress, deleteAddress, setDefaultAddress,
  // 收藏
  getFavoriteList, addFavorite, deleteFavorite,
  // 图片
  uploadImage, getImageList, deleteImage
};
