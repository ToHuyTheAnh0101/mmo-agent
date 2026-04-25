const axios = require('axios');

// Instance mặc định dùng cho các JSON REST API (ví dụ: Facebook, nội bộ)
const apiClient = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hàm dùng chung để bắt lỗi đồng bộ từ Axios
async function doRequest(config) {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server trả về mã lỗi (4xx, 5xx)
      const errorMsg = error.response.data?.error?.message || error.response.data?.message || JSON.stringify(error.response.data);
      throw new Error(`API Error (${error.response.status}): ${errorMsg}`);
    } else if (error.request) {
      // Không nhận được phản hồi
      throw new Error(`No response from server: ${error.message}`);
    } else {
      // Lỗi trong lúc setup request
      throw new Error(`Request setup error: ${error.message}`);
    }
  }
}

// Instance chuyên dụng để stream dữ liệu (Ví dụ: SSE từ AI)
async function doStreamRequest(config, onData, onEnd, onError) {
  try {
    const response = await axios({
      ...config,
      responseType: 'stream',
    });

    response.data.on('data', onData);
    
    response.data.on('end', () => {
      onEnd({
        statusCode: response.status,
      });
    });

    response.data.on('error', onError);
  } catch (error) {
    onError(error);
  }
}

module.exports = {
  apiClient,
  doRequest,
  doStreamRequest,
};
