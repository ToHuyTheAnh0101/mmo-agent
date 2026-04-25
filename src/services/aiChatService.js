const { doStreamRequest } = require('../utils/httpClient');

function normalizeSseLine(line) {
  const trimmed = line.trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed.startsWith('data:')) {
    return trimmed.replace(/^data:\s*/, '').trim();
  }

  return trimmed;
}

function buildChatPayload(payload) {
  const model = payload?.model || process.env.AI_MODEL || 'gpt-5.3-codex';

  const messages =
    (payload && Array.isArray(payload.messages) && payload.messages.length > 0 && payload.messages) ||
    [
      {
        role: 'user',
        content: payload?.message || 'Xin chao',
      },
    ];

  return {
    model,
    messages,
    max_tokens: payload?.max_tokens ? payload.max_tokens : 256,
    temperature: payload?.temperature !== undefined ? payload.temperature : 0,
    stream: true,
  };
}

function chatWithMergedStream(payload) {
  return new Promise((resolve, reject) => {
    const baseUrl = process.env.AI_BASE_URL ? String(process.env.AI_BASE_URL).replace(/\/+$/, '') : '';
    const apiKey = process.env.AI_API_KEY || '';

    if (!baseUrl) {
      reject(new Error('Missing AI_BASE_URL in env'));
      return;
    }

    if (!String(apiKey).trim()) {
      reject(new Error('Missing AI_API_KEY in env'));
      return;
    }

    const targetUrl = `${baseUrl}/chat/completions`;
    const data = buildChatPayload(payload || {});

    let rawBuffer = '';
    let text = '';
    let chunkCount = 0;
    let usage = null;

    const config = {
      method: 'POST',
      url: targetUrl,
      data,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    };

    const onData = (chunk) => {
      rawBuffer += chunk.toString('utf8');
      const lines = rawBuffer.split(/\r?\n/);
      rawBuffer = lines.pop() || '';

      for (const line of lines) {
        const sseData = normalizeSseLine(line);
        if (!sseData || sseData === '[DONE]') {
          continue;
        }

        try {
          const json = JSON.parse(sseData);
          chunkCount += 1;

          const deltaContent = json?.choices?.[0]?.delta?.content;

          if (typeof deltaContent === 'string' && deltaContent.length > 0) {
            text += deltaContent;
          }

          if (json && json.usage) {
            usage = json.usage;
          }
        } catch (err) {
          // Ignore non-JSON stream lines.
        }
      }
    };

    const onEnd = (resInfo) => {
      if (rawBuffer.trim()) {
        const last = normalizeSseLine(rawBuffer);
        if (last && last !== '[DONE]') {
          try {
            const json = JSON.parse(last);
            chunkCount += 1;
            const deltaContent = json?.choices?.[0]?.delta?.content;
            if (typeof deltaContent === 'string' && deltaContent.length > 0) {
              text += deltaContent;
            }
            if (json && json.usage) {
              usage = json.usage;
            }
          } catch (err) {
            // Ignore last non-JSON line.
          }
        }
      }

      resolve({
        ok: resInfo.statusCode >= 200 && resInfo.statusCode < 300,
        statusCode: resInfo.statusCode,
        content: text,
        hasContent: text.trim().length > 0,
        chunkCount,
        usage,
      });
    };

    const onError = (err) => {
      reject(err);
    };

    doStreamRequest(config, onData, onEnd, onError);
  });
}

module.exports = {
  chatWithMergedStream,
};
