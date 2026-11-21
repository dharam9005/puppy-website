# TeddyPups U.A.E. website snapshot

This repository contains a static snapshot of the TeddyPups U.A.E. website. It
is not the original Next.js source project; some pages and assets are served
from the live website when they are not present in the snapshot.

## Run locally

```sh
python3 serve.py
```

Then open <http://127.0.0.1:4173/>.

The local server needs an internet connection to proxy missing pages and
Next.js assets from `https://puppy.instabizweb.com`.

## Deploy to Cloudflare Workers

Install dependencies and run the local Worker preview:

```sh
npm install
npm run dev
```

Wrangler requires Node.js 22.12 or newer.

After authenticating Wrangler with your Cloudflare account, deploy it with:

```sh
npm run deploy
```

The Worker serves the captured homepage and bundled assets, and forwards
uncaptured pages and assets to the original website. The deployment therefore
continues to depend on `https://puppy.instabizweb.com`.
