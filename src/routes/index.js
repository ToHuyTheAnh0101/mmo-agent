const express = require('express');
const aiChatRoute = require('./aiChatRoute');
const facebookRoute = require('./facebookRoute');

const router = express.Router();

router.use('/ai', aiChatRoute);
router.use('/facebook', facebookRoute);

module.exports = router;
