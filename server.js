import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import url from 'url';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000; // Default to 3000 if env var not set
const HOST = process.env.HOST || '0.0.0.0';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

const dataFile = path.join(__dirname, 'data', 'notes.json');

async function readNotes() {
  try {
    const txt = await fs.readFile(dataFile, 'utf8');
    return JSON.parse(txt || '[]');
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeNotes(notes) {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(notes, null, 2), 'utf8');
}

app.get('/api/notes', async (req, res, next) => {
  try {
    const notes = await readNotes();
    res.json(notes);
  } catch (err) { next(err); }
});

app.post('/api/notes', async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || typeof content !== 'string') return res.status(400).json({ error: 'content required' });
    const notes = await readNotes();
    const id = 'note' + Date.now();
    const note = { id, content };
    notes.push(note);
    await writeNotes(notes);
    res.status(201).json(note);
  } catch (err) { next(err); }
});

app.delete('/api/notes/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    let notes = await readNotes();
    const origLen = notes.length;
    notes = notes.filter(n => n.id !== id);
    if (notes.length === origLen) return res.status(404).json({ error: 'not found' });
    await writeNotes(notes);
    res.status(204).end();
  } catch (err) { next(err); }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const server = app.listen(PORT, HOST, () => {
  const addr = server.address();
  let host = 'localhost';
  let port = typeof addr === 'string' ? addr : addr.port;
  if (addr && typeof addr === 'object') {
    host = (addr.address === '::' || addr.address === '0.0.0.0') ? 'localhost' : addr.address;
  }
  console.log(`Server listening on http://${host}:${port}`);
});
