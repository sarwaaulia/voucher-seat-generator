# Airline Voucher Seat Assignment Application

## About This App
A web application for an airline voucher promotion campaign. Crew members enter flight details; the system checks whether a voucher for that specific flight and date has already been generated, then randomly produces three unique seat numbers based on the selected aircraft layout and saves them to the database.

## Tech Stack
- Backend: Node.js + Express.js + TypeScript — REST API => 2 endpoint (/api/check, /api/generate), CORS.
- Database: SQLite (vouchers.db) via Prisma ORM.
- Frontend: React + Tailwind CSS + Axios

## Project Structure
```bash
voucher-seat-generator/
├── backend/
│   ├── prisma/
│   │   ├── migrations
│   │   ├── schema.prisma/
│   │   └── vouchers.db
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.ts
│   │   ├── controllers/
│   │   │   └──  voucher.controller.ts
│   │   ├── middleware/
│   │   │   └── errorHandler.ts 
│   │   ├── routes/
│   │   │   └── voucher.route.ts
│   │   ├── services/
│   │   │   ├── seat.service.ts
│   │   │   └── validate.service.ts
│   │   └── index.ts
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package.json
│   └── tsconfig.json
└── frontend
    ├── public/
    ├── src/
    │   ├── api/
    │   │   └── axios.ts
    │   ├── components/
    │   │   └── VoucherForm.tsx
    │   ├── utils/
    │   │   └── date.ts
    │   ├── App.tsx
    │   ├── index.css
    │   └── main.tsx
    └── .gitignore
```
## Core Features
- [x] Crew input form: crewName, crewID, flightNumber, flightDate, Aircraft Type (dropdown: ATR / Airbus 320 / Boeing 737 Max).
- [x] Duplicate check: Before creating a new voucher, the system calls `POST /api/check` to ensure a voucher does not already exist for that specific flight and date.
- [x] Random seat generator: generates exactly 3 unique, valid seats based on the aircraft layout (seat rows and columns vary by aircraft type), utilizing the Fisher–Yates shuffle algorithm to ensure an unbiased distribution.
- [x] Automatic storage: every successfully created voucher is saved to SQLite via Prisma.
- [x] Layered validation: lightweight frontend validation (for fast UX) combined with authoritative backend validation (`validate.service.js`).
- [x] Consistent error messages: all backend error responses follow the JSON format `{ success: false, error: { message, details? } }` with appropriate HTTP status codes (400, 404, 409, 500).
- [x] Query security: all database access uses Prisma Client (parameterized queries), ensuring protection against SQL injection.

## Requirements
- Node.js v18 or later (v20 recommended)
- npm v9+
- TypeScript v7.0.2

## Steps to Set up Projects
1. Clone, then go to the main folder
```bash
cd voucher-seat-generator
```
2. Setup Backend
```bash
cd backend
npm install                 # automatic run `prisma generate` (postinstall)
npx prisma migrate dev --name init   # make vouchers.db + voucher table
```
The `prisma migrate dev` command will create a `vouchers.db` file in the `backend/prisma/` folder, based on the schema defined in `prisma/schema.prisma`. 

run backend server:
```bash
npm run dev        # development (auto-reload via nodemon) mode
# or
npm start           # production mode
```
Backend running on http://localhost:3000

3. Setup Frontend
Buka terminal baru:
```bash
cd frontend
cp .env.example .env       # sesuaikan VITE_API_BASE_URL jika backend tidak di localhost:4000
npm install
npm run dev
```
Frontend running on http://localhost:5173.

Open your browser and go to that address to access the application.

## Usage
1. Open App in browser (http://localhost:5173).
2. Isi form:
    * crewName (exp. Sarah)
    * crewId (exp. 98123)
    * flightNumber (exp. GA102)
    * date (select by date picker)
    * Aircraft type (select from dropdown: ATR / Airbus 320 / Boeing 737 Max)
3. Click button "Create Voucher".
    * The system first calls POST /api/check.
    * If the voucher does not yet exist → the system calls POST /api/generate, then displays the 3 generated seat numbers.
    * If the voucher already exists → the system displays a clear error message stating that a voucher for that flight and date has already been created.
4. Click "Reset" to clear the form and create a new voucher for another flight.

Example Request/Response API

POST /api/check
```bash
// Request
{ "flightNumber": "GA102", "date": "2025-07-12" }

// Response
{ "exist": true }
```

POST /api/generate

```bash
// Request
{
  "name": "Sarah",
  "id": "98123",
  "flightNumber": "ID102",
  "date": "2025-07-12",
  "aircraft": "Airbus 320"
}

// Response sukses (201)
{ "success": true, "seats": ["3B", "7C", "14D"] }

// Response jika sudah ada voucher (409)
{
  "success": false,
  "error": { "message": "Voucher for flight ID102 on 2025-07-12 has been created before." }
}
```

## Database Schema
Table voucher (SQLite, manage by Prisma):

| Kolom | Tipe | Keterangan |
| :--- | :--- | :--- |
| **id** | `INTEGER` | Primary key, autoincrement. |
| **crewName** | `TEXT` | crew name |
| **crewId** | `TEXT` | ID awak kabin. |
| **flightNumber** | `TEXT` | flight number. |
| **flightDate** | `TEXT` | flight date with format `YYYY-MM-DD`. |
| **aircraftType** | `TEXT` | aircraft type. |
| **seat1, seat2, seat3** | `TEXT` | 3 seast  |
| **created_at** | `TEXT` | created time format ISO 8601. |

> ⚠️ The `flight_number` and `flight_date` columns have a **composite unique constraint (`@@unique`)**. This is the system's primary mechanism to ensure that duplicate vouchers are not created for the same flight on the same day.

---
**Made by Sarwa Aulia Nabila Ramadhani &copy; 2026**  
Created as a Full Stack Programmer skills test — PT Astronacci International.
