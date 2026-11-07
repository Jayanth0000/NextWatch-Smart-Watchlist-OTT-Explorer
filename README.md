# NextWatch: Smart Watchlist & OTT Explorer

A full-stack app for tracking movies and TV shows. Users sign up, search and browse titles from TMDB, save them to a watchlist with a status and rating, see which services stream a title in India, and get recommendations based on their highest-rated items.

## Tech stack

- **Client:** React 18, Vite, Material UI, React Router, Axios
- **Server:** Node.js, Express, Mongoose (MongoDB), JWT authentication, bcrypt
- **Data:** The Movie Database (TMDB) API

## Project structure

```
client/                 React app (Vite)
  src/
    api/                Axios instance with the auth token interceptor
    components/         Shared UI (MovieCard, MovieDetailsDialog, Navbar, ProtectedRoute)
    context/            AuthContext (login, register, logout)
    pages/              Login, Signup, Dashboard, Explore, ForYou, Watchlist
    theme/              Light/dark theme context
server/                 Express API
  routes/               auth, watchlist, explore (TMDB proxy and recommendations)
  models/               User, WatchItem
  middleware/auth.js    JWT check for protected routes
  server.js             App entry point
```

## Prerequisites

- Node.js 18 or newer
- MongoDB running locally, or a MongoDB Atlas connection string
- A TMDB API key from https://www.themoviedb.org/settings/api

## Setup

1. Install the dependencies:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

2. Create the server config from the example and fill in your values:
   ```bash
   cd server
   cp .env.example .env
   ```
   - `MONGODB_URI`: your MongoDB connection string
   - `JWT_SECRET`: a long random string. The server will not start without it.
   - `TMDB_API_KEY`: your TMDB API key

3. Create the client config (optional, defaults to `http://localhost:5000/api`):
   ```bash
   cd ../client
   cp .env.example .env
   ```

## Running

Start the API (port 5000 by default):
```bash
cd server
npm run dev
```

In a second terminal, start the client:
```bash
cd client
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## API overview

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create an account |
| POST | `/api/auth/login` | No | Log in and get a token |
| GET | `/api/auth/me` | Yes | Get the current user |
| GET | `/api/watchlist` | Yes | List the user's saved titles |
| GET | `/api/watchlist/dashboard` | Yes | Stats, top-rated titles and the hero item |
| POST | `/api/watchlist` | Yes | Add a title |
| PUT | `/api/watchlist/:id` | Yes | Update status, rating or review |
| DELETE | `/api/watchlist/:id` | Yes | Remove a title |
| GET | `/api/explore/trending` | No* | Trending titles |
| GET | `/api/explore/search?query=` | No* | Search movies and TV |
| GET | `/api/explore/details/:type/:id` | No* | Details, providers and IMDB ID |
| GET | `/api/explore/smart-recommendations` | Yes | Recommendations based on the user's list |

\* The `/api/explore` routes need `TMDB_API_KEY` to be set on the server.

## Notes

- Keep `.env` files out of Git. Only the `.env.example` files belong in the repository.
- The `/api/explore/smart-recommendations` route falls back to trending titles when the user has no rated or completed items.
