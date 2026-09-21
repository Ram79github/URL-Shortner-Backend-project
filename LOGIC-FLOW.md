# URL Shortener Logic Flow

This document explains how the application works from the first request to the final response.

## 1. What the application does

A user can:

1. Create an account.
2. Log in.
3. Turn a long HTTP or HTTPS URL into a short URL.
4. Open the short URL and be redirected to the original URL.
5. See the number of visits to each URL.
6. Delete URLs created by that user.

The application uses Express for HTTP routes, EJS for pages, MongoDB through Mongoose for saved data, and an in-memory Map for login sessions.

## 2. How the server starts

1. `index.js` loads environment variables from `.env`.
2. It reads `PORT`, or uses port `3000` when `PORT` is missing.
3. `connectDB()` connects to MongoDB using `MONGODB_URI` and the database name in `constant.js`.
4. The server starts listening only after the database connection succeeds.
5. `app.js` creates the Express application and registers all middleware and routes.

Required environment variable:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
PORT=3000
```

## 3. Important folders and files

| File or folder | Responsibility |
| --- | --- |
| `index.js` | Starts the database connection and HTTP server. |
| `app.js` | Configures Express, cookies, forms, views, and routes. |
| `routes/` | Matches URLs to controller functions. |
| `controller/` | Contains the work for each request. |
| `middlewares/auth.middleware.js` | Reads the login cookie and adds the user to `req.user`. |
| `service/auth.service.js` | Stores the session ID to user mapping in memory. |
| `models/` | Defines the MongoDB document shapes. |
| `views/` | Contains the HTML pages rendered by EJS. |
| `db/index.js` | Opens the MongoDB connection. |

## 4. Authentication flow

### Signup

Request: `POST /user/signup`

1. The signup form sends `name`, `email`, and `password`.
2. The controller trims the name and email.
3. The controller converts the email to lowercase.
4. If a required value is missing, the server returns a `400` response.
5. A new user is saved in MongoDB.
6. If the email already exists, the server returns a `409` response.
7. After successful signup, the user is sent to the login page.

### Login

Request: `POST /user/login`

1. The login form sends an email and password.
2. The controller normalizes the email in the same way as signup.
3. MongoDB is searched for a matching email and password.
4. If no user matches, the login page displays an error message.
5. If a user matches, the server creates a random session ID.
6. The session ID and user are stored in `auth.service.js`.
7. The session ID is placed in the `uid` cookie.
8. The user is redirected to `/`.

### Checking a user

The application has two authentication middlewares:

- `checkAuth`: attaches the user to `req.user` when a valid cookie exists. It never blocks the request.
- `restrictToAuthenticatedUsers`: attaches the user to `req.user`, or redirects to `/login` when there is no valid session.

The home page uses `checkAuth`. URL management uses `restrictToAuthenticatedUsers`.

## 5. Create a short URL flow

Request: `POST /urls`

1. The authentication middleware checks the `uid` cookie.
2. The controller reads the submitted `url` value.
3. Empty input returns `400`.
4. The URL is parsed with JavaScript's built-in `URL` class.
5. URLs using a protocol other than `http:` or `https:` return `400`.
6. The parsed URL is converted to a normalized string.
7. MongoDB is searched for an existing document with the same normalized URL.
8. If the URL already exists, the existing short ID is rendered and marked as a duplicate.
9. Otherwise, `nanoid(8)` creates a new short ID.
10. The new document is saved with the current user's ID in `createdBy`.
11. The home page renders the new short ID.

The URL document contains:

- `shortId`: the value used after the domain, such as `/Ab12cd34`.
- `redirectURL`: the original long URL.
- `visitHistory`: an array of visit timestamps.
- `createdBy`: the MongoDB ID of the owner.
- `createdAt` and `updatedAt`: timestamps supplied by Mongoose.

## 6. Open a short URL flow

Request: `GET /:shortId`

1. The redirect route runs after the page and authentication routes.
2. The controller finds the URL by `shortId`.
3. A new timestamp is pushed into `visitHistory`.
4. If no matching short ID exists, the server returns `404`.
5. Otherwise, Express redirects the visitor to `redirectURL`.

This route is intentionally public. A visitor does not need an account to use a short link.

## 7. View analytics flow

Request: `GET /urls/:shortId/analytics`

1. The authentication middleware checks the session.
2. The controller searches by both `shortId` and `createdBy`.
3. This means one user cannot view another user's URL analytics through this route.
4. If the URL is not owned by the current user, the server returns `404`.
5. Otherwise, the response contains the visit count and visit history.

## 8. Delete a short URL flow

Request: `DELETE /urls/:shortId`

1. The authentication middleware checks the session.
2. The controller searches by both `shortId` and `createdBy`.
3. If no owned URL is found, the server returns `404`.
4. If the URL is found, it is deleted.
5. The user is redirected back to `/`.

The home page uses a small browser `fetch` call because normal HTML forms do not support the DELETE method directly.

## 9. Page routes

| Request | Result |
| --- | --- |
| `GET /` | Shows the home page for a logged-in user, otherwise redirects to login. |
| `GET /signup` | Shows the signup page. |
| `GET /login` | Shows the login page. |
| `GET /auth/user/signup` | Redirects old bookmarks to `/signup`. |

## 10. Route order in `app.js`

Route order matters because the redirect route accepts any single path segment:

1. Express parses form data and JSON.
2. Express reads cookies.
3. `/urls` handles authenticated URL actions.
4. `/user` handles signup and login.
5. `/` handles pages.
6. The old signup URL is redirected.
7. The final `/:shortId` route handles public short-link redirects.

Putting the redirect route earlier could accidentally treat `/login` or `/signup` as a short ID.

## 11. Current limitations

These are intentional current project limitations, not hidden behavior:

- Passwords are stored and compared as plain text. A production application should hash passwords with a password-hashing library such as bcrypt or Argon2.
- Sessions are stored in a JavaScript `Map`, so all users are logged out when the server restarts and multiple server instances will not share sessions.
- The profile image field exists in the form and model, but there is no file-upload middleware, so the image is not currently saved.
- The `Remember me` checkbox is displayed but is not used by the server.
- The `Forgot password?` link has no route yet.
- There is no logout button or logout route yet.

## 12. Beginner debugging checklist

When something does not work, check these in order:

1. Is MongoDB running?
2. Does `.env` contain `MONGODB_URI`?
3. Is the browser sending the request to the correct route (`/user` for auth and `/urls` for URL actions)?
4. Does the request have the `uid` cookie when an authenticated route is used?
5. Does the URL document have the correct `createdBy` field?
6. Is the requested `shortId` present in MongoDB?
7. Check the terminal for the server error message.

## 13. Useful commands

```bash
npm install
npm run dev
npm start
```

The development server runs with Nodemon. The normal server runs with Node.
