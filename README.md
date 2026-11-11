# Resume builder demo

A public, shared resume that demonstrates creating and reading work experiences with a native HTML form, an Express API on Netlify Functions, and MongoDB Atlas. Anyone who can access the site can read and add entries. Use fictional data only; there is no login, editing, deletion, or abuse protection.

## Prerequisites

- Node.js 22 or newer and npm.
- A MongoDB Atlas cluster, a database user with permission to read and write the intended database, and network access configured to permit connections from your development environment and Netlify Functions.
- A MongoDB connection string that includes the intended database name. See MongoDB's documentation for URL-encoding special characters in credentials.

## Run locally

1. Copy `.env.example` to `.env` (do not overwrite an existing file) and set `MONGODB_URI` to your Atlas connection string. Do not commit or share credentials.
2. Run `npm install` and then `npm run dev`. The dev script runs the latest Netlify CLI through `npx`; the first run may ask to install it. Netlify CLI loads variables from `.env` for local development. Open the local URL printed by the CLI.
3. Enter a fictional experience and submit it. The shared resume beneath the form will reload from MongoDB. Leave the end year blank for a current role.

## API

Both endpoints use JSON. The `resume_items` collection is chosen explicitly; no additional index is created.

- `GET /api/resume-items` returns the retrieved MongoDB documents as an array, including MongoDB-generated fields.
- `POST /api/resume-items` accepts `job_title`, `start_year`, optional `end_year`, `employer`, and `accomplishment`. Mongoose casts and validates values; years must be integers from 1900 to 2100. Required text fields are trimmed and limited to 100 characters for title and employer, and 1,000 for accomplishment. A valid item returns HTTP 201; invalid input returns HTTP 400.

Example request body:

```json
{
  "job_title": "Software Developer",
  "start_year": 2020,
  "end_year": 2023,
  "employer": "Example Company",
  "accomplishment": "Improved the onboarding process."
}
```

## Deploy on Netlify

Push the project to GitHub and connect the repository in the Netlify dashboard. The checked-in `netlify.toml` supplies the publish directory, function directory, and API rewrite; no build command is needed. In Netlify's environment-variable settings, configure `MONGODB_URI` for the relevant deployment contexts with a scope available to Functions, then deploy. A local `.env` file is not deployed. Use a dedicated least-privileged database user, and ensure Atlas network access permits Netlify's function infrastructure. After deployment, submit fictional data and reload the page to confirm that it persists. Consider appropriate abuse controls before using this public API for anything beyond a demo.

Automated tests are intentionally outside this demo's scope.
