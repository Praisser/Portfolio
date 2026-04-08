# Portfolio-Wasif

This project is a static portfolio site built with Vite.

## Authorship

This portfolio was originally designed and built by Mohammed Wasif Ahmed.

If this repository is reused, forked, or adapted, the original authorship of the base project remains Mohammed Wasif Ahmed.

## Run locally

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
```

The production files are generated in `dist/`.

## Deploy on GitHub Pages

This repository includes a GitHub Actions workflow that deploys the site automatically whenever you push to `main`.

### One-time setup

1. Push this repository to GitHub.
2. Open your GitHub repository.
3. Go to `Settings` -> `Pages`.
4. Under `Source`, choose `GitHub Actions`.

### Deploy

```bash
git add .
git commit -m "Set up deployment"
git push origin main
```

After the push finishes, GitHub will build the site and publish it.

## Alternative: Netlify or Vercel

Because this project builds to static files, you can also deploy it on Netlify or Vercel.

- Build command: `npm run build`
- Output directory: `dist`
