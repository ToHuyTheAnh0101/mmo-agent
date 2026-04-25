const { chatWithMergedStream } = require('../services/aiChatService');

async function handleChat(req, res) {
  try {
    const result = await chatWithMergedStream(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  handleChat,
};
