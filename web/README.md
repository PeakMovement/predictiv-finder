# Predictiv Web — FROZEN, not production

**Do not deploy this Next.js app to predictiv.co.za.** The canonical public
site is the Vite SPA at the repo root (see `../ARCHITECTURE.md` and
`../README.md`). This folder is kept for reference only.

`/join` here is a contact page so local Next links do not 404. It is not a
self-serve signup.

## Local experiments only

```
cp .env.local.example .env.local   # fill in the anon key
npm install
npm run dev
```

`rating` / `review_count` are cached columns. Google Places sync is not
built — UI must not claim "real reviews" until it is.
