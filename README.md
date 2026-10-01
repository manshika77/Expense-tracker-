# Expense Tracker — Netlify + Node.js

A full-stack Expense Tracker using HTML, CSS, JavaScript, Node.js, Express, Netlify Functions and Netlify Blobs.

## What changed

- Express backend is now deployed as a Netlify Function.
- Frontend still calls `/api/expenses`, so no hard-coded backend URL is needed.
- `netlify.toml` rewrites `/api/*` to the Express function.
- Expense data is stored in Netlify Blobs instead of a local JSON file, so it persists across deployments and function invocations.

Netlify documents Express deployment through Netlify Functions and the `/api/*` rewrite pattern. Netlify Blobs provides persistent site-wide storage accessible from Functions.

## Deploy

### Recommended: GitHub + Netlify

1. Create a GitHub repository.
2. Upload all files in this folder to the repository.
3. In Netlify, choose **Add new project → Import an existing project**.
4. Select your GitHub repository.
5. Publish directory: `public`
6. Functions directory is already configured in `netlify.toml`.
7. Deploy.

### Local testing

Install Node.js, then run:

npm install

Install Netlify CLI if needed:

npm install -g netlify-cli

Then:

netlify dev

Open the local URL shown by Netlify.

## Important

Do not deploy only the `public` folder. The project must include `netlify.toml`, `package.json`, and `netlify/functions/api.js`.

## Portfolio description

Expense Tracker is a responsive full-stack web application built with HTML, CSS, JavaScript, Node.js and Express.js. It uses a Netlify Function as the backend API and Netlify Blobs for persistent expense storage. Users can add, edit, delete and categorize expenses while viewing total and monthly spending.
