<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Hướng dẫn triển khai
## 1. Yêu cầu môi trường
- Node.js >= 16  
- npm hoặc yarn  
- [Ngrok](https://ngrok.com/) (tạo public URL cho backend)  
- Tài khoản:
  - [Bitrix24](https://www.bitrix24.com/)
## 2. Cài đặt môi trường
### 2.1. Node.js
- Tải về và cài đặt Node.js từ [nodejs.org](https://nodejs.org/en/download) (nên dùng bản LTS).  
- Kiểm tra cài đặt:
  ```bash
  node -v
  npm -v
  ```
### 2.2. Ngrok
- Tải về và cài đặt Ngrok từ [ngrok.com](https://ngrok.com/downloads).
- Kiểm tra cài đặt:
```bash
ngrok version
```
- Đăng ký tài khoản Ngrok để lấy Auth Token và chạy lệnh:
```bash
ngrok config add-authtoken <your_auth_token>
```
## 3. Thiết lập tài khoản
### 3.1. Lấy client_id và client_secret của Bitrix24
- Bước 1: Chạy ngrok
```
ngrok http 3000
```
- Bước 2: Copy url mới được tạo
- Bước 3: Đăng nhập vào [Bitrix24](https://www.bitrix24.vn/)
- Bước 4: **Vào Tài nguyên cho nhà phát triển** → **Khác**.
- Bước 5: Chọn **Ứng dụng cục bộ**
- Bước 6: Điền url vào đường dẫn ban đầu và <url>/install vào đường dẫn cài đặt, bấm lưu
- Bước 7: Copy client_id và client_secret
## 4. Triển khai ứng dụng
### 4.1. Clone từ github
```
# Clone project
git clone https://github.com/hoang1805/BitrixCRM.git
cd BitrixCRM

# Cài đặt dependencies
npm install
```
### 4.2. Cấu hình
- Tạo file .env trong thư mục gốc với nội dung có trong file .env.example
```
CLIENT_ID = <client_id>
CLIENT_SECRET = <client_secret>

BITRIX_OAUTH_DOMAIN = oauth.bitrix.info

BITRIX24_DOMAIN = <your_bitrix_domain>.bitrix24.vn
```
### 4.3. Khởi chạy
```
# Chạy server backend
npm start
```
## 5. Danh sách API
### `GET /contacts`: Danh sách các contact
- `200 OK`
```json
[
  {
    "id": "123",
    "name": "Nguyen Van A",
    "address": [
      {
        "typeId": "1",
        "address1": "123 ABC Street",
        "province": "Ho Chi Minh",
        "city": "Ho Chi Minh",
        "country": "VN"
      }
    ],
    "phone": [
      {
        "type": "WORK",
        "value": "0901234567"
      }
    ],
    "email": [
      {
        "type": "WORK",
        "value": "a@example.com"
      }
    ],
    "website": [
      {
        "type": "WORK",
        "value": "https://example.com"
      }
    ],
    "bank": [
      {
        "bankName": "Vietcombank",
        "accountNumber": "0123456789"
      }
    ]
  }
]
```
- Response Errors: Example: 401 Unauthorized
```
{
  "statusCode": 401,
  "message": "Invalid or expired token",
  "timestamp": "2025-08-20T08:35:12.000Z",
}
```
### `POST /contacts`: Tạo contact mới
- Body:
```json
{
  "firstName": "string",
  "lastName?": "string",
  "phone?": [
    {
      "type": "WORK | MOBILE | FAX | HOME | PAGER | MAILING | OTHER",
      "value": "string",
    }
  ],
  "email?": [
    {
      "type": "WORK | HOME | MAILING | OTHER",
      "value": "string",
    }
  ],
  "website?": [
    {
      "type": "WORK | HOME | FACEBOOK | VK | LIVEJOURNAL | TWITTER | OTHER",
      "value": "string",
    }
  ],
  "address?": [
    {
      "typeId": "number",
      "address1?": "string",
      "address2?": "string",
      "city?": "string",
      "province?": "string",
      "country?": "string",
    }
  ],
  "bank?": [
    {
      "name": "string",
      "accountNumber": "string",
    }
  ]
}
```
- `200 OK`
```json
{
  "contactId": 1
}
```
- Response Errors: Example: 400 Bad Request
```
{
  "statusCode": 400,
  "message": "Invalid or expired token",
  "timestamp": "2025-08-20T08:35:12.000Z",
}
```

### `PUT /contacts/:id`: Sửa contact
- Body:
```json
{
  "firstName?": "string",
  "lastName?": "string",
  "phone?": [
    {
      "id?": "string",
      "type?": "WORK | MOBILE | FAX | HOME | PAGER | MAILING | OTHER",
      "value?": "string",
      "deleted?": "boolean",
    }
  ],
  "email?": [
    {
      "id?": "string",
      "type?": "WORK | HOME | MAILING | OTHER",
      "value?": "string",
      "deleted?": "boolean",
    }
  ],
  "website?": [
    {
      "id?": "string",
      "type?": "WORK | HOME | FACEBOOK | VK | LIVEJOURNAL | TWITTER | OTHER",
      "value?": "string",
      "deleted?": "boolean",
    }
  ],
  "address?": [
    {
      "typeId": "number",
      "entityId?": "string",
      "address1?": "string",
      "address2?": "string",
      "city?": "string",
      "province?": "string",
      "country?": "string",
      "deleted?": "boolean",
    }
  ],
  "bank?": [
    {
      "id?": "string",
      "name?": "string",
      "accountNumber?": "string",
      "deleted?": "boolean",
    }
  ]
}
```
- `200 OK`
```json
{
  "message": "Update successfully !!!"
}
```
- Response Errors: Example: 400 Bad Request
```
{
  "statusCode": 400,
  "message": "Không tìm thấy mục",
  "timestamp": "2025-08-20T08:35:12.000Z",
}
```
### `DELETE /contacts/:id`: Xóa contact
- `200 OK`
```json
{
  "message": "Delete successfully !!!"
}
```
- Response Errors: Example: 400 Bad Request
```
{
  "statusCode": 400,
  "message": "Không tìm thấy mục",
  "timestamp": "2025-08-20T08:35:12.000Z",
}
```
## 6. Test API
- Đây là kết quả khi test trên [Postman](https://documenter.getpostman.com/view/32176988/2sB3BKG8Xt)
