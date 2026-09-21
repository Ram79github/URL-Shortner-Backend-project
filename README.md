# URL Shortener

A Node.js and Express URL shortener with user accounts, JWT authentication, protected link management, visit tracking, profile management, and an EJS web interface.

## Current Setup Blocker

The repository currently contains unresolved Git merge-conflict markers in runtime files, including `package.json`, `app.js`, route files, controllers, middleware, the auth service, and views. Resolve the `<<<<<<<`, `=======`, and `>>>>>>>` sections before running `npm install` or starting the application.

## Features

- Create an account and log in.
- Convert HTTP and HTTPS URLs into short links.
- Redirect visitors from a short link to the original URL.
- Track visits for each link.
- View analytics for links owned by the current user.
- Delete links from the home page.
- Update a profile name.
- Upload, replace, and remove a profile image.
- Allow admin users to view all stored links.

## Tech Stack

- Node.js with ES modules
- Express
- MongoDB with Mongoose
- EJS templates
- JWT authentication in an HTTP-only cookie
- Multer for local profile image uploads

## Requirements

- Node.js 18 or newer
- MongoDB running locally or a reachable MongoDB instance

## Installation

After resolving the merge conflicts, install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
SECRET_KEY=replace-with-a-long-random-secret
PORT=3000
```

`MONGODB_URI` is used as the base MongoDB URI. The application appends the `url-shortner` database name. `PORT` is optional and defaults to `3000`. `SECRET_KEY` is required for signing and verifying JWTs.

## Running the App

Start the development server with Nodemon:

```bash
npm run dev
```

Start the application normally:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in a browser. The server starts listening only after a successful MongoDB connection.

## Routes

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/` | User | Home page and the user's links |
| `GET` | `/signup` | Public | Signup page |
| `POST` | `/user/signup` | Public | Create an account |
| `GET` | `/login` | Public | Login page |
| `POST` | `/user/login` | Public | Log in and set the `token` cookie |
| `POST` | `/user/logout` | User | Clear the auth cookie |
| `POST` | `/urls` | User | Create a short URL and render the home page |
| `GET` | `/:shortId` | Public | Redirect to the original URL and record a visit |
| `GET` | `/urls/:shortId/analytics` | User | Return analytics JSON for an owned link |
| `DELETE` | `/urls/:shortId` | User | Delete an owned link and return JSON |
| `GET` | `/profile` | User | Show the profile page |
| `POST` | `/user/profile` | User | Update the profile name |
| `POST` | `/user/profile/upload` | User | Upload or replace a profile image |
| `POST` | `/user/profile/remove` | User | Remove the profile image |
| `GET` | `/admin/urls` | Admin | View all stored links |
| `GET` | `/auth/user/signup` | Public | Redirect to `/signup` |

Public short-link redirects do not require an account. User routes require a valid JWT and accept users with the `NORMAL` or `ADMIN` role. The admin route requires the `ADMIN` role.

## Profile Images

- Upload field name: `profileImg`
- Accepted types: JPEG, PNG, WebP, and GIF
- Maximum size: 2 MB
- Files are stored locally in `uploads/profiles/`.
- Files are served at `/uploads/profiles/<filename>`.
- Uploading a new image deletes the previous local image.
- Removing an image deletes the local file and clears the database field.

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
service/               JWT authentication service
uploads/profiles/      Local profile image storage
views/                 EJS pages
LOGIC-FLOW.md          Detailed request and data flow
```

## Important Limitations

- Passwords are currently stored and compared as plain text. Use bcrypt or Argon2 before deploying to production.
- JWTs are stored in cookies and are not backed by a server-side session store.
- The `Remember me` checkbox is displayed but is not implemented.
- The `Forgot password?` link has no route yet.
- Profile images are stored on the local filesystem, so shared or ephemeral deployments need persistent storage.

For a detailed explanation of request handling and route order, see [LOGIC-FLOW.md](LOGIC-FLOW.md).
