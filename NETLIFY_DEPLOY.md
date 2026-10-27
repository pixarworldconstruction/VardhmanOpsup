# Vardhman Opsup - Netlify Deployment Guide via GitHub

Follow these steps to host and publish **Vardhman Opsup** on Netlify with continuous deployment via GitHub.

---

## 1. Verify Configuration (Already Configured)
The repository is pre-configured with:
- `netlify.toml`: Defines build command (`npm run build`), publish directory (`dist`), Node 20 runtime, and SPA rewrite rules.
- `public/_redirects`: Guarantees seamless client-side page refreshes without 404 errors.

---

## 2. Push Code to GitHub

If you haven't pushed your repository to GitHub yet:

1. Open your terminal in the project directory.
2. Initialize and commit your changes:
   ```bash
   git add .
   git commit -m "Configure Vardhman Opsup for Netlify deployment"
   ```
3. Create a new repository on [GitHub](https://github.com/new) (e.g., `vardhman-opsup`).
4. Link and push to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/vardhman-opsup.git
   git branch -M main
   git push -u origin main
   ```

---

## 3. Connect Repository to Netlify

1. Log in to [Netlify](https://app.netlify.com/).
2. Click **"Add new site"** -> **"Import an existing project"**.
3. Select **GitHub** and authorize access to your repository `vardhman-opsup`.
4. Netlify will automatically detect the settings from `netlify.toml`:
   - **Branch to deploy**: `main`
   - **Base directory**: *(leave blank / root)*
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. *(Optional)* If you want to customize your Firebase Realtime Database URL via environment variable:
   - Go to **Site Configuration** -> **Environment Variables**.
   - Add `VITE_FIREBASE_DATABASE_URL` = `https://vardhman-opsup-default-rtdb.firebaseio.com` (or your preferred URL).
6. Click **"Deploy Vardhman Opsup"**.

---

## 4. Continuous Deployment
- Any future `git push` to your `main` branch will automatically trigger a new Netlify production build.
- You can assign a custom domain (e.g. `opsup.vardhmangroup.com` or `vardhmanopsup.com`) under **Site configuration > Domain management**.

---

## 5. Firebase Realtime Database Rules
In the [Firebase Console](https://console.firebase.google.com/project/vardhman-opsup/database):
1. Navigate to **Build** -> **Realtime Database** -> **Rules**.
2. Ensure read and write access are permitted:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
3. Click **Publish**.
