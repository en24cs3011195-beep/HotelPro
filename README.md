# HotelPro — Hotel Management System (MERN)

A runnable student-project MVP based on the uploaded Hotel Management Project PDF. It includes:
- Guest registration/login with JWT and hashed passwords
- Room listing, search/filtering, room details and date-based booking
- Booking history and cancellation
- Admin dashboard to create/edit/delete rooms, view bookings and users
- MongoDB persistence and responsive React UI

## Requirements
- Node.js 18+ (20 LTS recommended) and npm
- MongoDB Community Server running locally **or** a MongoDB Atlas connection string
- VS Code or another editor

## 1. Configure MongoDB and backend
Open a terminal in `HotelPro/server`:

```bash
npm install
```

Copy `.env.example` to `.env` and set `MONGODB_URI` and a long random `JWT_SECRET`.

For local MongoDB, the default URI is:
`mongodb://127.0.0.1:27017/hotelpro`

Start the API:
```bash
npm run dev
```
Expected message: `MongoDB connected` and `HotelPro API listening on http://localhost:5000`.

### Create an admin account
With the backend running, open a second terminal in `HotelPro/server`:
```bash
npm run seed:admin
```
This creates (or reports an existing account for):
- Email: `admin@hotelpro.local`
- Password: `Admin123!`

Change the password after your first login. Do not use these demo credentials in a deployed app.

## 2. Configure and run the frontend
Open a second terminal in `HotelPro/client`:
```bash
npm install
```
Copy `.env.example` to `.env` (the default API URL is fine), then:
```bash
npm run dev
```
Open the local URL Vite prints, usually `http://localhost:5173`.

## 3. Try it
1. Register a normal guest account.
2. Log in and browse rooms.
3. Choose check-in/check-out dates and book a room.
4. Open **My bookings** to view/cancel a booking.
5. Log in as the seeded admin to add/edit/delete rooms and review all bookings/users.

Sample rooms are inserted automatically when the database has no rooms.

## Environment variables
### `server/.env`
- `PORT` — API port (default `5000`)
- `MONGODB_URI` — local MongoDB or Atlas URI
- `JWT_SECRET` — secret used to sign JWTs
- `CLIENT_URL` — frontend origin (default `http://localhost:5173`)

### `client/.env`
- `VITE_API_URL` — backend base URL (default `http://localhost:5000/api`)

## Troubleshooting
- **MongoDB connection error:** ensure MongoDB is installed/running, or use a valid Atlas URI. In Atlas, create a database user, allow your current IP in Network Access, and paste the connection string into `server/.env`.
- **Port in use:** change `PORT` in `server/.env`; also update `VITE_API_URL` if the API port changes.
- **CORS error:** make sure `CLIENT_URL` matches the URL printed by Vite.
- **Frontend cannot reach API:** start the backend first and check `http://localhost:5000/api/health`.
- **Admin login fails:** run `npm run seed:admin` from `server`, then use the demo credentials above.
- **Dates:** check-out must be after check-in. Availability is checked on the server to prevent overlapping active reservations.

## Important scope note
This is a complete **local academic MVP**, not a production-certified hotel/payment platform. Real payment gateway, email/SMS, refunds, cloud image storage, formal email verification, rate limiting, audit dashboards and deployment hardening are not implemented. Booking records are confirmed locally without collecting card details. Never store raw card numbers or CVV.
