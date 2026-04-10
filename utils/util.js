// utils/util.js - 工具函数

/**
 * 格式化时间戳为可读字符串
 */
function formatTime(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  if (y === now.getFullYear()) return `${m}-${day} ${h}:${min}`;
  return `${y}-${m}-${day}`;
}

/**
 * 格式化价格，保留2位小数
 */
function formatPrice(price) {
  if (price == null) return '0.00';
  return Number(price).toFixed(2);
}

/**
 * 订单状态文字映射
 */
function formatOrderStatus(status) {
  const map = {
    0: '待付款',
    1: '待发货',
    2: '待收货',
    3: '已完成',
    4: '退款中',
    5: '已关闭'
  };
  return map[status] || '未知';
}

/**
 * 订单状态标签样式映射
 */
function getOrderStatusTag(status) {
  const map = {
    0: 'warning',
    1: 'primary',
    2: 'primary',
    3: 'success',
    4: 'danger',
    5: 'default'
  };
  return map[status] || 'default';
}

/**
 * 解析商品图片（取第一张）
 */
function getFirstPic(picUrls) {
  if (!picUrls) return '';
  if (Array.isArray(picUrls)) return picUrls[0] || '';
  try {
    const arr = JSON.parse(picUrls);
    return arr[0] || '';
  } catch (e) {
    return picUrls.split(',')[0] || '';
  }
}

/**
 * 解析商品图片列表
 */
function getPicList(picUrls) {
  if (!picUrls) return [];
  if (Array.isArray(picUrls)) return picUrls;
  try {
    return JSON.parse(picUrls);
  } catch (e) {
    return picUrls.split(',').filter(Boolean);
  }
}

/**
 * 防抖
 */
function debounce(fn, delay = 500) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

module.exports = {
  formatTime,
  formatPrice,
  formatOrderStatus,
  getOrderStatusTag,
  getFirstPic,
  getPicList,
  debounce
};
