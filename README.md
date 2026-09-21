# URL Shortener

A Node.js and Express URL shortener with user accounts, protected link management, visit tracking, and an EJS web interface.

## Features

- Create an account and log in.
- Convert HTTP and HTTPS URLs into short links.
- Redirect visitors from a short link to the original URL.
- Track visits for each link.
- View analytics for links owned by the current user.
- Delete links from the home page.
- Uploads are served from the `uploads/` directory.

## Tech Stack

- Node.js with ES modules
- Express
- MongoDB with Mongoose
- EJS templates
- Cookie-based in-memory sessions
- Multer for upload handling

## Requirements

- Node.js 18 or newer
- MongoDB running locally or a reachable MongoDB instance

## Installation

```bash
npm install
```

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
PORT=3000
```

`PORT` is optional and defaults to `3000`.

## Running the App

Start the development server with Nodemon:

```bash
npm run dev
```

Start the application normally:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

The server starts listening only after a successful MongoDB connection.

## Main Routes

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/` | Home page and the user's links |
| `GET` | `/signup` | Signup page |
| `POST` | `/user/signup` | Create an account |
| `GET` | `/login` | Login page |
| `POST` | `/user/login` | Log in |
| `POST` | `/urls` | Create a short URL |
| `GET` | `/:shortId` | Redirect to the original URL |
| `GET` | `/urls/:shortId/analytics` | View link analytics |
| `DELETE` | `/urls/:shortId` | Delete an owned link |

Public short-link redirects are available without an account. Creating, viewing, and deleting managed links requires authentication.

## Project Structure

```text
app.js                 Express application and middleware
index.js               Database connection and server startup
constant.js            Application constants
controller/            Request handlers
db/                    MongoDB connection
middlewares/           Authentication and upload middleware
models/                Mongoose models
routes/                Express route definitions
service/               Authentication session service
uploads/               Uploaded files
views/                 EJS pages
LOGIC-FLOW.md          Detailed request and data flow
```

## Important Limitations

- Passwords are currently stored as plain text. Use bcrypt or Argon2 before deploying to production.
- Sessions are stored in memory, so all sessions end when the server restarts and are not shared across instances.
- The `Remember me` and `Forgot password?` controls are not fully implemented.
- A logout route and button are not currently available.

For a detailed explanation of request handling and route order, see [LOGIC-FLOW.md](LOGIC-FLOW.md).
