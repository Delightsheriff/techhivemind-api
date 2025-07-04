# TechHiveMind API

This is the backend API for the TechHiveMind e-commerce platform.

## Installation and Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/techhivemind-api.git
   cd techhivemind-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy the `.env.example` file to a new file named `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and fill in the required environment variables (e.g., database connection string, API keys).

4. **Run the application:**
   - For development with automatic reloading:
     ```bash
     npm run dev
     ```
   - For production:
     ```bash
     npm start
     ```
     (Alternatively, you might want to build first with `npm run build` and then `npm run serve`)

## API Endpoints

The API provides the following main resources:

- **Auth:** Handles user authentication (signup, signin, email verification, token refresh).
  - `POST /auth/signup`
  - `POST /auth/signin`
  - `POST /auth/verify-email`
  - `POST /auth/resend-otp`
  - `GET /auth/refresh-token`
  - `GET /auth/me`
- **Users:** Manages user profiles and actions.
  - `PATCH /users/me` (Update user profile)
  - `PATCH /users/me/profile-picture` (Update profile picture)
  - `POST /users/me/become-vendor`
- **Products:** Manages product listings.
  - `POST /products` (Create new product - vendor only)
  - `GET /products` (Get all products - paginated, filterable)
  - `GET /products/my-products` (Get products for the logged-in vendor)
  - `GET /products/search` (Search products)
  - `GET /products/:id` (Get a single product)
  - `PATCH /products/:id` (Edit a product - vendor only)
- **Cart:** Manages user shopping carts.
  - `GET /cart`
  - `POST /cart/add`
  - `PATCH /cart/update/:itemId`
  - `DELETE /cart/remove/:itemId`
  - `DELETE /cart/clear`
- **Wishlist:** Manages user wishlists.
  - `GET /wishlist`
  - `POST /wishlist/add`
  - `DELETE /wishlist/remove/:productId`
- **Orders:** Manages user orders.
  - `POST /orders` (Create a new order)
  - `GET /orders` (Get all orders for the logged-in user)
  - `GET /orders/:id` (Get a specific order)
  - `PATCH /orders/:id/cancel` (Cancel an order)
  - `DELETE /orders/:id` (Delete an order - admin/vendor)
- **Payment:** Handles payment processing.
  - `POST /payment/initialize`
  - `GET /payment/verify`

*Note: Some endpoints require authentication and/or specific user roles (e.g., vendor, admin).*

## Technologies Used

- **Backend Framework:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT)
- **Caching:** Redis
- **File Uploads:** Multer, Cloudinary
- **Email Service:** Nodemailer
- **Validation:** Joi
- **Rate Limiting:** `express-rate-limit`
- **Security:** Helmet, HPP, express-mongo-sanitize
- **Logging:** Winston
- **Development:** TypeScript, Nodemon

## Contributing

Contributions are welcome! If you'd like to contribute to the TechHiveMind API, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature-name`).
6. Open a Pull Request.

Please make sure to update tests as appropriate.
