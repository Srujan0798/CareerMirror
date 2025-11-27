# Supabase "Zero to Hero" Setup Guide

You are absolutely right. I skipped the critical step of actually creating the infrastructure. You cannot run the SQL schema if you don't have a database.

Here is the step-by-step guide to setting up the Supabase project from scratch so you can reach the "Final Stage".

## Phase 1: Create the Project

1.  **Go to Supabase**: Navigate to [https://supabase.com](https://supabase.com) and click **"Start your project"**.
2.  **Login/Sign Up**: You will need to sign in with GitHub.
    *   *Why GitHub?* Supabase uses GitHub for their own authentication. This is unavoidable.
3.  **Create New Project**:
    *   Click **"New Project"**.
    *   Select your Organization (if asked).
    *   **Name**: `CareerMirror` (or any name you like).
    *   **Database Password**: Generate a strong password and **SAVE IT** (e.g., in a password manager). You might need it later for direct DB access, though not for this app immediately.
    *   **Region**: Choose a region close to you (e.g., "US East (N. Virginia)").
    *   Click **"Create new project"**.
4.  **Wait**: It will take about 1-2 minutes for the database to provision.

## Phase 2: Get Your Credentials

Once the project is "Active" (green dot):

1.  Go to **Project Settings** (the gear icon ⚙️ at the bottom of the left sidebar).
2.  Click on **API**.
3.  Look for the **Project URL** and **Project API keys**.
4.  **Copy these values** into your local `.env` file in the `CareerMirror` folder:

    ```env
    VITE_SUPABASE_URL=https://your-project-id.supabase.co
    VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```

## Phase 3: Run the Database Schema

Now that the database exists, you can apply the structure I wrote.

1.  In the Supabase Dashboard, click on the **SQL Editor** icon (looks like a terminal `>_` on the left sidebar).
2.  Click **"New Query"**.
3.  **Paste** the entire content of the `backend/supabase_schema.sql` file from your project into the query window.
4.  Click **"Run"** (bottom right of the editor).
    *   *Success Message*: You should see "Success. No rows returned."
5.  **Verify**: Click on the **Table Editor** icon (looks like a grid/table) on the left. You should now see `profiles`, `resumes`, and `analytics` tables.

## Phase 4: Configure Authentication

My code uses **Email/Password** login.

1.  In the Supabase Dashboard, click on the **Authentication** icon (looks like a Users group) on the left.
2.  Click on **Providers** (under Configuration).
3.  Ensure **Email** is **Enabled**.
4.  (Optional) Disable "Confirm email" if you want to test faster without verifying emails:
    *   Go to **Authentication** -> **URL Configuration** (or **Providers** -> **Email** settings depending on UI version).
    *   Uncheck "Confirm email".
    *   *Note: For a real production app, keep this checked.*

## Phase 5: Run the App

Now your local app can talk to the real cloud backend.

1.  Restart your terminal/server:
    ```bash
    npm run dev
    ```
2.  The app will detect the keys in `.env` and switch to "Real Backend" mode automatically.

---

### Fallback (Mock Mode)
If you get stuck or want to see the UI *right now* without doing any of this:
Simply **delete or rename** the `.env` file. The app is smart enough to detect missing keys and will fall back to the "Mock Backend" (browser storage) so you can still test the interface.
