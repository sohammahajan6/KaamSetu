# KaamSetu — Home Services Marketplace

KaamSetu is a hyperlocal home services platform that connects customers with verified local professionals (electricians, plumbers, cleaners, and more). It provides a seamless, end-to-end booking experience with real-time updates, secure payments, and in-app chat.

## Features

*   **Role-Based Access:** Dedicated dashboards for Customers, Service Providers, and Administrators.
*   **Real-Time Live Chat:** Communicate directly with your assigned professional via WebSockets (STOMP).
*   **Web Push Notifications:** Native VAPID push notifications alert you instantly when a booking status changes.
*   **Payment Gateway:** Integrated with Razorpay for secure checkout.
*   **Admin Analytics:** Comprehensive dashboard with live CSV exports of system bookings and revenue.
*   **Location Services:** Autocomplete address search powered by OLA Maps API.

## Tech Stack

This platform was built with a modern, **100% Free** production tier in mind.

### Frontend
*   **React + Vite** (TypeScript)
*   **Tailwind CSS + shadcn/ui** for styling
*   **Zustand** for state management
*   **React Query** for server state
*   **React Router** for navigation
*   **SockJS + STOMP** for real-time WebSocket communication

### Backend
*   **Java 21 + Spring Boot 3**
*   **Spring Modulith** (Modular monolith architecture with Transactional Outbox)
*   **PostgreSQL** (Hosted via Supabase)
*   **Flyway** for database migrations
*   **Spring Security + JWT** for authentication
*   **web-push** for VAPID notification payload generation

## Local Development

### 1. Backend Setup
Navigate to the `backend` directory.

```bash
cd backend
```

Ensure your database is running, then start the Spring Boot application:

```bash
./mvnw spring-boot:run
```

*Note: The application uses Flyway, so all database tables will be created automatically on startup!*

### 2. Frontend Setup
Navigate to the `frontend` directory in a new terminal.

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Deployment

This app is containerized via Docker and can be deployed for free using Koyeb (Backend) and Vercel (Frontend). 

Please see **[DEPLOYMENT.md](./DEPLOYMENT.md)** for detailed, step-by-step instructions on setting up your environment variables and launching into production.
