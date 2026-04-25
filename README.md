# 🤖 MMO Agent (Facebook Insight Agent)

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Express Version](https://img.shields.io/badge/express-v5.x-blue)](https://expressjs.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**MMO Agent** là một hệ thống backend mạnh mẽ được thiết kế để tự động hóa việc thu thập thông tin từ Facebook và tích hợp trí tuệ nhân tạo (AI) để phân tích dữ liệu. Hệ thống giúp tối ưu hóa các chiến dịch MMO (Make Money Online) thông qua việc thấu hiểu dữ liệu và tương tác thông minh.

---

## ✨ Tính năng chính

- 🔍 **Facebook Insights**: Thu thập thông tin chi tiết từ các trang Facebook thông qua Graph API.
- 💬 **AI Chat Integration**: Tích hợp các mô hình ngôn ngữ lớn (LLM) để phân tích dữ liệu hoặc phản hồi tự động.
- 🚀 **RESTful API**: Cấu trúc API rõ ràng, dễ dàng tích hợp với các ứng dụng frontend hoặc bot.
- 🛡️ **Environment Security**: Quản lý cấu hình bảo mật chặt chẽ qua biến môi trường.

---

## 🛠️ Công nghệ sử dụng

- **Runtime**: Node.js
- **Framework**: Express.js (v5)
- **HTTP Client**: Axios
- **Quản lý biến môi trường**: Dotenv
- **Code Quality**: ESLint & Prettier

---

## 🚀 Cài đặt và Sử dụng

### 1. Clone repository
```bash
git clone https://github.com/ToHuyTheAnh0101/mmo-agent.git
cd mmo-agent
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env` tại thư mục gốc và cấu hình các thông số sau:
```env
PORT=3000

# AI Config
AI_BASE_URL=https://proxy.simpleverse.io.vn/api/v1
AI_MODEL=gpt-5.3-codex
AI_API_KEY=your_api_key_here

# Facebook Account for Automation (Tùy chọn)
FB_UID=your_uid
FB_PASS=your_password
FB_2FA=your_2fa_secret
```

### 4. Luồng Automation (Tự động lấy Token)
Hệ thống hỗ trợ tự động đăng nhập vào Facebook để lấy `Access Token` thông qua Puppeteer. Để sử dụng:
1. Đảm bảo đã điền đầy đủ `FB_UID`, `FB_PASS`, và `FB_2FA` trong file `.env`.
2. Gọi API `/api/facebook/login` (POST).
3. Hệ thống sẽ trả về Token và lưu tạm vào bộ nhớ để sử dụng cho các yêu cầu tiếp theo.

### 4. Chạy ứng dụng
- **Chế độ phát triển (Development):**
  ```bash
  npm run dev
  ```
- **Chế độ sản phẩm (Production):**
  ```bash
  npm start
  ```

---

## 📋 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Kiểm tra trạng thái hệ thống |
| `POST` | `/api/ai/chat` | Gửi câu hỏi và nhận phản hồi từ AI |
| `GET` | `/api/facebook/page/:id` | Lấy thông tin chi tiết của một Facebook Page |
| `POST` | `/api/facebook/login` | Tự động đăng nhập và lấy Access Token |

---

## 🤝 Đóng góp

1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Phát triển bởi [ToHuyTheAnh0101](https://github.com/ToHuyTheAnh0101)*
