# Perfumador

A web app for managing perfume formulas, aromachemicals, and dilution inventory.

The app has no authentication or per-user data isolation. Run it in a private environment; anyone who can reach the API can read shared data and modify formulas.

## Stack

- JavaScript, React 19, and React Router 7
- Vite 8 and plain CSS
- Node.js and Express 5
- PostgreSQL through `pg`
- `dotenv`, `cors`, and ESLint

## What it does

- Catalog aromachemicals with names, CAS numbers, top/mid/base notes, and IFRA limits.
- Record dilution bottles with dilution percentages and initial grams.
- Create and delete formulas, add or remove dilution lines, and adjust free ethanol.
- Preview aromatic mass and concentration before saving a new line.
- Show dilution usage, remaining grams, and per-line IFRA limit flags.

## How it works

- Formula lines reference dilution bottles, which reference aromachemicals. Remaining inventory is initial grams minus usage across saved formula lines.
- Aromatic mass is line grams multiplied by dilution percentage. Concentration divides total aromatic mass by finished mass, including added ethanol.
- IFRA flags compare each line’s aromatic percentage of the finished formula with its stored limit. Repeated materials are not combined for this check.

## Running locally

Use Node.js 22.12+ and an existing compatible PostgreSQL database. Schema, migrations, and seed data are not included.

Create `server/.env`:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/perfumador
PORT=3000
```

`PORT` is optional and defaults to `3000`.

Create `client/.env`:

```dotenv
VITE_API_URL=http://localhost:3000
```

Start the API from the repository root:

```sh
cd server
npm ci
node index.js
```

In another terminal, from the repository root:

```sh
cd client
npm ci
npm run dev
```

Open the URL printed by Vite.

The database must already contain a formula to use the formula list’s create button; the empty-list screen currently hides it.

To build the client:

```sh
npm --prefix client run build
```
