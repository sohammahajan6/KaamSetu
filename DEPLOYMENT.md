# Deployment Guide

This document outlines the free-tier deployment strategy for the KaamSetu platform.

## Architecture

*   **Database:** Supabase (PostgreSQL). Generous free tier, built-in connection pooling.
*   **Backend:** Koyeb or Render. Free tiers allow Docker container deployments (Spring Boot 21).
*   **Frontend:** Vercel or Cloudflare Pages. 100% free for static sites and React apps.
*   **Email:** Brevo (formerly Sendinblue). 300 free emails per day via SMTP.

## Step 1: Database (Supabase)

1.  Create a project on [Supabase](https://supabase.com).
2.  Go to Settings -> Database.
3.  Copy the connection string (JDBC format).
4.  You don't need to manually create tables. The backend uses Flyway to automatically run all migrations on startup.

## Step 2: Backend (Koyeb or Render)

We have provided a `Dockerfile` in the `/backend` folder.

1.  Push your code to a GitHub repository.
2.  Sign up for [Koyeb](https://www.koyeb.com/) or [Render](https://render.com/).
3.  Create a new Web Service and connect your GitHub repository.
4.  Choose the `/backend` directory as the root.
5.  Select **Docker** as the build method (it will detect the `Dockerfile`).
6.  Set the following **Environment Variables**:
    *   `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<SUPABASE_HOST>:6543/postgres`
    *   `SPRING_DATASOURCE_USERNAME`: `postgres`
    *   `SPRING_DATASOURCE_PASSWORD`: `<YOUR_DB_PASSWORD>`
    *   `JWT_SECRET`: Generate a random 64+ character string.
    *   `SPRING_MAIL_HOST`: `smtp-relay.brevo.com`
    *   `SPRING_MAIL_PORT`: `587`
    *   `SPRING_MAIL_USERNAME`: `<YOUR_BREVO_EMAIL>`
    *   `SPRING_MAIL_PASSWORD`: `<YOUR_BREVO_SMTP_KEY>`

## Step 3: Frontend (Vercel)

We have provided a `vercel.json` file to handle React Router client-side routing.

1.  Sign up for [Vercel](https://vercel.com).
2.  Import your GitHub repository.
3.  Set the Framework Preset to **Vite**.
4.  Set the **Root Directory** to `frontend`.
5.  Add the following **Environment Variable**:
    *   `VITE_API_BASE_URL`: `https://<YOUR_BACKEND_APP_URL>.koyeb.app` (The URL generated in Step 2).
6.  Click Deploy.

## Future Upgrades (Free tech stack)

If you need a message broker (like Kafka) but want to remain 100% free:
Instead of heavy Kafka, we recommend using **RabbitMQ** (free instances available via CloudAMQP) or **Redis Pub/Sub** (free tier on Upstash). However, our current Spring Modulith Transactional Outbox pattern leverages the existing PostgreSQL database to guarantee event delivery without any additional infrastructure!
