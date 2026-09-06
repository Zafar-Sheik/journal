# Daybook — Personal Journal

A private journal web application built with Next.js, TypeScript, MySQL, Prisma, and the OpenWeather API. Authentication is custom and uses database-backed sessions stored in secure HTTP-only cookies.

## Features

- Register, login, logout
- Password hashing with bcrypt
- Cryptographically random session tokens; only SHA-256 token hashes are stored in MySQL
- Protected journal pages and user ownership checks
- Create, view, edit, and delete journal entries
- Automatic entry date
- Day rating: Great, Good, Average, Bad
- 0–100 mood slider between sad and happy
- Browser geolocation + OpenWeather current conditions
- Weather snapshot saved with the journal entry
- Responsive dashboard with simple mood statistics

## 1. Requirements

- Node.js 20.19+ (Node 22 or 24 recommended)
- MySQL 8+ or a compatible MySQL/MariaDB server
- OpenWeather API key

## 2. Create the database

Example MySQL commands:

```sql
CREATE DATABASE personal_journal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'journal_user'@'localhost' IDENTIFIED BY 'replace-this-password';
GRANT ALL PRIVILEGES ON personal_journal.* TO 'journal_user'@'localhost';
FLUSH PRIVILEGES;
```

## 3. Configure environment variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

`DATABASE_URL` is used by Prisma migrations. `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, and `DATABASE_NAME` are used by Prisma's MySQL/MariaDB driver adapter at runtime.

## 4. Install and initialize

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Open `http://localhost:3000`.

## Authentication design

1. Registration hashes the password with bcrypt before storing it.
2. Login compares the submitted password with the stored hash.
3. Successful login creates a 32-byte random session token.
4. The raw token is placed only in an HTTP-only, SameSite=Lax cookie.
5. A SHA-256 hash of the token is stored in the `Session` table.
6. Each protected request hashes the cookie and looks up the matching, non-expired session.
7. Logout deletes the session row and clears the cookie.

The raw password and raw session token are never stored in the database.

## Important production additions

Before treating this as a public production service, add rate limiting to login/register endpoints, CSRF/origin checks for state-changing requests, password reset/email verification, security headers, audit logging, and deployment-specific database connection tuning.
