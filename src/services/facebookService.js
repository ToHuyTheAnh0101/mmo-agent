const { doRequest } = require('../utils/httpClient');

const DEFAULT_GRAPH_VERSION = 'v21.0';
const DEFAULT_GRAPH_URL = `https://graph.facebook.com/${DEFAULT_GRAPH_VERSION}`;

/**
 * Hàm hỗ trợ xử lý gọi API Facebook
 */
async function fetchFbApi(url, method = 'GET', data = null) {
  return doRequest({
    method,
    url,
    data, // axios dùng `data` thay vì `body`
  });
}

/**
 * 1. Đổi authorization code lấy User Access Token ngắn hạn
 */
async function exchangeCodeForToken(clientId, clientSecret, redirectUri, code) {
  const url = `${DEFAULT_GRAPH_URL}/oauth/access_token?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${encodeURIComponent(clientSecret)}&code=${encodeURIComponent(code)}`;
  return fetchFbApi(url);
}

/**
 * 2. Đổi User Access Token ngắn hạn lấy token dài hạn (Long-lived Token)
 */
async function getLongLivedToken(clientId, clientSecret, shortLivedToken) {
  const url = `${DEFAULT_GRAPH_URL}/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&fb_exchange_token=${encodeURIComponent(shortLivedToken)}`;
  return fetchFbApi(url);
}

/**
 * 3. Lấy danh sách các trang (Pages) mà user quản lý cùng Page Access Token
 */
async function getPageTokens(userAccessToken) {
  const url = `${DEFAULT_GRAPH_URL}/me/accounts?access_token=${encodeURIComponent(userAccessToken)}`;
  return fetchFbApi(url);
}

/**
 * 4. Lấy thông tin cơ bản của một Page (ví dụ: Tên, Số lượng follower)
 */
async function getPageInfo(pageId, pageAccessToken, fields = 'id,name,fan_count,followers_count') {
  const url = `${DEFAULT_GRAPH_URL}/${encodeURIComponent(pageId)}?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(pageAccessToken)}`;
  return fetchFbApi(url);
}

/**
 * 5. Lấy Insight của Page (Reach, Engagement, etc.)
 */
async function getPageInsights(pageId, pageAccessToken, metrics = 'page_impressions,page_post_engagements', period = 'day') {
  const url = `${DEFAULT_GRAPH_URL}/${encodeURIComponent(pageId)}/insights?metric=${encodeURIComponent(metrics)}&period=${encodeURIComponent(period)}&access_token=${encodeURIComponent(pageAccessToken)}`;
  return fetchFbApi(url);
}

/**
 * 6. Lấy bài viết gần nhất trên trang (Feed/Posts) và tương tác
 */
async function getPageFeed(pageId, pageAccessToken, fields = 'id,message,created_time,likes.summary(true),comments.summary(true)', limit = 10) {
  const url = `${DEFAULT_GRAPH_URL}/${encodeURIComponent(pageId)}/feed?fields=${encodeURIComponent(fields)}&limit=${limit}&access_token=${encodeURIComponent(pageAccessToken)}`;
  return fetchFbApi(url);
}

module.exports = {
  exchangeCodeForToken,
  getLongLivedToken,
  getPageTokens,
  getPageInfo,
  getPageInsights,
  getPageFeed,
};
