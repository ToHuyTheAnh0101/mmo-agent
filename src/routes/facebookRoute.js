const express = require('express');
const facebookController = require('../controllers/facebookController');

const router = express.Router();

router.get('/page/:id', facebookController.getPageInfo);
router.get('/page/:id/insights', facebookController.getPageInsights);
router.get('/page/:id/feed', facebookController.getPageFeed);
router.post('/login', facebookController.autoLogin);

module.exports = router;
