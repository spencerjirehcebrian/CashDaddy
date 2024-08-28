# Cash Daddy - A Digital Wallet Microservice Architecture

![logo](https://i.postimg.cc/2ykYv6xN/cashdaddylogo.png)

Cash Daddy is a microservices-based financial platform built with Node.js, Express, and TypeScript. It provides a comprehensive suite of services for user management, KYC (Know Your Customer) processes, wallet operations, payment handling, and notifications.

## Table of Contents

- [Architecture](#architecture)
- [Microservices](#microservices)
- [Technologies](#technologies)
- [API Documentation](#api-documentation)
- [Setup and Installation](#setup-and-installation)
- [Running the Project](#running-the-project)
- [Stripe Integration](#stripe-integration)
- [Thank You](#thank-you)

## Architecture

Cash Daddy follows a microservices architecture, with each service responsible for a specific domain of functionality. The services communicate with each other using Apache Kafka for event-driven interactions. Redis is used for caching to improve performance and reduce database load.

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  User Auth      │   │  Notification   │   │  Wallet         │
│  Microservice   │   │  Microservice   │   │  Microservice   │
└─────────┬───────┘   └─────────┬───────┘   └─────────┬───────┘
          │                     │                     │
          │                     │                     │
          │     ┌───────────────┴───────────────┐     │
          │     │                               │     │
          ├─────┤          Kafka Bus            ├─────┤
          │     │                               │     │
          │     └───────────────┬───────────────┘     │
          │                     │                     │
┌─────────┴───────┐   ┌─────────┴───────┐   ┌─────────┴───────┐
│  Payment        │   │  KYC            │   │  Database       │
│  Microservice   │   │  Microservice   │   │  (MongoDB)      │
└─────────────────┘   └─────────────────┘   └─────────────────┘
          │                     │
          │                     │
┌─────────┴───────┐   ┌─────────┴───────┐
│  Redis Cache    │   │  MinIO          │
│                 │   │  (Document      │
│                 │   │   Storage)      │
└─────────────────┘   └─────────────────┘
```

## Microservices

1. **User Auth Service**: Handles user registration, authentication, and profile management.
2. **KYC Service**: Manages the Know Your Customer process, including document upload and verification.
3. **Wallet Service**: Manages user wallets, including balance checks, deposits, withdrawals, and transfers.
4. **Payment Service**: Handles payment methods, payment intents, and QR code generation for transactions.
5. **Notification Service**: Manages sending notifications to users via email, SMS, or push notifications.

## Technologies

- Node.js
- Express.js
- TypeScript
- MongoDB (assumed as the primary database)
- Redis (for caching)
- Apache Kafka (for inter-service communication)
- Stripe (for payment processing)
- Nodemailer (for sending email notifications)
- MailHog (for testing email notifications in development)
- MinIO (for storing KYC document data locally)
- Notification service (for managing and sending various types of notifications)
- JWT for Authentication and Authorization

## API Documentation

### User Auth Service

#### Register

- **POST** `/users/register`
- Create a new user account

#### Login

- **POST** `/users/login`
- Authenticate a user and receive a JWT token

#### Logout

- **POST** `/users/logout`
- Log out the current user

#### Get Own User

- **GET** `/users/me`
- Retrieve the current user's information

#### Update Own User

- **PUT** `/users/me`
- Update the current user's information

#### Get All Users (Admin)

- **GET** `/users/all`
- Retrieve information for all users (admin only)

#### Get User (Admin)

- **GET** `/users/:userId`
- Retrieve information for a specific user (admin only)

#### Update User (Admin)

- **PUT** `/users/:userId`
- Update information for a specific user (admin only)

#### Deactivate User (Admin)

- **POST** `/users/:userId/deactivate`
- Deactivate a user account (admin only)

#### Reactivate User (Admin)

- **POST** `/users/:userId/reactivate`
- Reactivate a deactivated user account (admin only)

#### Promote User (Super Admin)

- **POST** `/users/:userId/promote`
- Promote a user to admin status (super admin only)

### KYC Service

#### Upload KYC Document

- **POST** `/kyc`
- Upload KYC documents for verification

#### Get Own KYC

- **GET** `/kyc/me`
- Retrieve the current user's KYC information

#### Get KYC Status (Admin)

- **GET** `/kyc/:userId`
- Check the KYC status of a specific user (admin only)

#### Approve User KYC (Admin)

- **POST** `/kyc/:userId/approve`
- Approve a user's KYC submission (admin only)

#### Reject User KYC (Admin)

- **POST** `/kyc/:userId/reject`
- Reject a user's KYC submission with a reason (admin only)

### Wallet Service

#### Create Wallet

- **POST** `/wallet`
- Create a new wallet for the user

#### Get Wallet Balance

- **GET** `/wallet/balance`
- Check the current balance of the user's wallet

#### Deposit

- **POST** `/wallet/deposit`
- Add funds to the user's wallet

#### Withdraw

- **POST** `/wallet/withdraw`
- Withdraw funds from the user's wallet

#### Transfer

- **POST** `/wallet/transfer`
- Transfer funds to another user's wallet

#### Get Transaction History

- **GET** `/wallet/transactions`
- Retrieve the transaction history for the user's wallet

### Payment Service

#### Create Payment Method

- **POST** `/payment/payment-methods`
- Add a new payment method for the user

#### Get Payment Methods

- **GET** `/payment/payment-methods`
- Retrieve all payment methods for the user

#### Delete Payment Method

- **DELETE** `/payment/payment-methods/:paymentMethodId`
- Remove a specific payment method

#### Create Payment Intent

- **POST** `/payment/create-payment-intent`
- Create a new payment intent for a transaction

#### Confirm Payment Intent

- **POST** `/payment/confirm-payment-intent`
- Confirm a previously created payment intent

#### Generate QR

- **POST** `/payment/generate-qr`
- Generate a QR code for a payment

### Notification Service

#### Create Notification

- **POST** `/notifications`
- Create a new notification to be sent to a user

#### Get User Notifications

- **GET** `/notifications/user/:userId`
- Retrieve all notifications for a specific user

#### Mark Notification as Read

- **PUT** `/notifications/:notificationId/read`
- Mark a specific notification as read

#### Delete Notification

- **DELETE** `/notifications/:notificationId`
- Delete a specific notification

#### Get Notification Preferences

- **GET** `/notifications/preferences`
- Retrieve the current user's notification preferences

#### Update Notification Preferences

- **PUT** `/notifications/preferences`
- Update the current user's notification preferences

## Setup and Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/cash-daddy.git
   cd cash-daddy
   ```

2. Install dependencies for each microservice:

   ```
   cd user-auth-service && npm install
   cd ../kyc-service && npm install
   cd ../wallet-service && npm install
   cd ../payment-service && npm install
   cd ../notification-service && npm install
   ```

3. Set up environment variables:
   Create a `.env` file in each microservice directory with the following variables:

   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/cash-daddy
   REDIS_URL=redis://localhost:6379
   KAFKA_BROKERS=localhost:9092
   STRIPE_SECRET_KEY=your_stripe_secret_key
   SMTP_HOST=localhost
   SMTP_PORT=1025
   MINIO_ENDPOINT=localhost
   MINIO_PORT=9000
   MINIO_ACCESS_KEY=your_minio_access_key
   MINIO_SECRET_KEY=your_minio_secret_key
   MINIO_BUCKET_NAME=cash-daddy-kyc
   ```

4. Set up MongoDB, Redis, and Kafka on your local machine or use cloud services.

5. Install and set up MailHog for email testing:

   - Follow the installation instructions for your operating system: [MailHog Installation](https://github.com/mailhog/MailHog)
   - Run MailHog on your local machine

6. Install and set up MinIO for local document storage:

   - Download and install MinIO: [MinIO Quickstart Guide](https://docs.min.io/docs/minio-quickstart-guide.html)
   - Create a bucket named `cash-daddy-kyc` for storing KYC documents

7. Set up the Notification Service:
   - Install required dependencies for the notification service
   - Configure any additional notification providers (e.g., SMS gateway, push notification service) in the `.env` file

## Running the Project

To run the Cash Daddy project, follow these steps:

1. Navigate to the main project directory:

   ```
   cd cash-daddy
   ```

2. Start the required services using Docker Compose:

   ```
   docker-compose up -d
   ```

   This command will start all the necessary services defined in your `docker-compose.yml` file, such as MongoDB, Redis, Kafka, MinIO, and MailHog.

3. Make the startup script executable:

   ```
   chmod +x run.sh
   ```

   This command gives execute permissions to the `run.sh` script.

4. Run the startup script:

   ```
   ./run.sh
   ```

   This script will start all the microservices in the correct order.

5. The services will be available at:

   - User Auth Service: `http://localhost:3000`
   - KYC Service: `http://localhost:3001`
   - Wallet Service: `http://localhost:3002`
   - Payment Service: `http://localhost:3003`
   - Notification Service: `http://localhost:3004`

6. Access MailHog web interface for email testing:

   - Open `http://localhost:8025` in your web browser

7. Access MinIO web interface for document storage management:
   - Open `http://localhost:9001` in your web browser
   - Log in using the MINIO_ACCESS_KEY and MINIO_SECRET_KEY you set in the environment variables

To stop the project:

1. Press `Ctrl+C` in the terminal where you ran the `run.sh` script to stop the microservices.

2. Stop the Docker Compose services:
   ```
   docker-compose down
   ```
   This will stop and remove the containers created by Docker Compose.

Note: Make sure you have Docker and Docker Compose installed on your system before running these commands.

## Stripe Integration

Cash Daddy uses Stripe as its payment gateway to handle secure transactions. The integration allows for:

1. Creating and managing payment methods
2. Processing deposits and withdrawals
3. Handling payment intents for secure transactions
4. Managing recurring payments and subscriptions (if applicable)

To set up Stripe:

1. Sign up for a Stripe account at https://stripe.com
2. Obtain your Stripe API keys (Publishable Key and Secret Key)
3. Add your Stripe Secret Key to the `.env` file of the Payment Service:
   ```
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```
4. Use the Stripe Publishable Key in your frontend application for creating payment methods and handling client-side Stripe Elements

For development and testing, use Stripe's test mode and test card numbers to simulate transactions without processing real payments.

## Thank You

Thank you to Stratpoint Technologies for their support and guidance in developing this project.
