# TrainNote

Simple note-taking app with an Express backend serving static UI from `public/` and a small JSON-backed API at `/api/notes`.

Run:

```bash
npm install
npm run dev
# or
npm start
```

API:
- `GET /api/notes` - list notes
- `POST /api/notes` - create `{ content }`
- `DELETE /api/notes/:id` - delete note
