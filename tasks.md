# Shopster Backend - Tasks

This file explains, in plain language, everything that needs to be built on the backend,
who is doing it, and the exact steps for each piece. There is no code here on purpose.
Follow the steps in order and check the "how to know it works" note at the end of each feature.

---

## Who does what, and why it is split this way

Two people are working on the backend at the same time, so the work is divided so that
they almost never edit the same file. When two people change the same file on different
branches, Git makes you untangle it by hand later (a "merge conflict"), and that wastes
a lot of time. This split avoids most of that.

**Vikram** works on the branch called `vikram`. He builds:

1. Product picture upload (Multer)
2. Categories

These two are given to the same person on purpose. Both of them change the same three
product files (the product database model, the product controller, and the product
routes). If one person did uploads and another did categories, they would collide on
those files constantly. Keeping both with Vikram avoids that.

**Jeet** works on the branch called `jeet`. He builds:

3. Customers
4. Reports
5. Settings

Almost everything Jeet builds is brand new files that nobody else touches, so he can
work without waiting for Vikram.

**Neelam** does all of the frontend, in the other repository. Her steps are in that
repo's own `tasks.md`.

---

## The one file everyone has to share: `server.js`

`server.js` is the file that says "when a web request comes in for this address, hand it
to this part of the code." Every single feature needs to add a line here. If all three
features edit it on three branches, all three conflict.

So here is the rule:

- Vikram edits `server.js` **once**, early, in his very first pull request.
- In that one edit he adds **every** address line the whole project will ever need,
  including the ones for Jeet's customers, reports, and settings features.
- For the features that have no real code yet, Vikram also creates a tiny placeholder
  route file for each one. A placeholder is just an empty router that does nothing, and
  its only job is to let the app start without errors.
- After that first pull request is merged, **nobody touches `server.js` again.** Jeet
  just opens his placeholder files later and fills them with the real logic.

---

## Order of work

1. Vikram opens his first pull request. It contains the upload plumbing (steps 1 to 5 of
   Feature 1) plus the shared `server.js` edit and all the placeholder route files. This
   gets reviewed and merged before anything else.
2. Vikram and Jeet both start their real feature branches from that merged point, so they
   both already have the placeholders and the wiring.
3. Vikram: finish the upload feature, then do categories.
4. Jeet: do customers, then reports, then settings, filling in his three placeholder
   files as he goes.

---

# VIKRAM'S WORK

## Feature 1: Let the admin upload a product picture

### What this is

Today, when an admin adds a product, they can only type a name, price, description, and
category. There is no way to attach a photo. We are adding that. The standard tool for
handling uploaded files in a Node app is called **Multer**, so that is what we use.

### The one thing to watch out for

Our backend runs on Render's free plan. On that plan, the server's disk is wiped clean
every time the app restarts or is redeployed, which happens often. So if we save uploaded
photos into a folder on the server, they will disappear within a day.

The fix: send the photos to a separate free image-hosting service called **Cloudinary**.
Cloudinary stores the image permanently and hands us back a web link to it, which is what
we save in our database. We will use a plain local folder while developing on our own
laptops (no account needed, simpler), and Cloudinary once the app is live on Render.

### Steps

1. **Install the packages.** You need three: `multer` (handles the upload itself),
   `cloudinary` (talks to the Cloudinary service), and `multer-storage-cloudinary`
   (glue between the two).

2. **Make a Cloudinary account.** The free tier is plenty. Once signed up, Cloudinary
   gives you three secret values: a cloud name, an API key, and an API secret.
   - Add placeholder entries for all three to the `.env.example` file so the rest of the
     team knows these are required.
   - Put the real values into your own local `.env` file, and into Render's "Environment"
     settings page in the dashboard.

3. **Make a small Cloudinary config file.** Put it with the other config files. Its only
   job is to load those three secret values and get the Cloudinary library ready. Every
   other file that needs Cloudinary will import this one, so the setup lives in one place.

4. **Make the upload handler file.** Put it with the other middleware files. This is the
   piece that sits between an incoming request and your product code, grabs the attached
   file, and processes it. Inside it you set a few rules:
   - Accept only real image types: JPG, PNG, and WEBP. If someone attaches a PDF, a Word
     doc, or a video, reject it with a clear message.
   - Set a maximum file size, for example 2 megabytes, so nobody uploads a 40 MB photo.
   - Choose the destination based on the environment: the local `uploads` folder when
     running in development, Cloudinary when running in production.
   - Expose one ready-to-use handler that expects a single file sent under the field
     name `image`.

5. **Edit `server.js`** (this is part of Vikram's first shared pull request):
   - Tell the app to serve the local `uploads` folder as public files, so that during
     development you can actually open a saved image in a browser at an address like
     `localhost:3000/uploads/somefile.jpg`.
   - Add an error handler at the very end of the file that catches upload problems (wrong
     file type, file too big) and turns them into a clean "400 Bad Request" response with
     a readable message, instead of letting the app crash.
   - Add `uploads/` to the `.gitignore` file so test images never get committed. Keep one
     empty placeholder file inside the folder so the folder still exists after someone
     clones the repo fresh.

6. **Update the product database model.** This is the file that describes what a product
   looks like. Add two new fields, both of which just hold text:
   - `image` - the web link to the picture.
   - `imagePublicId` - an identifier that Cloudinary needs later if we want to delete or
     replace that picture.

7. **Update the product controller** (the file with the add, update, and delete logic):
   - When **adding** a product: check whether a file came in with the request. If it did,
     take the link and the identifier that the upload handler gives back, and save both
     onto the new product.
   - When **updating** a product: if a new file came in, first tell Cloudinary to delete
     the old picture using the stored identifier, then save the new link and identifier.
     If no new file came in, leave the existing picture exactly as it is.
   - When **deleting** a product: also tell Cloudinary to delete its picture, so we are
     not paying to store images for products that no longer exist.
   - Note: the normal text fields (name, price, and so on) still arrive as usual even
     when a file is attached, so the existing validation keeps working with no changes.

8. **Update the product routes file** so that the "add product" and "update product"
   routes run the upload handler before they run the controller. The order on each route
   is: check the admin is logged in, then run the upload handler, then run the add or
   update logic.

9. **Test it from end to end:**
   - Use Postman or a curl command to send a new product with a real image file attached
     and your admin login token.
   - Look at the response. It should contain an `image` link. Paste that link into a
     browser and confirm the picture loads.
   - Try attaching a very large file, and then a non-image file. Both should come back as
     a clean error, not a crash.
   - Add a case for image upload to the `scripts/smoke-test.mjs` script so this stays
     covered in future.

---

## Feature 2: Real categories the admin can manage

### What this is

Right now a product's category can only be one of three words baked into the code:
Electronics, Fashion, or Books. If the shop wants to add "Home & Kitchen", a developer
has to change the code and redeploy. We are making categories their own thing in the
database, so the admin can add, rename, hide, and remove them from the admin panel with
no developer involved.

### Steps

1. **Make a new category database model.** A category needs:
   - a name, which is required, and no two categories may have the same name;
   - a "slug", which is a URL-friendly version of the name (all lowercase, spaces turned
     into dashes), generated automatically from the name;
   - an optional description;
   - an optional picture, using the same upload approach as products;
   - an "active" on/off flag, so the admin can hide a category without deleting it;
   - the created and updated timestamps.

2. **Make the category controller** with the usual five actions:
   - **Get all categories.** For the public storefront, return only the active ones. If
     an admin is logged in and asks for everything, include the inactive ones too.
   - **Get one category** by its ID.
   - **Create a category.** Admin only. Check the name is not already taken. Generate the
     slug. Handle the optional picture.
   - **Update a category.** Admin only. If a new picture is sent, swap it the same way
     products do.
   - **Delete a category.** Admin only. First check whether any products still use this
     category. If some do, refuse and send back a message like "Cannot delete this
     category because 12 products are still using it." If none do, either delete it for
     real or just switch its active flag off, your choice.

3. **Make the category routes file.** Getting the list and getting one category are
   public, because the storefront needs them. Creating, updating, and deleting require an
   admin login. The line that connects these routes to the app was already added by
   Vikram in the first shared `server.js` edit, so here you are only filling in the
   placeholder file with the real logic.

4. **Switch products over to the new categories.** This part needs care because it
   changes data that already exists:
   - In the product model, change the category field from "one of three fixed words" to
     "a link to a category record" (it now stores the category's ID instead of its name).
   - In the product controller, whenever you fetch products, also pull in the linked
     category's name and slug, so the frontend still gets a readable name and not just an
     ID. When creating or updating a product, check that the given category ID actually
     points to a real category.
   - Write a one-time migration script. It should: create the three categories that
     currently exist only as words (Electronics, Fashion, Books); then go through every
     existing product and replace its category word with the matching new category ID.
     Run this script once against the real database after deploying.
   - Update the development seed script so it creates the categories first, then creates
     sample products that point at them.

5. **Test:**
   - Create, rename, and delete categories with Postman or curl.
   - Try deleting a category that has products in it and confirm you get the polite
     refusal instead of a broken database.
   - Fetch the product list and confirm each product now comes back with its category's
     name attached, not just an ID.

---

# JEET'S WORK

Everything Jeet builds connects through the placeholder route files that Vikram created
in his first pull request. Jeet opens those placeholders and fills them with real logic.
Jeet never edits `server.js` himself.

## Feature 3: A customers section in the admin panel

### What this is

The system already has "buyers": people who register on the shop side to place orders.
What is missing is any way for the admin to see who those people are. "Customers" is that
view: a list of everyone who has signed up, the ability to open one person and see their
details and order history, and the ability to block someone who is causing problems.

### Steps

1. **Add one field to the buyer model:** an "isBlocked" true/false flag that starts as
   false for everyone.

2. **Update the buyer login check** (the buyer authentication middleware). Add a check:
   if this buyer's isBlocked flag is on, stop the request with a "403 Forbidden" and a
   message saying the account is suspended. This is what actually makes blocking do
   something.

3. **Make the customer controller.** Every action here is admin only:
   - **Get all customers.** Return the list of buyers with their passwords removed.
     Support a search box that matches typed text against username or email, ignoring
     upper/lower case. Support paging (a page number and a page size) so the response is
     never thousands of rows at once. Sort newest first. Send back the rows plus the
     total count and the current page info, so the frontend can build "next / previous"
     buttons.
   - **Get one customer** by ID. Along with their profile, work out and include how many
     orders they have placed and how much money they have spent in total.
   - **Get one customer's orders.** Return that buyer's order history, newest first, with
     the product details filled in.
   - **Update a customer's status.** Takes the isBlocked flag and saves it. This is the
     block and unblock action.
   - **Delete a customer.**

4. **Make the customer routes file** by filling in Vikram's placeholder. Every route
   requires an admin login. You need: get the list, get one, get one's orders, update
   status, and delete.

5. **Test:** open the list, try the search, block a buyer and confirm that buyer can no
   longer log in or check out, then unblock them and confirm they can again.

---

## Feature 4: Reports and analytics

### What this is

The admin dashboard currently shows four numbers at the top: total products, total
orders, total customers, and total revenue. They are fake, typed directly into the page.
This feature makes them real, and adds a proper reports page with charts.

### Steps

1. **Make the report controller.** Every action here is admin only, and every one is a
   read-only calculation over data that already exists. Nothing here changes the database.
   - **Summary.** The four headline numbers: count of products, count of orders, count of
     customers, and total revenue (add up the order totals, counting only orders that
     reached Confirmed, Shipped, or Delivered, or that are marked as paid). Also work out
     the "change since last month" for each number by comparing this month's date range
     with last month's.
   - **Sales over time.** Given an optional start date, end date, and a "group by day or
     by month" choice, return a list of time buckets, each with its revenue and its order
     count. If nothing is specified, default to the last 30 days grouped by day. This
     feeds a line or bar chart on the frontend.
   - **Top products.** The best sellers. Go through every order's line items, add up the
     quantity sold and the money made for each product, sort from highest to lowest, and
     return the top five (or however many are asked for), with the product name attached.
   - **Orders by status.** A simple count of how many orders are currently Pending,
     Confirmed, Shipped, Delivered, and Cancelled. This feeds a pie chart.
   - **Top customers.** The same idea as top products, but grouped by buyer: who has
     spent the most money.

2. **Make the report routes file** by filling in Vikram's placeholder, connecting each of
   those actions to an address, all behind an admin login.

3. **Optional: a "download as CSV" endpoint** for the sales report, so the owner can open
   it in Excel. There is already a PDF library in the project (pdfkit, used for
   invoices) if you would rather produce a PDF; the invoice generator file shows how the
   file streaming works.

4. **Test:** run the seed script so there are sample orders in the database, call each
   endpoint, and check the totals by hand against what is actually in the database.

---

## Feature 5: A settings page

### What this is

There is a pile of stuff that is currently hard-coded and that the shop owner should be
able to change without calling a developer: the store name, the contact email, the tax
percentage, shipping fees, whether cash on delivery is allowed, and so on. This feature
is a single settings record in the database, plus a page to edit it.

### Steps

1. **Make the settings model.** This is a "singleton", which just means there is only
   ever one settings record in the whole database. Fields:
   - store name, store email, support phone, address;
   - a logo image, using the same upload approach as everything else;
   - currency (default it to INR);
   - tax percentage (default 0);
   - a flat shipping rate (default 0);
   - a free-shipping threshold: spend at least this much and shipping is free (default 0);
   - a cash-on-delivery on/off flag (default on);
   - a Stripe on/off flag (default on);
   - a maintenance-mode on/off flag (default off);
   - the created and updated timestamps.
   Also add a small helper that fetches the one settings record, or creates it with all
   the defaults if it does not exist yet. Everything else calls this helper, so no other
   code ever has to worry about whether settings exist.

2. **For the logo upload, do not edit Vikram's upload handler file.** Make your own
   separate copy next to it, set up to accept a field called `logo` and to file things
   under a "branding" folder. Keeping your own file means you never touch Vikram's, so
   there is nothing to conflict on.

3. **Make the settings controller:**
   - **Get settings.** Returns the one record. This one can be public, because it is just
     storefront configuration like the store name and the tax rate. Do not put any secret
     keys in this record.
   - **Update settings.** Admin only. Takes whatever fields were submitted, merges them
     into the one record, and handles a new logo the same way products handle a new
     picture.

4. **Make the settings routes file** by filling in Vikram's placeholder. Getting settings
   is public. Updating requires an admin login.

5. **Connect settings to the parts of the app that should respect them.** This means
   editing the order controller and the payment controller: instead of using hard-coded
   numbers for tax and shipping, read those numbers from the settings record. Also add a
   check near the start of request handling: if maintenance mode is on and the request is
   not from an admin, send back a "503 Service Unavailable", which effectively closes the
   shop to customers while the owner works on it.

6. **Test:** fetch settings on a fresh database and confirm you get the defaults. Change
   the tax percentage, save, fetch again, and confirm it stuck. Place a test order and
   confirm the tax charged on it matches the new percentage.

---

## The shared `server.js` edit, spelled out

In Vikram's first pull request, `server.js` gets one edit that adds every route
connection the whole project will ever need. That is the existing ones, plus four new
ones: categories, customers, reports, and settings. For each of the four new ones, also
create a placeholder route file: a file that makes an empty router and exports it, so the
app still starts. Later, each owner opens their placeholder and replaces its contents
with the real logic. Nobody edits `server.js` after this first pull request.

That same first pull request also contains, from Feature 1: the line that serves the
`uploads` folder as public files, and the upload error handler at the end of the file.

---

## Nice to have, for later (not blocking anyone)

- Add a "stock" or "quantity in inventory" field to products. That unlocks a "low stock"
  report.
- A shared paging helper, so every list endpoint does not reinvent paging.
- A "role" field on admin users, so there can be super-admins versus regular staff. Right
  now every admin can do everything.
- Rate limiting on the login routes, so nobody can sit there guessing passwords.
