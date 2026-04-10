// utils/api.js - 所有接口汇总
const { get, post, put, del } = require('./request');

// ===== 用户模块 =====
const login = (data) => post('/user/login', data);
const register = (data) => post('/user/register', data);
const getUserInfo = () => get('/user/info');
const updateUserInfo = (data) => put('/user/update', data);
const updatePassword = (data) => put('/user/password', data);

// ===== 首页 =====
const getIndexData = () => get('/home/index');

// ===== 商品分类 =====
const getCategoryList = (type) => get('/category/list', type ? { type } : {});

// ===== 商品模块 =====
const getProductPage = (params) => get('/product/list', params);
const getProductDetail = (id) => get(`/product/${id}`);

// ===== 购物车 =====
const getCartList = () => get('/cart/list');
const getCartCount = () => get('/cart/count');
const addToCart = (data) => post('/cart/add', data);
const updateCartItem = (data) => put('/cart/update', data);
const deleteCartItem = (id) => del(`/cart/${id}`);

// ===== 订单 =====
const createOrder = (data) => post('/order/create', data);
const getOrderPage = (params) => get('/order/list', params);
const getOrderDetail = (id) => get(`/order/${id}`);
const cancelOrder = (id) => post(`/order/${id}/cancel`);
const confirmReceipt = (id) => post(`/order/${id}/receipt`);

// ===== 社区帖子 =====
const getPostPage = (params) => get('/post/list', params);
const getPostDetail = (id) => get(`/post/${id}`);
const addPost = (data) => post('/post/add', data);
const deletePost = (id) => del(`/post/${id}`);
const getMyPosts = (params) => get('/post/my', params);

// ===== 评论 =====
const addComment = (data) => post('/comment/add', data);
const getCommentPage = (params) => get('/comment/list', params);

// ===== 收货地址 =====
const getAddressList = () => get('/address/list');
const saveAddress = (data) => post('/address/save', data);
const deleteAddress = (id) => del(`/address/${id}`);
const setDefaultAddress = (id) => put(`/address/${id}/default`);

// ===== 我的收藏 =====
const getFavoriteList = (params) => get('/favorite/list', params);
const addFavorite = (data) => post('/favorite/add', data);
const deleteFavorite = (targetId) => del(`/favorite/${targetId}`);

module.exports = {
  // 用户
  login, register, getUserInfo, updateUserInfo, updatePassword,
  // 首页
  getIndexData,
  // 分类
  getCategoryList,
  // 商品
  getProductPage, getProductDetail,
  // 购物车
  getCartList, getCartCount, addToCart, updateCartItem, deleteCartItem,
  // 订单
  createOrder, getOrderPage, getOrderDetail, cancelOrder, confirmReceipt,
  // 社区
  getPostPage, getPostDetail, addPost, deletePost, getMyPosts,
  addComment, getCommentPage,
  // 地址
  getAddressList, saveAddress, deleteAddress, setDefaultAddress,
  // 收藏
  getFavoriteList, addFavorite, deleteFavorite
};
