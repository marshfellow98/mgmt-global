# Deploy — five minutes

Everything in this folder belongs at the **root of the repo**. `package.json`
must be the first thing Render sees. No wrapper folder.

## 1. GitHub

Create a new **private** repo called `mgmtglobal`. Do **not** tick
"Add a README" — there's one here already.

Then, in this folder:

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/mgmtglobal.git
git push -u origin main
```

Check on github.com that `package.json` is visible on the front page of the
repo. If it's inside a folder instead, Render won't find it.

## 2. Render

**New → Blueprint** (not Web Service, not Static Site).

Pick the `mgmtglobal` repo. Render reads `render.yaml` and fills in every
setting itself — service type, build command, start command, plan. Click
Apply.

First build takes 2–4 minutes.

## If you'd rather set it up by hand

**New → Web Service.** Not Static Site — this app renders server-side and a
static site will fail.

| Field | Value |
|---|---|
| Root Directory | *(leave empty)* |
| Runtime | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Instance Type | Starter ($7/mo) |

Skip the Free tier. Free web services sleep after 15 minutes idle and take
30–60 seconds to wake — an executive clicking through from LinkedIn on a
quiet afternoon would stare at nothing for most of a minute.

## 3. Environment variables (later)

Render dashboard → your service → Environment:

```
RECRUITERFLOW_API_KEY=…
BUTTONDOWN_API_KEY=…
```

Neither is needed to deploy. Without the Recruiterflow key the careers page
shows an empty board instead of failing.

## Common failures

**"Could not find package.json"** — the files are nested in a folder. Either
move them to the repo root, or set Root Directory to that folder's name.

**Build fails on a static site** — you picked Static Site. Delete it and
create a Web Service, or use the Blueprint.

**Site loads then hangs on later visits** — Free tier cold start. Upgrade to
Starter.
