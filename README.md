# FB/AI MVP Test API (Node.js)

Project test API duoc to chuc theo route-controller-service de kiem tra:
- AI proxy chat/completions
- Facebook Graph API
- Telegram Bot API

## Kien truc

- src/routes: khai bao endpoint
- src/controllers: xu ly request/response
- src/services: nghiep vu test tung API
- src/utils: HTTP client va helper tao result
- src/config: doc va merge config

## Cau hinh

Sua file config/test.settings.json hoac dung bien moi truong:
- AI_PROXY_API_KEY
- FB_PAGE_ACCESS_TOKEN
- FB_PAGE_ID
- TG_BOT_TOKEN
- TG_CHAT_ID

## Chay server

```bash
npm start
```

Route san co:
- GET /health
- POST /api/chat
- POST /api/tests/ai
- POST /api/tests/facebook
- POST /api/tests/telegram

Luu y:
- API chi tra JSON de test tren Postman
- Khong ghi file test result ra disk

## Chat hoi dap (stream da ghep noi dung)

Goi route sau de nhan 1 van ban hoan chinh:

POST /api/chat

Body mau:

```json
{
	"message": "Xin chao, gioi thieu ngan gon ve ban.",
	"model": "gpt-5.3-codex",
	"max_tokens": 128,
	"temperature": 0
}
```

Response co truong:
- content: van ban da ghep tu stream chunks
- hasContent: true/false

