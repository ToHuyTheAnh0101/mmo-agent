const fbService = require('../services/facebookService');

async function getPageInfo(req, res) {
  try {
    const pageId = req.params.id;
    // Lấy token từ header hoặc query params, nếu không có fallback về ENV (cho mục đích test/agent cá nhân)
    const token = req.headers['x-fb-page-token'] || req.query.token || process.env.FB_PAGE_ACCESS_TOKEN;
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'Missing FB Page Access Token' });
    }

    const data = await fbService.getPageInfo(pageId, token);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getPageInsights(req, res) {
  try {
    const pageId = req.params.id;
    const token = req.headers['x-fb-page-token'] || req.query.token || process.env.FB_PAGE_ACCESS_TOKEN;
    const metrics = req.query.metrics || 'page_impressions,page_post_engagements';
    const period = req.query.period || 'day';

    if (!token) {
      return res.status(401).json({ success: false, error: 'Missing FB Page Access Token' });
    }

    const data = await fbService.getPageInsights(pageId, token, metrics, period);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getPageFeed(req, res) {
  try {
    const pageId = req.params.id;
    const token = req.headers['x-fb-page-token'] || req.query.token || process.env.FB_PAGE_ACCESS_TOKEN;
    const limit = req.query.limit || 10;

    if (!token) {
      return res.status(401).json({ success: false, error: 'Missing FB Page Access Token' });
    }

    const data = await fbService.getPageFeed(pageId, token, undefined, limit);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getPageInfo,
  getPageInsights,
  getPageFeed,
};
