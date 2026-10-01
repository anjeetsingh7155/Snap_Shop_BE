# SnapShop Backend

REST API for the SnapShop e-commerce mobile app. Built with Node.js, Express, TypeScript and MongoDB (Mongoose).

- Live API: YOUR_BE_URL
- Frontend repository: https://github.com/anjeetsingh7155/Snap_Shop_FE.git

The live API runs on a free hosting plan, so the first request after a quiet period can be slow while the server wakes up.

## Features

- Register and login with JWT authentication (token valid for 7 days)
- Passwords are hashed with bcryptjs
- Products: list, details, search and category filter
- Cart: add, change quantity, remove, total price
- Orders: checkout with Cash on Delivery only, my orders, order details, order status
- Input validation with Zod
- Sample data script (seed) with 5 categories and 15 products

## Tech stack

- Node.js, Express 5, TypeScript
- MongoDB with Mongoose 9 (MongoDB Atlas)
- JSON Web Token (jsonwebtoken), bcryptjs, Zod, cors, dotenv

## Project structure

```
src/
  config/db.ts          database connection
  middleware/auth.ts    JWT check for protected routes
  models/               user, category, product, cart, order
  routes/               auth, category, product, cart, order
  seed/seed.ts          sample categories and products
  types/index.ts        shared types
  utils/validate.ts     validation error helper
  index.ts              app entry point
```

## Setup

Requirements: Node.js (development used version 22) and a MongoDB database (a free MongoDB Atlas cluster works).

1. Clone the repository and install packages:
   ```
   git clone https://github.com/anjeetsingh7155/Snap_Shop_BE.git
   cd Snap_Shop_BE
   npm install
   ```
2. Create a file named `.env` in the project folder:
   ```
   PORT=5000
   DB_URL=your MongoDB connection string (include a database name, for example /snapshop)
   SESSION_SECRET=any long random text used to sign the JWT
   ```
3. Build the project:
   ```
   npm run build
   ```
4. Add the sample data (see the next section).
5. Start the server:
   ```
   npm run dev
   ```
   The API runs at http://localhost:5000 and the health check at `/` returns `{"message":"SnapShop Backend Running"}`.

## Scripts

- `npm run build` compiles TypeScript into the `dist` folder
- `npm run start` runs `dist/index.js` with nodemon
- `npm run dev` builds and then starts

## Database seed data

The seed script adds 5 categories (Electronics, Fashion, Home & Kitchen, Books, Sports) and 15 sample products so the app can be tested.

```
npm run build
node dist/seed/seed.js
```

Running it again deletes the existing products and categories and adds them fresh. Users, carts and orders are not touched.

## API endpoints

Base path: `/api/v1`. Routes marked "token" need the header `Authorization: Bearer <token>`.

### Auth

- `POST /auth/register` create an account (name, email, password, optional phone and address)
- `POST /auth/login` returns the token and the user
- `GET /auth/profile` token, get the logged-in user
- `PUT /auth/profile` token, update name, phone or address

### Categories and products

- `GET /categories` list categories
- `GET /products` list products, optional query `?search=watch&category=<categoryId>`
- `GET /products/:id` product details

### Cart (all need a token)

- `GET /cart` current cart with items, total items and total price
- `POST /cart/add` body `{ "productId": "...", "quantity": 1 }`
- `PUT /cart/update` body `{ "productId": "...", "quantity": 3 }`
- `DELETE /cart/remove/:productId` remove one item

### Orders (all need a token)

- `POST /orders` checkout from the cart, body `{ "shippingAddress": "...", "phone": "..." }`. Payment method is Cash on Delivery. Stock is reduced and the cart is emptied.
- `GET /orders` my orders, newest first
- `GET /orders/:id` order details including the status

Order status values: Pending, Confirmed, Shipped, Delivered, Cancelled. A new order starts as Pending.

## Logout

Logout is handled in the mobile app by deleting the saved token. The JWT is stateless, so the server has no logout route.

## Notes

- Keep the `.env` file private. It is listed in `.gitignore`.
- When deploying, set the same three values (`PORT` is optional on most hosts, `DB_URL`, `SESSION_SECRET`) as environment variables and allow the host to reach your database in the MongoDB Atlas Network Access settings.
