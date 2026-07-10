# Shopster Phase 2 Backend Guide - Vikram And Jeet

## Goal Of Phase 2

Phase 1 has admin authentication and admin product CRUD.

Phase 2 introduces buyer features:

- Buyer registration
- Buyer login
- Buyer profile CRUD
- Buyer cart CRUD

Orders and payments are not part of Phase 2. Keep them for Phase 3.

## Team Split

To avoid conflicts, Vikram and Jeet should work on different backend areas.

Recommended split:

- Vikram: Buyer authentication and buyer profile
- Jeet: Cart model, cart controller, and cart routes

Do not edit each other's files unless discussed first.

## Branch Rule

Each developer has their own branch.

Before starting:

1. Pull latest code.
2. Switch to your own branch.
3. Run backend locally.
4. Check existing admin/product APIs.
5. Create only the files assigned to you.

Before raising PR:

1. Pull latest main branch into your branch.
2. Resolve conflicts in your own branch.
3. Test your APIs.
4. Mention which endpoints you added.

## Current Backend Structure

Important folders:

- `models`
- `controllers`
- `routes`
- `middleware`
- `utils`
- `config`
- `server.js`

Current API groups:

- `/api/auth`
- `/api/product`

Phase 2 should add buyer and cart API groups.

Suggested API groups:

- `/api/buyer`
- `/api/cart`

## Shared Rules For Both Developers

Use consistent response format.

Recommended success response:

```json
{
  "status": "Success",
  "message": "Short message",
  "data": {}
}
```

Recommended error response:

```json
{
  "status": "Fail",
  "message": "Short error message"
}
```

Do not send passwords in API responses.

Do not write frontend code from backend branches.

Do not add order or payment code in Phase 2.

## Vikram Responsibility - Buyer Auth And Profile

Vikram should own buyer-related files.

Suggested files:

- `models/Buyer.js`
- `controllers/buyerController.js`
- `routes/buyerRoutes.js`
- `middleware/buyerAuthMiddleware.js`

Avoid editing:

- `models/Product.js` or `models/productModel.js`
- `controllers/productController.js`
- `router/productRoutes.js`
- Cart files owned by Jeet

## Vikram Step 1 - Buyer Model

Create a Buyer model.

Fields to consider:

- username or name
- email
- password
- phone
- address
- timestamps

Beginner checklist:

1. Create buyer schema.
2. Make email required.
3. Make email unique.
4. Make password required.
5. Add timestamps.
6. Export the model.

Do not store plain password.

## Vikram Step 2 - Buyer Register API

Create buyer registration controller.

Expected behavior:

1. Read buyer data from request body.
2. Validate required fields.
3. Check if email already exists.
4. Hash password.
5. Create buyer.
6. Generate token.
7. Return buyer data without password.

Suggested route:

- `POST /api/buyer/register`

Do not copy admin controller blindly. Understand every field.

## Vikram Step 3 - Buyer Login API

Create buyer login controller.

Expected behavior:

1. Read email and password.
2. Find buyer by email.
3. Compare password with hashed password.
4. Return token and buyer basic details.

Suggested route:

- `POST /api/buyer/login`

Do not return password.

## Vikram Step 4 - Buyer Profile APIs

Create buyer profile APIs.

Suggested routes:

- `GET /api/buyer/profile`
- `PUT /api/buyer/profile`
- `DELETE /api/buyer/profile`

Beginner checklist:

1. Protect profile routes using buyer auth middleware.
2. Get buyer ID from token.
3. Fetch buyer from database.
4. Allow only safe fields to update.
5. Do not allow email/password update unless planned.
6. Return updated profile without password.

## Vikram Step 5 - Buyer Auth Middleware

Create middleware for buyer protected routes.

Expected behavior:

1. Read token from `Authorization` header.
2. Verify token.
3. Find buyer by decoded ID.
4. Attach buyer to `req`.
5. Call `next()`.

Use a different middleware name from admin middleware so it is clear.

Suggested name:

- `protectBuyer`

## Vikram Step 6 - Mount Buyer Routes

Add buyer routes in `server.js`.

Suggested mount:

- `app.use("/api/buyer", buyerRoutes);`

Coordinate with Jeet if both of you need to edit `server.js`.

Only one person should edit `server.js` at a time.

## Jeet Responsibility - Cart

Jeet should own cart-related files.

Suggested files:

- `models/Cart.js`
- `controllers/cartController.js`
- `routes/cartRoutes.js`

Jeet may need to use Vikram's buyer auth middleware after it is ready.

Avoid editing:

- `models/Buyer.js`
- `controllers/buyerController.js`
- `routes/buyerRoutes.js`
- Buyer auth middleware, unless agreed
- Product controller, unless needed only for reading product data

## Jeet Step 1 - Cart Model

Create a Cart model.

Fields to consider:

- buyer ID
- items array
- product ID inside each item
- quantity inside each item
- price snapshot, if team decides
- timestamps

Beginner checklist:

1. Link cart to buyer.
2. Link cart items to products.
3. Store quantity.
4. Add basic validation.
5. Add timestamps.

Do not create order schema in Phase 2.

## Jeet Step 2 - Get Cart API

Create API to fetch the current buyer cart.

Suggested route:

- `GET /api/cart`

Expected behavior:

1. Read buyer from auth middleware.
2. Find cart for that buyer.
3. Populate product details if needed.
4. Return empty cart if no cart exists yet.

## Jeet Step 3 - Add To Cart API

Create API to add product to cart.

Suggested route:

- `POST /api/cart`

Expected body:

```json
{
  "productId": "product id here",
  "quantity": 1
}
```

Expected behavior:

1. Check buyer is logged in.
2. Check product exists.
3. Find buyer cart.
4. If product already exists in cart, increase quantity.
5. If product does not exist, add new item.
6. Save cart.
7. Return updated cart.

## Jeet Step 4 - Update Cart Quantity API

Create API to update quantity.

Suggested route:

- `PUT /api/cart/:productId`

Expected body:

```json
{
  "quantity": 2
}
```

Expected behavior:

1. Check buyer is logged in.
2. Find buyer cart.
3. Find item by product ID.
4. Update quantity.
5. If quantity is zero, remove item.
6. Return updated cart.

## Jeet Step 5 - Remove Item API

Create API to remove one product from cart.

Suggested route:

- `DELETE /api/cart/:productId`

Expected behavior:

1. Check buyer is logged in.
2. Find buyer cart.
3. Remove item.
4. Save cart.
5. Return updated cart.

## Jeet Step 6 - Clear Cart API

Create API to clear full cart.

Suggested route:

- `DELETE /api/cart`

Expected behavior:

1. Check buyer is logged in.
2. Find buyer cart.
3. Remove all items.
4. Return empty cart.

## Jeet Step 7 - Mount Cart Routes

Add cart routes in `server.js`.

Suggested mount:

- `app.use("/api/cart", cartRoutes);`

Coordinate with Vikram if buyer routes are also being mounted.

Only one person should edit `server.js` at a time.

## Shared API Contract With Neelam

Give Neelam the final routes and request bodies.

At minimum, share:

- Buyer register route
- Buyer login route
- Buyer profile routes
- Cart routes
- Required headers
- Required body fields
- Example success responses
- Example error responses

Expected auth header:

```txt
Authorization: Bearer token_here
```

## Suggested Phase 2 API List

Buyer:

- `POST /api/buyer/register`
- `POST /api/buyer/login`
- `GET /api/buyer/profile`
- `PUT /api/buyer/profile`
- `DELETE /api/buyer/profile`

Cart:

- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart/:productId`
- `DELETE /api/cart/:productId`
- `DELETE /api/cart`

Products:

- Reuse existing product list API for buyer shop page.

## Testing Checklist For Vikram

Test with Postman, Thunder Client, or curl:

- Buyer can register.
- Same email cannot register twice.
- Buyer password is hashed in database.
- Buyer can login.
- Wrong password fails.
- Buyer profile works only with token.
- Buyer profile does not return password.
- Buyer profile update works.
- Buyer account delete works only if included in Phase 2.

## Testing Checklist For Jeet

Test with Postman, Thunder Client, or curl:

- Cart cannot be used without buyer token.
- Empty cart returns successfully.
- Product can be added to cart.
- Same product increases quantity.
- Quantity can be changed.
- Item can be removed.
- Cart can be cleared.
- Invalid product ID gives a useful error.
- Cart belongs only to logged-in buyer.

## Conflict Avoidance Rules

Use these ownership boundaries:

Vikram owns:

- `models/Buyer.js`
- `controllers/buyerController.js`
- `routes/buyerRoutes.js`
- `middleware/buyerAuthMiddleware.js`

Jeet owns:

- `models/Cart.js`
- `controllers/cartController.js`
- `routes/cartRoutes.js`

Shared files:

- `server.js`
- `package.json`
- `package-lock.json`

Rules for shared files:

1. Tell the team before editing shared files.
2. Make the smallest possible change.
3. Pull latest code before editing.
4. Do not format the whole file.
5. After editing, tell the other backend developer.

## What Not To Build In Phase 2

Do not build:

- Order model
- Order routes
- Payment routes
- Razorpay or Stripe integration
- Invoice logic
- Admin order dashboard
- Buyer order history

These are Phase 3.

## Pull Request Checklist

Before pushing:

1. Run `npm start` and confirm server starts.
2. Test your own APIs.
3. Test that admin/product APIs still work.
4. Check there are no conflict markers.
5. Write a short PR note with routes added.
6. Mention which frontend work is waiting on your API.
