/**
 * Dev-server endpoint for record.html: saves voice clips into public/voice and keeps
 * public/voice/manifest.json (clip id → file extension) in step. Only active under `vite` (serve).
 */
import { mkdir, writeFile, readFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';

const EXTENSIONS = new Set(['m4a', 'webm', 'mp3', 'ogg']);
const MAX_BYTES = 5_000_000;

async function readManifest(file) {
  try {
    const m = JSON.parse(await readFile(file, 'utf8'));
    return m && typeof m === 'object' ? m : {};
  } catch { return {}; }
}

export function voiceRecorder() {
  return {
    name: 'voice-recorder',
    apply: 'serve',
    configureServer(server) {
      const dir = join(server.config.root, 'public', 'voice');
      const manifestFile = join(dir, 'manifest.json');
      server.middlewares.use('/__voice', async (req, res) => {
        const fail = (code) => { res.statusCode = code; res.end(); };
        try {
          const url = new URL(req.url ?? '', 'http://localhost');
          const id = url.searchParams.get('id') ?? '';
          const ext = url.searchParams.get('ext') ?? '';
          if (!/^[0-9a-f]{8}$/.test(id)) return fail(400);
          if (req.method !== 'PUT' && req.method !== 'DELETE') return fail(405);
          let body = null;
          if (req.method === 'PUT') {
            if (!EXTENSIONS.has(ext)) return fail(400);
            const chunks = [];
            let size = 0;
            for await (const c of req) { size += c.length; if (size > MAX_BYTES) return fail(413); chunks.push(c); }
            body = Buffer.concat(chunks);
            if (!body.length) return fail(400);
          }
          await mkdir(dir, { recursive: true });
          const manifest = await readManifest(manifestFile);
          if (manifest[id]) await unlink(join(dir, `${id}.${manifest[id]}`)).catch(() => {});
          if (body) { await writeFile(join(dir, `${id}.${ext}`), body); manifest[id] = ext; }
          else delete manifest[id];
          const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
          await writeFile(manifestFile, JSON.stringify(sorted, null, 1) + '\n');
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify(sorted));
        } catch (e) {
          res.statusCode = 500; res.end(String(e));
        }
      });
    },
  };
}
