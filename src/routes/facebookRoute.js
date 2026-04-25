const express = require('express');
const facebookController = require('../controllers/facebookController');

const router = express.Router();

router.get('/page/:id', facebookController.getPageInfo);
router.get('/page/:id/insights', facebookController.getPageInsights);
router.get('/page/:id/feed', facebookController.getPageFeed);

module.exports = router;
