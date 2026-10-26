# Video Platform Backend (`chai-backend`)

A production-ready REST API backend for a video hosting and streaming platform, built with Node.js, Express, and MongoDB.

## Features

- **User Authentication & Authorization**: Secure signup, login, logout, and JWT token rotation (`accessToken` and `refreshToken`).
- **Secure Password Handling**: Bcrypt salting and hashing via Mongoose pre-save middleware.
- **Media Asset Management**: Multer disk storage pipeline with Cloudinary cloud uploads for user avatars and cover images.
- **Error Handling & Response Architecture**: Centralized standard `ApiError` class and uniform `ApiResponse` envelope.
- **Async Safety**: High-order `asyncHandler` wrapper catching async execution errors.
- **Database Modeling**: Relational-style document modeling using Mongoose for Users, Videos, and Subscriptions.

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT), Bcrypt
- **File Uploads**: Multer, Cloudinary
- **Code Quality**: Prettier, Nodemon

## Project Structure

```text
chai-backend/
├── public/
│   └── temp/               # Temporary landing directory for Multer uploads (.gitkeep)
├── src/
│   ├── controllers/        # Request handlers and business logic
│   │   ├── comment.controller.js
│   │   ├── tweet.controller.js
│   │   └── user.controller.js
│   ├── db/                 # MongoDB database connection logic
│   │   └── index.js
│   ├── middlewares/        # Express custom middlewares (Auth, Multer)
│   │   ├── auth.middleware.js
│   │   └── multer.middleware.js
│   ├── models/             # Mongoose schemas and methods
│   │   ├── comment.model.js
│   │   ├── like.model.js
│   │   ├── playlist.model.js
│   │   ├── subscription.model.js
│   │   ├── tweet.model.js
│   │   ├── user.model.js
│   │   └── video.model.js
│   ├── routes/             # Express routers and endpoint definitions
│   │   └── user.routes.js
│   ├── utils/              # Reusable helper utilities
│   │   ├── apiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandlers.js
│   │   └── cloudinary.js
│   ├── app.js              # Express app setup and middleware configuration
│   ├── constants.js        # Global application constants
│   └── index.js            # Application entrypoint
├── .env.sample             # Environment configuration template
├── .gitignore              # Git ignore rules
├── package.json            # Project manifest and dependencies
└── readme.md               # Project documentation
```

## Environment Variables

Copy `.env.sample` to `.env` and fill in the values:

```bash
cp .env.sample .env
```

| Variable | Description |
|---|---|
| `PORT` | Server listening port (e.g. 8000) |
| `MONGO_URI` | MongoDB Atlas / local connection string |
| `CORS_ORIGIN` | Allowed CORS origin (e.g. `*` or client URL) |
| `ACCESS_TOKEN_SECRET` | Secret key for signing access JWTs |
| `ACCESS_TOKEN_EXPIRY` | Access token lifespan (e.g. `1d`) |
| `REFRESH_TOKEN_SECRET` | Secret key for signing refresh JWTs |
| `REFRESH_TOKEN_EXPIRY` | Refresh token lifespan (e.g. `10d`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

## API Endpoints

### User Routes (`/api/v1/users`)

| Method | Endpoint | Description | Auth Required | Request Type |
|---|---|---|---|---|
| `POST` | `/api/v1/users/register` | Register a new user | No | `multipart/form-data` (`avatar`, `coverImage`) |
| `POST` | `/api/v1/users/login` | User login & cookie issue | No | `application/json` |
| `POST` | `/api/v1/users/logout` | Invalidate refresh token & clear cookies | Yes (`verifyJWT`) | Header / Cookie |
| `POST` | `/api/v1/users/refreshAccessToken` | Rotate and issue new tokens | No | Cookie / JSON |

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.sample .env
   # Update variables in .env
   ```

3. **Run in Development Mode**:
   ```bash
   npm run dev
   ```