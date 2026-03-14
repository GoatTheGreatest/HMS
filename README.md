# Healthcare Service Platform (HMS)

Production-quality platform connecting Patients with Doctors, Nurses, and Pharmaceutical professionals.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Styling**: TailwindCSS
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT (jose for Edge middleware, jsonwebtoken for API routes)
- **Security**: bcryptjs for passwords, encrypted JSON strings for medical data.

## Prerequisites
- Node.js (>= 18)
- MongoDB Connection URI (Local or Atlas)

## Setup Instructions

1. **Install Dependencies**
   Run the following inside `hms-app`:
   ```bash
   npm install mongoose bcryptjs jsonwebtoken jose
   ```
   *(Note: Ensure Next.js, React, and Tailwind are installed if this project was fully scaffolded, otherwise run `npm install`)*

2. **Environment Variables**
   Create a `.env.local` file in the root of the project with the following keys:
   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/hms
   JWT_SECRET=your_super_secret_jwt_key
   ```

3. **Database Initialization**
   The application uses Mongoose to automatically create collections based on the models in `src/models/*.js` when connected. No manual DDL is required.

4. **Run the Application**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Implemented Features
- [x] **Project Skeleton**: Using Next.js App Router format under `src/app`.
- [x] **Mongoose Schemas**: Models for `User`, `PatientProfile`, `ProfessionalProfile`, `Appointment`, `Message`, and `Document` with separated fields for RBAC and Data Encryption contexts.
- [x] **Auth Flow**: API routes for login/registration (`/api/auth/*`), edge middleware (`src/middleware.js`) checking cookies, and securely hashing passwords before saving to MongoDB.
- [x] **Role Redirects**: Middleware successfully routes patients, doctors, nurses, and pharmaceuticals to their specific dashboards securely based on the JWT payload.
- [x] **Key Application Pages**: Minimalistic, responsive, mobile-first Tailwind CSS UI for Authentication pages and Dashboard skeletons.

## Mongodb Connection
- mongodb://127.0.0.1:27017/hms

## Theming System
The application features a role-based theming system powered by **TailwindCSS 4** and **CSS Variables**.

### How it Works
1.  **CSS Variables**: Defined in `/src/styles/themes.css`. Each role has a specific set of variables (e.g., `--primary`, `--sidebar-gradient-from`).
2.  **Runtime Swapping**: The `ThemeProvider` component (in `/src/components/ThemeProvider.js`) sets the `data-role` attribute on the `<html>` element based on the user's role.
3.  **Tailwind Integration**: `globals.css` maps these CSS variables to Tailwind tokens using the new `@theme` API.

### Role Palettes
- **Admin**: Reddish accents.
- **Doctor**: Greenish/Blueish accents.
- **Pharmaceutical**: Violet accents.
- **Patient**: Teal/Blueish accents (Default).
- **Nurse**: Pink/Rose accents.

### Components
- **Sidebar**: Uses dynamic gradients derived from `from-sidebar-from` to `to-sidebar-to`.
- **StatCard**: Borders and shadows adapt to the primary theme color.
- **Charts**: Use `var(--primary)` for the first data series to maintain consistency.

### Development Helper
In development mode (`NODE_ENV === 'development'`), a floating role switcher appears at the bottom-right of the screen to allow quick testing of different themes without re-authenticating.

### Copyright (c)

Copyright (c) 2026 Abdul Raheem (aka "Goat the Greatest") and Shujat Ali Shah.

This repository and all code in it are the property of the authors. Permission to use, copy, modify, or distribute this code is granted only if proper credit is given to Abdul Raheem (Goat the Greatest) and Shujat Ali Shah. All other rights reserved.
